import { supabase } from '@libs/supabaseClient';
import { response } from '@utils/response';

export async function handler() {
	try {
		const { data, error } = await supabase
			.from('reviews')
			.select('*')
			.order('created_at', { ascending: false })
			.limit(7);

		if (error) {
			console.log('Error inserting review: ' + error);
			return response(500, { error: 'Error inserting review: ' + error });
		}

		return response(200, { data });
	} catch (error) {
		console.log(error);
		return response(500, { Error: 'Unexpected error: ' + error });
	}
}
