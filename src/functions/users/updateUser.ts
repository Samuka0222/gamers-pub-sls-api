import {
	AdminUpdateUserAttributesCommand,
	UserNotFoundException,
} from '@aws-sdk/client-cognito-identity-provider';
import { cognitoClient } from '@libs/cognitoClient';
import { bodyParser } from '@utils/bodyParser';
import { response } from '@utils/response';
import { APIGatewayProxyEventV2WithJWTAuthorizer } from 'aws-lambda';

export async function handler(event: APIGatewayProxyEventV2WithJWTAuthorizer) {
	try {
		const userId = event.requestContext.authorizer.jwt.claims.sub as string;
		if (!userId) {
			return response(401, { message: 'Unauthorized' });
		}
		const { firstName, lastName, nickname } = bodyParser(event.body);

		const command = new AdminUpdateUserAttributesCommand({
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
					Value: nickname,
				},
			],
		});

		await cognitoClient.send(command);
		return response(200, { message: 'Account sucessfully updated.' });
	} catch (error) {
		if (error instanceof UserNotFoundException) {
			return response(404, { message: 'User not found' });
		}
		return response(500, { error });
	}
}
