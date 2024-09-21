import { UserNotFoundException } from '@aws-sdk/client-cognito-identity-provider';
import {
	GetObjectCommand,
	HeadObjectCommand,
	S3ServiceException,
} from '@aws-sdk/client-s3';
import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { dynamoClient } from '@libs/dynamoClient';
import { response } from '@utils/response';
import { APIGatewayProxyEventV2WithJWTAuthorizer } from 'aws-lambda';
import { s3Client } from '@libs/s3Client';

export async function handler(event: APIGatewayProxyEventV2WithJWTAuthorizer) {
	try {
		const userID = event.requestContext.authorizer.jwt.claims.sub as string;
		if (!userID) {
			return response(401, { message: 'Unauthorized' });
		}

		const dynamoCommand = new GetCommand({
			TableName: 'GamersPubTable',
			Key: {
				pk: `USER#${userID}`,
				sk: `USER#${userID}`,
			},
			AttributesToGet: ['first_name', 'last_name', 'username', 'email'],
		});

		const { Item } = await dynamoClient.send(dynamoCommand);

		const findUserProfileCommand = new HeadObjectCommand({
			Bucket: 'gamers-pub-bucket',
			Key: `uploads/USER#${userID}`,
		});

		const userProfileExist = await s3Client.send(findUserProfileCommand);
		console.log(userProfileExist);

		if (userProfileExist) {
			const s3Command = new GetObjectCommand({
				Bucket: 'gamers-pub-bucket',
				Key: `uploads/USER#${userID}`,
			});

			const fileSignedUrl = await getSignedUrl(s3Client, s3Command, {
				expiresIn: 500,
			});

			const result = {
				profilePicture: fileSignedUrl,
				...Item,
			};

			return response(200, result);
		} else {
			const result = {
				profilePicture: undefined,
				...Item,
			};
			return response(200, result);
		}
	} catch (error) {
		console.log(error);
		if (error instanceof UserNotFoundException) {
			return response(404, { message: 'User not found' });
		}

		if (error instanceof S3ServiceException) {
			return response(400, {
				error: error.message,
			});
		}

		return response(500, { error });
	}
}
