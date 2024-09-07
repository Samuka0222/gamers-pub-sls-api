import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoClient } from '@libs/dynamoClient';
import { response } from '@utils/response';
import { PostConfirmationConfirmSignUpTriggerEvent } from 'aws-lambda';
import { randomUUID } from 'crypto';

export async function handler(
	event: PostConfirmationConfirmSignUpTriggerEvent,
) {
	try {
		const { email, given_name, family_name, nickname } =
			event.request.userAttributes;

		const pk = `USER#${randomUUID()}`;
		const command = new PutCommand({
			TableName: 'GamersPubTable',
			Item: {
				pk,
				sk: pk,
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

		const storeUserAction = await dynamoClient.send(command);

		return response(201, { storeUserAction });
	} catch (error) {
		console.log(error);
		return response(500, { error });
	}
}
