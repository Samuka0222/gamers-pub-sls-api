import { ForgotPasswordCommand } from '@aws-sdk/client-cognito-identity-provider';
import { cognitoClient } from '@libs/cognitoClient';
import { bodyParser } from '@utils/bodyParser';
import { response } from '@utils/response';
import { APIGatewayProxyEventV2 } from 'aws-lambda';

export async function handler(event: APIGatewayProxyEventV2) {
	try {
		const { email } = bodyParser(event.body);

		const command = new ForgotPasswordCommand({
			ClientId: process.env.COGNITO_CLIENT_ID,
			Username: email,
		});

		await cognitoClient.send(command);

		return response(204);
	} catch (error) {
		return response(500, { error: 'Try again later' });
	}
}
