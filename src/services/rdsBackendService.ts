import config from '../config/config';
import { DiscordUsersResponse, env } from '../types/global.types';
import { generateJwt } from '../utils/generateJwt';

export const getMissedUpdatesUsers = async (env: env, cursor: string | undefined) => {
	try {
		const baseUrl = config(env).RDS_BASE_API_URL;

		const url = new URL(`${baseUrl}/tasks/users/discord`);
		url.searchParams.append('q', 'status:missed-updates -days-count:3');
		if (cursor) {
			url.searchParams.append('cursor', cursor);
		}
		const token = await generateJwt(env);
		const response = await fetch(url, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
		});
		if (!response.ok) {
			throw new Error(`Fetch call to get user discord details failed with status: ${response.status}`);
		}

		const responseData: DiscordUsersResponse = await response.json();
		return responseData?.data;
	} catch (error) {
		console.error('Error occurred while fetching discord user details');
		throw error;
	}
};
