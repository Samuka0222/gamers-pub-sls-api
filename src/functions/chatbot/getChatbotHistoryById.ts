import { APIGatewayProxyEventV2WithJWTAuthorizer } from 'aws-lambda';
import { ResourceNotFoundException } from '@aws-sdk/client-dynamodb';
import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoClient } from '@libs/dynamoClient';
import { response } from '@utils/response';

export async function handler(event: APIGatewayProxyEventV2WithJWTAuthorizer) {
	try {
		const userId = event.requestContext.authorizer.jwt.claims.sub as string;
		if (!userId) {
			return response(401, 'Unauthorized');
		}

		const { chatHistoryId } = event.pathParameters!;
		if (!chatHistoryId) {
			return response(400, 'Invalid chatHistoryId');
		}

		const command = new GetCommand({
			TableName: 'GamersPubTable',
			Key: {
				pk: `USER#${userId}`,
				sk: `CH#${chatHistoryId}`,
			},
			AttributesToGet: ['created_at', 'chatbot_history'],
		});

		const { Item } = await dynamoClient.send(command);
		if (!Item) {
			return response(404, 'Chat history not found');
		}

		return response(200, { chat_history: Item });
	} catch (error) {
		if (error instanceof ResourceNotFoundException) {
			return response(404, 'Chat history not found');
		}
	}
}
