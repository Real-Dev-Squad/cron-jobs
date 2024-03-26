import { KVNamespace } from '@cloudflare/workers-types';

import config from '../config/config';
import { NAMESPACE_NAME } from '../constants';
import { updateUserRoles } from '../services/discordBotServices';
import { getMissedUpdatesUsers } from '../services/rdsBackendService';
import { DiscordUserRole, env, NicknameUpdateResponseType } from '../types/global.types';
import { fireAndForgetApiCall } from '../utils/apiCaller';
import { chunks } from '../utils/arrayUtils';
import { generateJwt } from '../utils/generateJwt';

export async function ping(env: env) {
	const url = config(env).RDS_BASE_API_URL;
	const response = await fetch(`${url}/healthcheck`);
	return response;
}

export async function callDiscordNicknameBatchUpdateHandler(env: env) {
	const namespace = env[NAMESPACE_NAME] as unknown as KVNamespace;
	let lastNicknameUpdate: string | null = '0';
	try {
		lastNicknameUpdate = await namespace.get('DISCORD_NICKNAME_UPDATED_TIME');
		if (lastNicknameUpdate === null) {
			throw new Error('Error while fetching KV "DISCORD_NICKNAME_UPDATED_TIME" timestamp');
		}
		if (!lastNicknameUpdate) {
			lastNicknameUpdate = '0';
		}
	} catch (err) {
		console.error(err, 'Error while fetching the timestamp for last nickname update');
		throw err;
	}

	const url = config(env).RDS_BASE_API_URL;
	let token;
	try {
		token = await generateJwt(env);
	} catch (err) {
		console.error(`Error while generating JWT token: ${err}`);
		throw err;
	}
	const response = await fetch(`${url}/discord-actions/nickname/status`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			lastNicknameUpdate,
		}),
	});
	if (!response.ok) {
		throw new Error("Error while trying to update users' discord nickname");
	}

	const data: NicknameUpdateResponseType = await response.json();
	if (data?.data.unsuccessfulNicknameUpdates === 0) {
		try {
			await namespace.put('DISCORD_NICKNAME_UPDATED_TIME', Date.now().toString());
		} catch (err) {
			console.error('Error while trying to update the last nickname change timestamp');
		}
	}
	return data;
}

export const addMissedUpdatesRoleHandler = async (env: env) => {
	const MAX_ROLE_UPDATE = 25;
	try {
		let cursor: string | undefined = undefined;
		for (let index = MAX_ROLE_UPDATE; index > 0; index--) {
			if (index < MAX_ROLE_UPDATE && !cursor) break;

			const missedUpdatesUsers = await getMissedUpdatesUsers(env, cursor);

			if (!!missedUpdatesUsers && missedUpdatesUsers.usersToAddRole?.length >= 1) {
				const discordUserIdRoleIdList: DiscordUserRole[] = missedUpdatesUsers.usersToAddRole.map((userId) => ({
					userid: userId,
					roleid: config(env).MISSED_UPDATES_ROLE_ID,
				}));

				const discordUserRoleChunks = chunks(discordUserIdRoleIdList, MAX_ROLE_UPDATE);
				for (const discordUserRoleList of discordUserRoleChunks) {
					try {
						await updateUserRoles(env, discordUserRoleList);
					} catch (error) {
						console.error('Error occurred while updating discord users', error);
					}
				}
			}
			cursor = missedUpdatesUsers?.cursor;
		}
		// add logs for the results https://github.com/Real-Dev-Squad/website-backend/issues/1784
	} catch (err) {
		console.error('Error while adding missed updates roles');
	}
};

export const syncUsersStatusHandler = async (env: env) => {
	fireAndForgetApiCall(env, 'users/status/sync', 'PATCH');
};

export const syncExternalAccountsHandler = async (env: env) => {
	fireAndForgetApiCall(env, 'external-accounts/users?action=discord-users-sync', 'POST');
};

export const syncUnverifiedUsersHandler = async (env: env) => {
	fireAndForgetApiCall(env, 'users', 'POST');
};

export const syncIdleUsersHandler = async (env: env) => {
	fireAndForgetApiCall(env, 'discord-actions/group-idle', 'PUT');
};

export const syncNickNamesHandler = async (env: env) => {
	fireAndForgetApiCall(env, 'discord-actions/nicknames/sync?dev=true', 'POST');
};

export const syncIdle7dUsersHandler = async (env: env) => {
	fireAndForgetApiCall(env, 'discord-actions/group-idle-7d', 'PUT');
};

export const syncOnboarding31dPlusUsersHandler = async (env: env) => {
	fireAndForgetApiCall(env, 'discord-actions/group-onboarding-31d-plus', 'PUT');
};
