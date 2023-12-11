import { MISSED_UPDATES_DEVELOPMENT_ROLE_ID, MISSED_UPDATES_PROD_ROLE_ID, MISSED_UPDATES_STAGING_ROLE_ID } from '../constants/commons';
import { RDS_BASE_API_URL, RDS_BASE_DEVELOPMENT_API_URL, RDS_BASE_STAGING_API_URL } from '../constants/urls';
import { env, environment } from '../types/global.types';

const config = (env: env) => {
	const environment: environment = {
		production: {
			RDS_BASE_API_URL: RDS_BASE_API_URL,
			DISCORD_BOT_API_URL: env.DISCORD_BOT_API_URL,
			MISSED_UPDATES_ROLE_ID: MISSED_UPDATES_PROD_ROLE_ID,
		},
		staging: {
			RDS_BASE_API_URL: RDS_BASE_STAGING_API_URL,
			DISCORD_BOT_API_URL: env.DISCORD_BOT_API_URL,
			MISSED_UPDATES_ROLE_ID: MISSED_UPDATES_STAGING_ROLE_ID,
		},
		default: {
			RDS_BASE_API_URL: RDS_BASE_DEVELOPMENT_API_URL,
			DISCORD_BOT_API_URL: env.DISCORD_BOT_API_URL,
			MISSED_UPDATES_ROLE_ID: MISSED_UPDATES_DEVELOPMENT_ROLE_ID,
		},
	};

	return environment[env.CURRENT_ENVIRONMENT] || environment.default;
};
export default config;
