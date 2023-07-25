import { env } from './types/global.types';

export default {
	// ToDo: remove the eslint disabled after proper implementation
	// eslint-disable-next-line no-unused-vars
	async fetch(request: Request, env: env, ctx: ExecutionContext): Promise<Response> {
		return new Response('Hello World!');
	},
};
