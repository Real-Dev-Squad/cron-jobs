import { handleConfig } from '../config/config';
import { env } from '../types/global.types';

export async function ping(env: env) {
	const url = handleConfig(env);
	const response = await fetch(`${url.baseUrl}/healthcheck`);
	return response;
}
