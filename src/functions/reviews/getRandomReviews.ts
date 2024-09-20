import { ResourceNotFoundException } from '@aws-sdk/client-dynamodb';
import { ScanCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoClient } from '@libs/dynamoClient';
import { response } from '@utils/response';
import { APIGatewayProxyEventV2 } from 'aws-lambda';

export async function handler(event: APIGatewayProxyEventV2) {
	try {
		const command = new ScanCommand({
			TableName: 'GamersPubTable',
			ScanFilter: {
				pk: {
					ComparisonOperator: 'BEGINS_WITH',
					AttributeValueList: [`USER#`],
				},
				sk: {
					ComparisonOperator: 'BEGINS_WITH',
					AttributeValueList: ['REVIEW#'],
				},
			},
			Limit: 8,
			AttributesToGet: ['created_at', 'review'],
		});
		const { Items } = await dynamoClient.send(command);
		return response(200, { Items });
	} catch (error) {
		if (error instanceof ResourceNotFoundException) {
			return response(404, 'Reviews not found');
		}
	}
}
