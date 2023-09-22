import { env } from '../types/global.types';

export const handleConfig = (env: env) => {
	let baseUrl: string;
	if (env.CURRENT_ENVIRONMENT) {
		if (env.CURRENT_ENVIRONMENT.toLowerCase() === 'production') {
			baseUrl = 'https://api.realdevsquad.com';
		} else {
			baseUrl = 'https://staging-api.realdevsquad.com';
		}
	} else {
		baseUrl = 'https://93f5-49-204-135-151.ngrok.io';
	}
	return { baseUrl };
};
