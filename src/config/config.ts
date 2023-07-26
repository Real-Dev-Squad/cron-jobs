import { env } from '../types/global.types';

export const handleConfig = (env: env) => {
	let baseUrl: string;
	if (env.CURRENT_ENVIRONMENT) {
		if (env.CURRENT_ENVIRONMENT == 'production') {
			baseUrl = 'https://api.realdevsquad.com';
		} else {
			baseUrl = 'https://staging-api.realdevsquad.com';
		}
	} else {
		baseUrl = 'https://staging-api.realdevsquad.com';
	}
	return { baseUrl };
};
