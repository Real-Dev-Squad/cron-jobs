import jwt from '@tsndr/cloudflare-worker-jwt';

import { generateJwt } from '../utils/generateJwt';
import { privateKey } from './config/keys';

describe('Mock test', () => {
	let signSpy: jest.SpyInstance<Promise<string>>;
	beforeEach(() => {
		signSpy = jest.spyOn(jwt, 'sign');
	});
	afterEach(() => {
		signSpy.mockReset();
	});
	test('Generate JWT function works', async () => {
		signSpy.mockResolvedValue('Hello');
		const authToken = await generateJwt({ CRON_JOB_PRIVATE_KEY: privateKey });
		expect(authToken).not.toBeUndefined();
	});
	test('Should call sign method', async () => {
		signSpy.mockResolvedValue('Hello');
		await generateJwt({ CRON_JOB_PRIVATE_KEY: privateKey });
		expect(signSpy).toBeCalledTimes(1);
	});
	test('Should return promise without await', async () => {
		signSpy.mockResolvedValue('Hello');
		const authToken = generateJwt({ CRON_JOB_PRIVATE_KEY: privateKey });
		expect(authToken).toBeInstanceOf(Promise);
	});
	test('Throws an error if generation fails', async () => {
		signSpy.mockRejectedValue('Error');
		await generateJwt({ CRON_JOB_PRIVATE_KEY: privateKey }).catch((err) => {
			expect(err).toBeInstanceOf(Error);
			expect(err.message).toEqual('Error in generating the auth token');
		});
	});
});
