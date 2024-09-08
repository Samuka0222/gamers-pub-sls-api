import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoClient } from '@libs/dynamoClient';
import { bodyParser } from '@utils/bodyParser';
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

		const updatedReview = bodyParser(event.body);
		if (!updatedReview) {
			return response(404, {
				Error: 'You must inform the changes for the update operations.',
			});
		}

		const command = new UpdateCommand({
			TableName: 'GamersPubTable',
			Key: {
				pk: `USER#${userId}`,
				sk: `REVIEW#${reviewId}`,
			},
			UpdateExpression: 'set #review = :r',
			ExpressionAttributeNames: {
				'#review': 'review',
			},
			ExpressionAttributeValues: {
				':r': updatedReview,
			},
		});

		await dynamoClient.send(command);
		return response(204);
	} catch (error) {
		return response(500, { error });
	}
}
