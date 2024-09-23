import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoClient } from '@libs/dynamoClient';
import { response } from '@utils/response';
import { PostConfirmationConfirmSignUpTriggerEvent } from 'aws-lambda';

export async function handler(
	event: PostConfirmationConfirmSignUpTriggerEvent,
) {
	try {
		const { email, given_name, family_name, nickname, sub } =
			event.request.userAttributes;

		const createUserRegisterCommand = new PutCommand({
			TableName: 'GamersPubTable',
			Item: {
				pk: `USER#${sub}`,
				sk: `USER#${sub}`,
				entity_type: 'user',
				email,
				first_name: given_name,
				last_name: family_name,
				username: nickname,
				created_at: new Date().toISOString(),
				gsi1_pk: email,
				gsi1_sk: 'user',
			},
		});

		await dynamoClient.send(createUserRegisterCommand);

		return response(201);
	} catch (error) {
		return response(500, { error });
	}
}
