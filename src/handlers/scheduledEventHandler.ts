import { KVNamespace } from '@cloudflare/workers-types';

import config from '../config/config';
import { NAMESPACE_NAME } from '../constants';
import { updateUserRoles } from '../services/discordBotServices';
import { getMissedUpdatesUsers } from '../services/rdsBackendService';
import {
	DiscordUserRole,
	env,
	NicknameUpdateResponseType,
	OrphanTasksStatusUpdateResponseType,
	UserStatusResponse,
} from '../types/global.types';
import { apiCaller } from '../utils/apiCaller';
import { chunks } from '../utils/arrayUtils';
import { generateJwt } from '../utils/generateJwt';

export async function ping(env: env) {
	const url = config(env).RDS_BASE_API_URL;
	const response = await fetch(`${url}/healthcheck`);
	return response;
}

export async function callDiscordNicknameBatchUpdate(env: env) {
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

export const addMissedUpdatesRole = async (env: env) => {
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

export const syncUsersStatus = async (env: env): Promise<any | null> => {
	await apiCaller(env, 'users/status/update', 'PATCH');

	try {
		const idleUsersData = (await apiCaller(env, 'users/status?aggregate=true', 'GET')) as UserStatusResponse | undefined;

		if (!idleUsersData?.data?.users || idleUsersData.data.users.length === 0) {
			console.error('Error: Users data is not in the expected format or no users found');
			return null;
		}

		const response = await apiCaller(env, 'users/status/batch', 'PATCH', {
			body: JSON.stringify({ users: idleUsersData.data.users }),
		});

		return response;
	} catch (error) {
		console.error('Error during syncUsersStatus:', error);
		return null;
	}
};

export const syncExternalAccounts = async (env: env) => {
	return await apiCaller(env, 'external-accounts/users?action=discord-users-sync', 'POST');
};

export const syncUnverifiedUsers = async (env: env) => {
	return await apiCaller(env, 'users', 'POST');
};

export const syncIdleUsers = async (env: env) => {
	return await apiCaller(env, 'discord-actions/group-idle', 'PUT');
};

export const syncNickNames = async (env: env) => {
	return await apiCaller(env, 'discord-actions/nicknames/sync?dev=true', 'POST');
};

export const syncIdle7dUsers = async (env: env) => {
	return await apiCaller(env, 'discord-actions/group-idle-7d', 'PUT');
};

export const syncOnboarding31dPlusUsers = async (env: env) => {
	return await apiCaller(env, 'discord-actions/group-onboarding-31d-plus', 'PUT');
};

export async function filterOrphanTasks(env: env) {
	const namespace = env[NAMESPACE_NAME] as unknown as KVNamespace;
	let lastOrphanTasksFilteration: string | null = '0';
	try {
		lastOrphanTasksFilteration = await namespace.get('ORPHAN_TASKS_UPDATED_TIME');

		if (!lastOrphanTasksFilteration) {
			console.error('Error while fetching KV "ORPHAN_TASKS_UPDATED_TIME" timestamp');
			lastOrphanTasksFilteration = '0';
		}
	} catch (err) {
		console.error(err, 'Error while fetching the timestamp of last orphan tasks filteration');
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
	const response = await fetch(`${url}/tasks/orphanTasks`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			lastOrphanTasksFilteration,
		}),
	});
	if (!response.ok) {
		throw new Error('Error while trying to update status of orphan tasks to backlog');
	}

	const data: OrphanTasksStatusUpdateResponseType = await response.json();

	try {
		await namespace.put('ORPHAN_TASKS_UPDATED_TIME', Date.now().toString());
	} catch (err) {
		console.error('Error while trying to update the last orphan tasks filteration timestamp');
	}

	return data;
}
