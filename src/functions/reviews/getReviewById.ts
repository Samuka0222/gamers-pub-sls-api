import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoClient } from '@libs/dynamoClient';
import { response } from '@utils/response';
import { APIGatewayProxyEventV2WithJWTAuthorizer } from 'aws-lambda';

export async function handler(event: APIGatewayProxyEventV2WithJWTAuthorizer) {
	try {
		const userId = event.requestContext.authorizer.jwt.claims.sub as string;
		if (!userId) {
			return response(401, 'Unauthorized');
		}

		const { reviewId } = event.pathParameters!;
		if (!reviewId) {
			return response(400, 'Invalid reviewId');
		}

		const command = new GetCommand({
			TableName: 'GamersPubTable',
			Key: {
				pk: `USER#${userId}`,
				sk: `REVIEW#${reviewId}`,
			},
		});

		const { Item } = await dynamoClient.send(command);
		if (!Item) {
			return response(404, 'Review not found');
		}

		return response(200, { review: Item });
	} catch (error) {
		return response(500, { error });
	}
}
