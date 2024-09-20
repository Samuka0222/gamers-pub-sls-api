import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoClient } from '@libs/dynamoClient';
import { S3Event } from 'aws-lambda';

export async function handler(event: S3Event) {
	const commands = event.Records.map((record) => {
		const fileKey = decodeURIComponent(record.s3.object.key);
		console.log(fileKey);

		const userId = fileKey.slice(13);

		return new UpdateCommand({
			TableName: 'GamersPubTable',
			Key: {
				pk: `USER#${userId}`,
				sk: `IMAGE#${userId}`,
			},
			UpdateExpression: 'SET #status = :s',
			ExpressionAttributeNames: {
				'#status': 'status',
			},
			ExpressionAttributeValues: {
				':s': { S: 'COMPLETED' },
			},
		});
	});

	await Promise.all(commands.map((command) => dynamoClient.send(command)));
}
