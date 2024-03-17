import config from '../config/config';
import { env } from '../types/global.types';
import { generateJwt } from './generateJwt';

export const apiCaller = async (
	env: env,
	endpoint: string,
	method: string,
	options?: Record<string, any>,
): Promise<Record<string, any>> => {
	const url = config(env).RDS_BASE_API_URL;
	let token;
	try {
		token = await generateJwt(env);
	} catch (err) {
		console.error(`Error while generating JWT token: ${err}`);
		throw err;
	}

	const defaultOptions = {
		method,
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json',
		},
	};

	try {
		const response = await fetch(`${url}/${endpoint}`, { ...defaultOptions, ...options });
		return await response.json();
	} catch (error) {
		// TODO: Handle these errors: log to newRelic or any other better approach
		console.error(`Error during fetch operation: ${error}`);
		throw error;
	}
};
