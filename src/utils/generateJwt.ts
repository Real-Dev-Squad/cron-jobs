import jwt from '@tsndr/cloudflare-worker-jwt';

import { env } from '../types/global.types';

export const generateJwt = async (env: env) => {
	try {
		const authToken = await jwt.sign(
			{
				name: 'Cron Job Handler',
				exp: Math.floor(Date.now() / 1000) + 60,
			},
			env.CRON_JOB_PRIVATE_KEY,
			{ algorithm: 'RS256' },
		);

		return authToken;
	} catch (err) {
		throw new Error('Error in generating the auth token');
	}
};

export const generateDiscordBotJwt = async (env: env) => {
	try {
		//TODO(@Ajeyakrishna-k): remove dev flag https://github.com/Real-Dev-Squad/discord-slash-commands/issues/193
		const privateKey = env.DEV ? env.DISCORD_SERVICE_PRIVATE_KEY : env.DISCORD_BOT_PRIVATE_KEY;
		const authToken = await jwt.sign(
			{
				exp: Math.floor(Date.now() / 1000) + 60,
			},
			privateKey,
			{ algorithm: 'RS256' },
		);
		return authToken;
	} catch (err) {
		throw new Error('Error in generating the auth token');
	}
};
