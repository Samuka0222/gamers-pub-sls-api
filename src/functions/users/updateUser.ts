import {
	AdminUpdateUserAttributesCommand,
	UserNotFoundException,
} from '@aws-sdk/client-cognito-identity-provider';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { cognitoClient } from '@libs/cognitoClient';
import { dynamoClient } from '@libs/dynamoClient';
import { bodyParser } from '@utils/bodyParser';
import { response } from '@utils/response';
import { APIGatewayProxyEventV2WithJWTAuthorizer } from 'aws-lambda';

export async function handler(event: APIGatewayProxyEventV2WithJWTAuthorizer) {
	try {
		const userId = event.requestContext.authorizer.jwt.claims.sub as string;
		if (!userId) {
			return response(401, { message: 'Unauthorized' });
		}
		const { firstName, lastName, username, title } = bodyParser(event.body);

		const cognitoCommand = new AdminUpdateUserAttributesCommand({
			UserPoolId: process.env.COGNITO_POOL_ID,
			Username: userId,
			UserAttributes: [
				{
					Name: 'given_name',
					Value: firstName,
				},
				{
					Name: 'family_name',
					Value: lastName,
				},
				{
					Name: 'nickname',
					Value: username,
				},
			],
		});

		const dynamoCommand = new UpdateCommand({
			TableName: 'GamersPubTable',
			Key: {
				pk: `USER#${userId}`,
				sk: `USER#${userId}`,
			},
			UpdateExpression:
				'set #first_name = :fn, #last_name = :ln, #username = :u, #title = :t',
			ExpressionAttributeNames: {
				'#first_name': 'first_name',
				'#last_name': 'last_name',
				'#username': 'username',
				'#title': 'title',
			},
			ExpressionAttributeValues: {
				':fn': firstName,
				':ln': lastName,
				':u': username,
				':t': title,
			},
		});

		await cognitoClient.send(cognitoCommand);
		await dynamoClient.send(dynamoCommand);
		return response(200, { message: 'Account sucessfully updated.' });
	} catch (error) {
		console.log(error);
		if (error instanceof UserNotFoundException) {
			return response(404, { message: 'User not found' });
		}
		return response(500, { error });
	}
}
