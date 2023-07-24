import { env } from './types/global.types';

export default {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async fetch(request: Request, env: env, ctx: ExecutionContext): Promise<Response> {
		return new Response('Hello World!');
	},
};
