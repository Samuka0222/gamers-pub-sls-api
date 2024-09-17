import { DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoClient } from '@libs/dynamoClient';
import { response } from '@utils/response';
import { APIGatewayProxyEventV2WithJWTAuthorizer } from 'aws-lambda';

export async function handler(event: APIGatewayProxyEventV2WithJWTAuthorizer) {
	try {
		const userId = event.requestContext.authorizer.jwt.claims.sub as string;
		if (!userId) {
			return response(401, 'Unauthorized');
		}

		const { chatHistoryId } = event.pathParameters!;
		if (!chatHistoryId) {
			return response(400, 'Invalid chatbotHistoryId');
		}

		const command = new DeleteCommand({
			TableName: 'GamersPubTable',
			Key: {
				pk: `USER#${userId}`,
				sk: `CH#${chatHistoryId}`,
			},
		});

		await dynamoClient.send(command);
		return response(200, { message: 'Chatbot History deleted successfully' });
	} catch (error) {
		return response(500, { error });
	}
}
