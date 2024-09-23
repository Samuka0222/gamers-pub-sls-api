import { s3Client } from '@libs/s3Client';
import { GetObjectCommand, S3ServiceException } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { response } from '@utils/response';
import { APIGatewayProxyEventV2WithJWTAuthorizer } from 'aws-lambda';
import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoClient } from '@libs/dynamoClient';

export async function handler(event: APIGatewayProxyEventV2WithJWTAuthorizer) {
	try {
		const userId = event.requestContext.authorizer.jwt.claims.sub as string;
		if (!userId) {
			return response(401, { message: 'Unauthorized' });
		}

		const dynamoCommand = new GetCommand({
			TableName: 'GamersPubTable',
			Key: {
				pk: `USER#${userId}`,
				sk: `IMAGE#${userId}`,
			},
			AttributesToGet: ['status'],
		});

		const objectsExists = await dynamoClient.send(dynamoCommand);

		if (objectsExists.Item !== undefined) {
			const s3Command = new GetObjectCommand({
				Bucket: 'gamers-pub-bucket',
				Key: `uploads/USER#${userId}`,
			});

			const fileSignedUrl = await getSignedUrl(s3Client, s3Command, {
				expiresIn: 500,
			});

			return response(200, fileSignedUrl);
		} else {
			return response(204);
		}
	} catch (error) {
		console.log(error);
		if (error instanceof S3ServiceException) {
			return response(400, {
				error: error.message,
			});
		}

		return response(500, { error });
	}
}
