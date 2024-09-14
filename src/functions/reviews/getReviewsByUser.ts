import { ResourceNotFoundException } from '@aws-sdk/client-dynamodb';
import { ScanCommand } from '@aws-sdk/lib-dynamodb';
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

		let lastItem;

		if (event.body) {
			const { lastEvaluetedKey } = bodyParser(event.body);
			lastItem = lastEvaluetedKey;
		}

		const command = new ScanCommand({
			TableName: 'GamersPubTable',
			ScanFilter: {
				pk: {
					ComparisonOperator: 'EQ',
					AttributeValueList: [`USER#${userId}`],
				},
				sk: {
					ComparisonOperator: 'BEGINS_WITH',
					AttributeValueList: ['REVIEW#'],
				},
			},
			Limit: 5,
			ExclusiveStartKey: lastItem ?? undefined,
			AttributesToGet: ['created_at', 'review'],
		});
		const { Items, LastEvaluatedKey } = await dynamoClient.send(command);
		return response(200, { Items, LastEvaluatedKey });
	} catch (error) {
		if (error instanceof ResourceNotFoundException) {
			return response(404, 'Reviews not found');
		}
	}
}
