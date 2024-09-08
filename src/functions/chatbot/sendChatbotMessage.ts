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
} from '@google/generative-ai';
import { response as responseOperation } from '@utils/response';

export async function handler(event: APIGatewayProxyEventV2WithJWTAuthorizer) {
	try {
		const userId = event.requestContext.authorizer.jwt.claims.sub as string;

		if (!userId) {
			return responseOperation(401, 'Unauthorized');
		}

		const chatHistory = [
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

		console.log(event.body);
		const { userChatbotHistory, userPrompt } = bodyParser(event.body);

		if (userChatbotHistory) {
			chatHistory.concat(userChatbotHistory);
		}

		console.log(userPrompt);
		console.log(
			userChatbotHistory ? userChatbotHistory : 'Nenhum histórico encontrado',
		);

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
			history: chatHistory,
			generationConfig: {
				temperature: 1,
			},
		});

		const prompt = userPrompt;
		const result = await chat.sendMessage(prompt);
		const response = await result.response;
		const text = response.text();
		return responseOperation(200, { text });
	} catch (error) {
		console.log(error);
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
