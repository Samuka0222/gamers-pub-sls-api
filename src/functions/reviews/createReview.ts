import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoClient } from '@libs/dynamoClient';
import { bodyParser } from '@utils/bodyParser';
import { response } from '@utils/response';
import { APIGatewayProxyEventV2WithJWTAuthorizer } from 'aws-lambda';
import { randomUUID } from 'crypto';
import { supabase } from '@libs/supabaseClient';

export async function handler(event: APIGatewayProxyEventV2WithJWTAuthorizer) {
	try {
		const userId = event.requestContext.authorizer.jwt.claims.sub as string;

		if (!userId) {
			return response(401, 'Unauthorized');
		}

		const review = bodyParser(event.body);

		if (!review) {
			return response(400, 'Invalid review data');
		}

		if (
			review.status === 'completed' &&
			!review.spoilers &&
			review.reviewText !== ''
		) {
			console.log('Inserting Review on Supabase');
			try {
				const newReview = {
					game_id: review.gameId,
					game_name: review.gameName,
					game_cover_url: review.gameCoverUrl,
					status: review.status,
					review_text: review.reviewText,
					spoilers: review.spoilers,
					platform: review.platform,
					rating: review.rating,
					start_date: review.startDate,
					end_date: review.endDate,
					time_played: review.timePlayed,
					mastered: review.mastered,
					author: review.author,
				};

				const result = await supabase.from('reviews').insert([newReview]);

				if (result.error) {
					console.log('Error inserting review: ' + result.error.message);
					return response(500, {
						error: 'Error inserting review: ' + result.error,
					});
				}
			} catch (error) {
				console.log('Error with Lambda: ' + error);
				return response(500, { Error: 'Error with Lambda: ' + error });
			}
		}

		const id = `${randomUUID()}`;
		const command = new PutCommand({
			TableName: 'GamersPubTable',
			Item: {
				pk: `USER#${userId}`,
				sk: `REVIEW#${id}`,
				entity_type: 'review',
				review: { id, ...review },
				created_at: new Date().toISOString(),
			},
		});

		await dynamoClient.send(command);
		return response(201, { message: 'Review created successfully' });
	} catch (error) {
		return response(500, { error: 'Error creating review ' + error });
	}
}
