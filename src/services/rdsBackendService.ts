import config from '../config/config';
import { DiscordUsersResponse, env, ProfileServiceBlockedUsersResponse } from '../types/global.types';
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

export const getProfileServiceBlockedUsers = async (env: env, cursor: string | undefined) => {
	try {
		const baseUrl = config(env).RDS_BASE_API_URL;

		const url = new URL(`${baseUrl}/users`);
		url.searchParams.append('profileStatus', 'BLOCKED');
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
			throw new Error(`Fetch call to get profile service blocked users failed with status: ${response.status}`);
		}

		const responseData: ProfileServiceBlockedUsersResponse = await response.json();

		return responseData.users.filter((user) => user.discordId && user.roles?.in_discord).map((user) => user.discordId!);
	} catch (error) {
		console.error('Error occurred while fetching profile service blocked users', error);
		throw error;
	}
};
