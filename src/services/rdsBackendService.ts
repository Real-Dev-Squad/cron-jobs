import config from '../config/config';
import { DiscordUserIdList, env } from '../types/global.types';
import { generateJwt } from '../utils/generateJwt';

export const getMissedUpdatesUsers = async (env: env) => {
	try {
		const url = config(env).RDS_BASE_API_URL;
		const token = await generateJwt(env);
		const response = await fetch(`${url}/tasks/users/discord?q=status:missed-updates`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
		});
		if (!response.ok) {
			throw new Error(`Fetch call to get user discord details failed with status: ${response.status}`);
		}

		const data: DiscordUserIdList = await response.json();
		return data;
	} catch (error) {
		console.error('Error occurrent while fetching discord user details');
		throw error;
	}
};
