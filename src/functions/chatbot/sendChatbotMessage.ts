import { bodyParser } from '@utils/bodyParser';
import { APIGatewayProxyEventV2WithJWTAuthorizer } from 'aws-lambda';
import {
	GoogleGenerativeAI,
	HarmBlockThreshold,
	HarmCategory,
	GoogleGenerativeAIError,
	GoogleGenerativeAIFetchError,
	GoogleGenerativeAIRequestInputError,
	GoogleGenerativeAIResponseError,
	Content,
} from '@google/generative-ai';
import { response as responseOperation } from '@utils/response';
import { dynamoClient } from '@libs/dynamoClient';
import { GetCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';

export async function handler(event: APIGatewayProxyEventV2WithJWTAuthorizer) {
	try {
		const userId = event.requestContext.authorizer.jwt.claims.sub as string;

		if (!userId) {
			return responseOperation(401, 'Unauthorized');
		}

		const { chatHistoryId } = event.pathParameters!;
		const { userPrompt } = bodyParser(event.body);

		const id = chatHistoryId !== '' ? chatHistoryId : randomUUID();

		const chatbotInstructions: Content[] = [
			{
				role: 'user',
				parts: [
					{
						text: 'Você é o bot do Gamers Pub que recomenda jogos baseado nas características que o usuário enviar. Quando alguém lhe pedir uma lista de recomendações, você deve recomendar no máximo 5 jogos. Você deve falar um breve resumo de cada jogo que você recomendar e fale em quais plataformas o jogo está disponível. Você não deve responder outras perguntas que não seja pedindo recomendação de jogos. Caso o usuário pergunte sobre um jogo especifico, você pode falar mais sobre tal jogo mas tente resumir. Você tem a liberdade de responder em qualquer idioma que usuário perguntar.',
					},
				],
			},
			{
				role: 'model',
				parts: [
					{
						text: 'Certo, a partir de agora sou o Bartender do Gamers Pub!',
					},
				],
			},
		];

		const getChatHistory = async () => {
			if (!chatHistoryId) {
				try {
					const command = new PutCommand({
						TableName: 'GamersPubTable',
						Item: {
							pk: `USER#${userId}`,
							sk: `CH#${id}`,
							entity_type: 'chatbot-history',
							chatbot_history: [],
							created_at: new Date().toISOString(),
						},
					});

					await dynamoClient.send(command);
					return { id, chatbotHistory: [] };
				} catch (error) {
					throw new Error('It was not possible to create this chat.');
				}
			} else {
				try {
					const command = new GetCommand({
						TableName: 'GamersPubTable',
						Key: {
							pk: `USER#${userId}`,
							sk: `CH#${chatHistoryId}`,
						},
						AttributesToGet: ['created_at', 'chatbot_history'],
					});

					const { Item } = await dynamoClient.send(command);
					return { id: chatHistoryId, chatbotHistory: Item!.chatbot_history };
				} catch (error) {
					throw new Error('It was not possible to get the chat history.');
				}
			}
		};

		const conversationHistory = (await getChatHistory())
			.chatbotHistory as Content[];

		const safetySettings = [
			{
				category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
				threshold: HarmBlockThreshold.BLOCK_NONE,
			},
		];
		const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
		const model = genAI.getGenerativeModel({
			model: 'gemini-1.5-flash',
			safetySettings,
		});

		const chat = model.startChat({
			history: [...chatbotInstructions, ...conversationHistory],
			generationConfig: {
				temperature: 1,
			},
		});

		const prompt = userPrompt;
		const result = await chat.sendMessage(prompt);
		const response = await result.response;
		const text = response.text();

		if (text.includes('ERROR')) {
			return responseOperation(500, {
				message: 'Error processing the request',
			});
		}

		const updatedChatHistory = [
			...conversationHistory,
			{
				role: 'user',
				parts: [
					{
						text: prompt,
					},
				],
			},
			{
				role: 'model',
				parts: [
					{
						text: text,
					},
				],
			},
		];

		const command = new UpdateCommand({
			TableName: 'GamersPubTable',
			Key: {
				pk: `USER#${userId}`,
				sk: `CH#${id}`,
			},
			UpdateExpression: 'set #chatbot_history = :ch',
			ExpressionAttributeNames: {
				'#chatbot_history': 'chatbot_history',
			},
			ExpressionAttributeValues: {
				':ch': updatedChatHistory,
			},
		});

		await dynamoClient.send(command);

		return responseOperation(200, { id, updatedChatHistory, text });
	} catch (error) {
		if (error instanceof GoogleGenerativeAIError) {
			return responseOperation(500, { message: error.message });
		}

		if (error instanceof GoogleGenerativeAIResponseError) {
			return responseOperation(500, { message: error.message });
		}

		if (error instanceof GoogleGenerativeAIFetchError) {
			return responseOperation(500, { message: error.message });
		}

		if (error instanceof GoogleGenerativeAIRequestInputError) {
			return responseOperation(500, { message: error.message });
		}
	}
}
