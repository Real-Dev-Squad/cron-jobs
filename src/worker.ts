import {
	addMissedUpdatesRoleHandler,
	addProfileServiceBlockedRoleHandler,
	callDiscordNicknameBatchUpdateHandler,
	syncApiHandler,
} from './handlers/scheduledEventHandler';
import { env } from './types/global.types';

const EVERY_12_HOURS = '0 */12 * * *';
const EVERY_30_MINUTES = '*/30 * * * *';

export default {
	// eslint-disable-next-line no-unused-vars
	async scheduled(req: ScheduledController, env: env, ctx: ExecutionContext) {
		switch (req.cron) {
			case EVERY_12_HOURS: {
				await Promise.allSettled([
					callDiscordNicknameBatchUpdateHandler(env),
					addMissedUpdatesRoleHandler(env),
					addProfileServiceBlockedRoleHandler(env),
				]);
				break;
			}

			case EVERY_30_MINUTES: {
				await syncApiHandler(env);
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
