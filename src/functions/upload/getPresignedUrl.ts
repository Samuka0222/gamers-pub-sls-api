import crypto, { randomUUID } from 'node:crypto';

import { APIGatewayProxyEventV2WithJWTAuthorizer } from 'aws-lambda';
import { PutObjectCommand, S3ServiceException } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client } from '@libs/s3Client';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
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

		const fileKey = `uploads/${crypto.randomUUID()}-${fileName}`;

		const s3Command = new PutObjectCommand({
			Bucket: 'gamers-pub-bucket',
			Key: fileKey,
		});

		const dynamoCommand = new PutCommand({
			TableName: 'GamersPubTable',
			Item: {
				pk: `USER#${userId}`,
				sk: `IMAGE#${randomUUID()}`,
				fileKey: fileKey,
				originalFileName: fileName,
				status: 'PENDING',
			},
		});

		const signedUrl = await getSignedUrl(s3Client, s3Command, {
			expiresIn: 120,
		});
		await dynamoClient.send(dynamoCommand);

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
