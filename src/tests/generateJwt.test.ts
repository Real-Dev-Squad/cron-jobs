import jwt from '@tsndr/cloudflare-worker-jwt';

import { generateDiscordBotJwt, generateJwt } from '../utils/generateJwt';
import { privateKey } from './config/keys';

describe('Generate Jwt', () => {
	let signSpy: jest.SpyInstance<Promise<string>>;
	beforeEach(() => {
		signSpy = jest.spyOn(jwt, 'sign');
	});
	afterEach(() => {
		signSpy.mockReset();
	});
	describe('For Rds Backend', () => {
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

	describe('For Discord Bot', () => {
		test('Generate JWT function works', async () => {
			signSpy.mockResolvedValue('Hello');
			const authToken = await generateDiscordBotJwt({ DISCORD_BOT_PRIVATE_KEY: privateKey });
			expect(authToken).not.toBeUndefined();
		});
		test('Should call sign method', async () => {
			signSpy.mockResolvedValue('Hello');
			await generateDiscordBotJwt({ DISCORD_BOT_PRIVATE_KEY: privateKey });
			expect(signSpy).toBeCalledTimes(1);
		});
		test('Should return promise without await', async () => {
			signSpy.mockResolvedValue('Hello');
			const authToken = generateDiscordBotJwt({ DISCORD_BOT_PRIVATE_KEY: privateKey });
			expect(authToken).toBeInstanceOf(Promise);
		});
		test('Throws an error if generation fails', async () => {
			signSpy.mockRejectedValue('Error');
			await generateDiscordBotJwt({ DISCORD_BOT_PRIVATE_KEY: privateKey }).catch((err) => {
				expect(err).toBeInstanceOf(Error);
				expect(err.message).toEqual('Error in generating the auth token');
			});
		});
	});
});
