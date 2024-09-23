import {
	ForbiddenException,
	UserNotFoundException,
} from '@aws-sdk/client-cognito-identity-provider';

import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoClient } from '@libs/dynamoClient';
import { response } from '@utils/response';
import { APIGatewayProxyEventV2WithJWTAuthorizer } from 'aws-lambda';

export async function handler(event: APIGatewayProxyEventV2WithJWTAuthorizer) {
	try {
		const userID = event.requestContext.authorizer.jwt.claims.sub as string;
		if (!userID) {
			return response(401, { message: 'Unauthorized' });
		}

		const dynamoCommand = new GetCommand({
			TableName: 'GamersPubTable',
			Key: {
				pk: `USER#${userID}`,
				sk: `USER#${userID}`,
			},
			AttributesToGet: [
				'first_name',
				'last_name',
				'username',
				'email',
				'title',
			],
		});

		const { Item } = await dynamoClient.send(dynamoCommand);

		return response(200, { ...Item });
	} catch (error) {
		console.log(error);
		if (error instanceof ForbiddenException) {
			return response(403, { message: 'Forbidden' });
		}

		if (error instanceof UserNotFoundException) {
			return response(404, { message: 'User not found' });
		}

		return response(500, { error });
	}
}
