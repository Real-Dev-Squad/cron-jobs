import config from '../config/config';
import { env } from '../types/global.types';
import { generateJwt } from './generateJwt';

const createOptions = async (env: env): Promise<Record<string, any>> => {
	try {
		const token = await generateJwt(env);
		return {
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
		};
	} catch (error) {
		console.error(`Error while creating options: ${error}`);
		throw error;
	}
};

export const fireAndForgetApiCall = async (
	env: env,
	endpoint: string,
	method: string,
	options?: Record<string, any>,
): Promise<Response> => {
	const url = config(env).RDS_BASE_API_URL;
	try {
		const requestOptions = await createOptions(env);
		return fetch(`${url}/${endpoint}`, { method, ...requestOptions, ...options });
	} catch (error) {
		console.error(`Error during fire and forget API call: ${error}`);
		throw error;
	}
};

export const apiCaller = async (
	env: env,
	endpoint: string,
	method: string,
	options?: Record<string, any>,
): Promise<Record<string, any>> => {
	const url = config(env).RDS_BASE_API_URL;
	try {
		const requestOptions = await createOptions(env);
		const response = await fetch(`${url}/${endpoint}`, { method, ...requestOptions, ...options });
		return await response.json();
	} catch (error) {
		console.error(`Error during fetch operation: ${error}`);
		throw error;
	}
};
