import { addMissedUpdatesRole, callDiscordNicknameBatchUpdate } from './handlers/scheduledEventHandler';
import { env } from './types/global.types';

const EVERY_6_HOURS = '0 */6 * * *';
const EVERY_11_HOURS = '0 */11 * * *';

export default {
	// eslint-disable-next-line no-unused-vars
	async scheduled(req: ScheduledController, env: env, ctx: ExecutionContext) {
		switch (req.cron) {
			case EVERY_6_HOURS: {
				return await callDiscordNicknameBatchUpdate(env);
			}
			case EVERY_11_HOURS: {
				return await addMissedUpdatesRole(env);
			}
			default:
				console.error('Unknown Trigger Value!');
		}
	},
	// We need to keep all 3 parameters in this format even if they are not used as as cloudflare workers need them to be present So we are disabling eslint rule of no-unused-vars
	// for more details read here: https://community.cloudflare.com/t/waituntil-is-not-a-function-when-using-workers-with-modules/375781/4
	// eslint-disable-next-line no-unused-vars
	async fetch(req: Request, env: env, ctx: ExecutionContext): Promise<Response> {
		return new Response('Hello World!');
	},
};
