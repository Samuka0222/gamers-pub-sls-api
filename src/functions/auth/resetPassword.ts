import {
	ConfirmForgotPasswordCommand,
	InvalidLambdaResponseException,
	UnexpectedLambdaException,
} from '@aws-sdk/client-cognito-identity-provider';
import { cognitoClient } from '@libs/cognitoClient';
import { bodyParser } from '@utils/bodyParser';
import { response } from '@utils/response';
import { APIGatewayProxyEventV2 } from 'aws-lambda';

export async function handler(event: APIGatewayProxyEventV2) {
	try {
		const { email, code, newPassword } = bodyParser(event.body);

		const command = new ConfirmForgotPasswordCommand({
			ClientId: process.env.COGNITO_CLIENT_ID,
			Username: email,
			ConfirmationCode: code,
			Password: newPassword,
		});

		await cognitoClient.send(command);

		return response(204);
	} catch (error) {
		if (
			error instanceof InvalidLambdaResponseException ||
			error instanceof UnexpectedLambdaException
		) {
			return response(200, { message: 'Account confirmed successfully!' });
		}
		return response(500, { Error: 'Try again' });
	}
}
