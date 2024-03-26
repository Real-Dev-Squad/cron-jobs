import {
	addMissedUpdatesRole,
	callDiscordNicknameBatchUpdate,
	syncExternalAccounts,
	syncIdle7dUsers,
	syncIdleUsers,
	syncOnboarding31dPlusUsers,
	syncUnverifiedUsers,
	syncUsersStatus,
} from './handlers/scheduledEventHandler';
import { env } from './types/global.types';

const EVERY_11_HOURS = '0 */11 * * *';
const EVERY_20_MINUTES = '*/20 * * * *';

export default {
	// eslint-disable-next-line no-unused-vars
	async scheduled(req: ScheduledController, env: env, ctx: ExecutionContext) {
		switch (req.cron) {
			case EVERY_11_HOURS: {
				callDiscordNicknameBatchUpdate(env);
				addMissedUpdatesRole(env);
				break;
			}

			case EVERY_20_MINUTES: {
				syncIdleUsers(env);
				//  syncNickNames(env); TODO: Enable it once changes from website-backend is merged
				syncIdle7dUsers(env);
				syncOnboarding31dPlusUsers(env);
				syncUsersStatus(env);
				syncExternalAccounts(env);
				syncUnverifiedUsers(env);
				console.log(`Worker for syncing idle users, nicknames, idle 7d users, and onboarding 31d+ users has completed.
				Worker for syncing user status, external accounts, and unverified users has completed.`);
				break;
			}

			default: {
				console.error('Unknown Trigger Value!');
				break;
			}
		}
	},
	// We need to keep all 3 parameters in this format even if they are not used as as cloudflare workers need them to be present So we are disabling eslint rule of no-unused-vars
	// for more details read here: https://community.cloudflare.com/t/waituntil-is-not-a-function-when-using-workers-with-modules/375781/4
	// eslint-disable-next-line no-unused-vars
	async fetch(req: Request, env: env, ctx: ExecutionContext): Promise<Response> {
		return new Response('Hello World!');
	},
};
