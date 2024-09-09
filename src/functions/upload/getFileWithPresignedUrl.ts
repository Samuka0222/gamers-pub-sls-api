import { APIGatewayProxyEventV2WithJWTAuthorizer } from 'aws-lambda';
import {
	GetObjectCommand,
	S3Client,
	S3ServiceException,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { response } from '../../utils/response';
import { bodyParser } from '../../utils/bodyParser';

const s3Client = new S3Client();

export async function handler(event: APIGatewayProxyEventV2WithJWTAuthorizer) {
	try {
		const { fileKey, expiresIn } = bodyParser(event.body);

		if (!fileKey) {
			return response(400, {
				error: 'File Key is required',
			});
		}

		const s3Command = new GetObjectCommand({
			Bucket: 'gamers-pub-bucket',
			Key: String(fileKey),
		});

		const fileSignedUrl = await getSignedUrl(s3Client, s3Command, {
			expiresIn: expiresIn ?? 60,
		});

		return response(200, { fileSignedUrl });
	} catch (error) {
		console.log(error);
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
