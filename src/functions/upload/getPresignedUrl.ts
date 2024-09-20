import { APIGatewayProxyEventV2WithJWTAuthorizer } from 'aws-lambda';
import { PutObjectCommand, S3ServiceException } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client } from '@libs/s3Client';
import { GetCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoClient } from '@libs/dynamoClient';
import { response } from '../../utils/response';
import { bodyParser } from '../../utils/bodyParser';

export async function handler(event: APIGatewayProxyEventV2WithJWTAuthorizer) {
	try {
		const userId = event.requestContext.authorizer.jwt.claims.sub as string;

		if (!userId) {
			return response(401, 'Unauthorized');
		}

		const { fileName } = bodyParser(event.body);

		if (!fileName) {
			return response(400, {
				error: 'File Name is required',
			});
		}

		const fileKey = `uploads/USER#${userId}`;

		const s3Command = new PutObjectCommand({
			Bucket: 'gamers-pub-bucket',
			Key: fileKey,
		});

		const itemAlreadyExist = new GetCommand({
			TableName: 'GamersPubTable',
			Key: {
				pk: `USER#${userId}`,
				sk: `IMAGE#${userId}`,
			},
		});

		if (!itemAlreadyExist) {
			const dynamoCommand = new PutCommand({
				TableName: 'GamersPubTable',
				Item: {
					pk: `USER#${userId}`,
					sk: `IMAGE#${userId}`,
					entity_type: 'profile-picture',
					file_key: fileKey,
					original_file_name: fileName,
					status: 'PENDING',
				},
			});

			await dynamoClient.send(dynamoCommand);
		} else {
			const dynamoCommand = new UpdateCommand({
				TableName: 'GamersPubTable',
				Key: {
					pk: `USER#${userId}`,
					sk: `IMAGE#${userId}`,
				},
				UpdateExpression:
					'set #file_key = :fk, #original_file_name = :ofn, #status = :s',
				ExpressionAttributeNames: {
					'#file_key': 'file_key',
					'#original_file_name': 'original_file_name',
					'#status': 'status',
				},
				ExpressionAttributeValues: {
					':fk': fileKey,
					':ofn': fileName,
					':s': 'PENDING',
				},
			});

			await dynamoClient.send(dynamoCommand);
		}
		const signedUrl = await getSignedUrl(s3Client, s3Command, {
			expiresIn: 120,
		});

		return response(200, { signedUrl, fileKey });
	} catch (error) {
		if (error instanceof S3ServiceException) {
			return response(400, {
				error: error.message,
			});
		}

		return response(500, {
			error,
		});
	}
}
