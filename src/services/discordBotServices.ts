import config from '../config/config';
import { DiscordRoleUpdatedList, DiscordUserRole, env } from '../types/global.types';
import { generateDiscordBotJwt } from '../utils/generateJwt';

export const updateUserRoles = async (env: env, payload: DiscordUserRole[]): Promise<DiscordRoleUpdatedList> => {
	try {
		const url = config(env).DISCORD_BOT_API_URL;
		const token = await generateDiscordBotJwt(env);

		const response = await env.DISCORD_BOT.fetch(`${url}/roles?action=add-role`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(payload),
		});
		if (!response.ok) {
			throw Error(`Role Update failed with status: ${response.status}`);
		}
		const data: DiscordRoleUpdatedList = await response.json();
		return data;
	} catch (error) {
		console.error('Error while updating discord user roles');
		throw error;
	}
};
