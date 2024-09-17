import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoClient } from '@libs/dynamoClient';
import { bodyParser } from '@utils/bodyParser';
import { response } from '@utils/response';
import { APIGatewayProxyEventV2WithJWTAuthorizer } from 'aws-lambda';
import { randomUUID } from 'crypto';

export async function handler(event: APIGatewayProxyEventV2WithJWTAuthorizer) {
	try {
		const userId = event.requestContext.authorizer.jwt.claims.sub as string;

		if (!userId) {
			return response(401, 'Unauthorized');
		}

		const review = bodyParser(event.body);

		if (!review) {
			return response(400, 'Invalid review data');
		}

		const id = `${randomUUID()}`;
		const command = new PutCommand({
			TableName: 'GamersPubTable',
			Item: {
				pk: `USER#${userId}`,
				sk: `REVIEW#${id}`,
				entity_type: 'review',
				review: { id, ...review },
				created_at: new Date().toISOString(),
			},
		});

		await dynamoClient.send(command);
		return response(201, { message: 'Review created successfully' });
	} catch (error) {
		return response(500, { error: 'Error creating review ' + error });
	}
}
