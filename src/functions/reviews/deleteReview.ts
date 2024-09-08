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

		const reviewId = event.pathParameters!;
		if (!reviewId) {
			return response(400, 'Invalid reviewId');
		}

		const command = new DeleteCommand({
			TableName: 'GamersPubTable',
			Key: {
				pk: `USER#${userId}`,
				sk: `REVIEW#${reviewId}`,
			},
		});

		await dynamoClient.send(command);
		return response(200, { message: 'Review deleted successfully' });
	} catch (error) {
		return response(500, { error });
	}
}
