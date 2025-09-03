import {
	addProfileServiceBlockedRoleHandler,
	callDiscordNicknameBatchUpdateHandler,
	ping,
	syncApiHandler,
} from '../../handlers/scheduledEventHandler';
import * as discordBotServices from '../../services/discordBotServices';
import * as rdsBackendService from '../../services/rdsBackendService';
import { env } from '../../types/global.types';
import * as apiCallerModule from '../../utils/apiCaller';
import * as generateJwtModule from '../../utils/generateJwt';

const consoleErrorMock: jest.SpyInstance = jest.spyOn(console, 'error').mockImplementation();
const fireAndForgetApiCallMock = jest.fn();

beforeEach(() => {
	jest.clearAllMocks();
	jest.spyOn(apiCallerModule, 'fireAndForgetApiCall').mockImplementation(fireAndForgetApiCallMock);
});

afterAll(() => {
	consoleErrorMock.mockRestore();
});

describe('ping', () => {
	it('should make a healthcheck request', async () => {
		const mockEnv = {
			CURRENT_ENVIRONMENT: 'production',
		};

		const mockResponse = { ok: true, status: 200 };
		global.fetch = jest.fn().mockResolvedValue(mockResponse);

		const result = await ping(mockEnv);

		expect(fetch).toHaveBeenCalledWith('https://api.realdevsquad.com/healthcheck');
		expect(result).toEqual(mockResponse);
	});
});

describe('callDiscordNicknameBatchUpdateHandler', () => {
	it('should handle nickname batch update successfully', async () => {
		const mockEnv = {
			CURRENT_ENVIRONMENT: 'production',
			CronJobsTimestamp: {
				get: jest.fn().mockResolvedValue('1234567890'),
				put: jest.fn().mockResolvedValue(undefined),
			},
		};

		const mockResponse = {
			ok: true,
			json: jest.fn().mockResolvedValue({
				data: { unsuccessfulNicknameUpdates: 0 },
			}),
		};

		global.fetch = jest.fn().mockResolvedValue(mockResponse);
		jest.spyOn(generateJwtModule, 'generateJwt').mockResolvedValue('mocked-jwt-token');

		await callDiscordNicknameBatchUpdateHandler(mockEnv);

		expect(mockEnv.CronJobsTimestamp.get).toHaveBeenCalledWith('DISCORD_NICKNAME_UPDATED_TIME');
		expect(fetch).toHaveBeenCalledWith(
			'https://api.realdevsquad.com/discord-actions/nickname/status',
			expect.objectContaining({
				method: 'POST',
				headers: expect.objectContaining({
					Authorization: 'Bearer mocked-jwt-token',
				}),
				body: JSON.stringify({ lastNicknameUpdate: '1234567890' }),
			}),
		);
		expect(mockEnv.CronJobsTimestamp.put).toHaveBeenCalledWith('DISCORD_NICKNAME_UPDATED_TIME', expect.any(String));
	});

	it('should handle null timestamp from KV', async () => {
		const mockEnv = {
			CURRENT_ENVIRONMENT: 'production',
			CronJobsTimestamp: {
				get: jest.fn().mockResolvedValue(null),
			},
		};

		await expect(callDiscordNicknameBatchUpdateHandler(mockEnv)).rejects.toThrow(
			'Error while fetching KV "DISCORD_NICKNAME_UPDATED_TIME" timestamp',
		);
	});

	it('should handle empty timestamp from KV', async () => {
		const mockEnv = {
			CURRENT_ENVIRONMENT: 'production',
			CronJobsTimestamp: {
				get: jest.fn().mockResolvedValue(''),
				put: jest.fn().mockResolvedValue(undefined),
			},
		};

		const mockResponse = {
			ok: true,
			json: jest.fn().mockResolvedValue({
				data: { unsuccessfulNicknameUpdates: 0 },
			}),
		};

		global.fetch = jest.fn().mockResolvedValue(mockResponse);
		jest.spyOn(generateJwtModule, 'generateJwt').mockResolvedValue('mocked-jwt-token');

		await callDiscordNicknameBatchUpdateHandler(mockEnv);

		expect(fetch).toHaveBeenCalledWith(
			expect.any(String),
			expect.objectContaining({
				body: JSON.stringify({ lastNicknameUpdate: '0' }),
			}),
		);
	});

	it('should handle API error response', async () => {
		const mockEnv = {
			CURRENT_ENVIRONMENT: 'production',
			CronJobsTimestamp: {
				get: jest.fn().mockResolvedValue('1234567890'),
			},
		};

		const mockResponse = {
			ok: false,
			status: 500,
		};

		global.fetch = jest.fn().mockResolvedValue(mockResponse);
		jest.spyOn(generateJwtModule, 'generateJwt').mockResolvedValue('mocked-jwt-token');

		await expect(callDiscordNicknameBatchUpdateHandler(mockEnv)).rejects.toThrow("Error while trying to update users' discord nickname");
	});

	it('should handle unsuccessful nickname updates', async () => {
		const mockEnv = {
			CURRENT_ENVIRONMENT: 'production',
			CronJobsTimestamp: {
				get: jest.fn().mockResolvedValue('1234567890'),
				put: jest.fn().mockResolvedValue(undefined),
			},
		};

		const mockResponse = {
			ok: true,
			json: jest.fn().mockResolvedValue({
				data: { unsuccessfulNicknameUpdates: 5 },
			}),
		};

		global.fetch = jest.fn().mockResolvedValue(mockResponse);
		jest.spyOn(generateJwtModule, 'generateJwt').mockResolvedValue('mocked-jwt-token');

		await callDiscordNicknameBatchUpdateHandler(mockEnv);

		expect(mockEnv.CronJobsTimestamp.put).not.toHaveBeenCalled();
	});
});

describe('sync apis', () => {
	const mockEnv: env = {
		CURRENT_ENVIRONMENT: {
			RDS_BASE_API_URL: 'staging',
		},
	};

	it('should call all sync functions', async () => {
		await syncApiHandler(mockEnv);

		expect(apiCallerModule.fireAndForgetApiCall).toHaveBeenCalledWith(mockEnv, 'users/status/sync', 'PATCH');
		expect(apiCallerModule.fireAndForgetApiCall).toHaveBeenCalledWith(mockEnv, 'external-accounts/users?action=discord-users-sync', 'POST');
		expect(apiCallerModule.fireAndForgetApiCall).toHaveBeenCalledWith(mockEnv, 'users', 'POST');
		expect(apiCallerModule.fireAndForgetApiCall).toHaveBeenCalledWith(mockEnv, 'discord-actions/nicknames/sync?dev=true', 'POST');
		expect(apiCallerModule.fireAndForgetApiCall).toHaveBeenCalledWith(mockEnv, 'discord-actions/group-idle-7d?dev=true', 'PUT');
		expect(apiCallerModule.fireAndForgetApiCall).toHaveBeenCalledWith(mockEnv, 'discord-actions/group-onboarding-31d-plus', 'PUT');
		expect(apiCallerModule.fireAndForgetApiCall).toHaveBeenCalledTimes(6);
	});

	it('should catch errors during API calls', async () => {
		const mockError = new Error('API error');
		(apiCallerModule.fireAndForgetApiCall as jest.MockedFunction<typeof apiCallerModule.fireAndForgetApiCall>).mockRejectedValueOnce(
			mockError,
		);

		await syncApiHandler(mockEnv);

		expect(console.error).toHaveBeenCalledWith('Error occurred during Sync API calls:', mockError);
	});
});

describe('addProfileServiceBlockedRoleHandler', () => {
	it('should add profile service blocked role to users successfully', async () => {
		const mockEnv = {
			CURRENT_ENVIRONMENT: 'default',
			PROFILE_SERVICE_BLOCKED_ROLE_ID: '1181214205081296897',
		} as env;

		const discordIds = ['user1', 'user2', 'user3'];

		// Mock the service function to return string[]
		jest.spyOn(rdsBackendService, 'getProfileServiceBlockedUsers').mockResolvedValue(discordIds);

		// Mock the Discord service
		jest.spyOn(discordBotServices, 'updateUserRoles').mockResolvedValue({
			userid: 'user1',
			roleid: '1181214205081296897',
			success: true,
		});

		await addProfileServiceBlockedRoleHandler(mockEnv);

		expect(rdsBackendService.getProfileServiceBlockedUsers).toHaveBeenCalledWith(mockEnv, undefined);
		expect(discordBotServices.updateUserRoles).toHaveBeenCalledWith(mockEnv, [
			{ userid: 'user1', roleid: '1181214205081296897' },
			{ userid: 'user2', roleid: '1181214205081296897' },
			{ userid: 'user3', roleid: '1181214205081296897' },
		]);
	});

	it('should handle empty users list', async () => {
		const mockEnv = {
			CURRENT_ENVIRONMENT: 'production',
			PROFILE_SERVICE_BLOCKED_ROLE_ID: 'test-role-id',
		} as env;

		jest.spyOn(rdsBackendService, 'getProfileServiceBlockedUsers').mockResolvedValue([]);
		jest.spyOn(discordBotServices, 'updateUserRoles');

		await addProfileServiceBlockedRoleHandler(mockEnv);

		expect(rdsBackendService.getProfileServiceBlockedUsers).toHaveBeenCalledWith(mockEnv, undefined);
		expect(discordBotServices.updateUserRoles).not.toHaveBeenCalled();
	});

	it('should handle errors gracefully', async () => {
		const mockEnv = {
			CURRENT_ENVIRONMENT: 'production',
			PROFILE_SERVICE_BLOCKED_ROLE_ID: 'test-role-id',
		} as env;

		jest.spyOn(rdsBackendService, 'getProfileServiceBlockedUsers').mockRejectedValue(new Error('API Error'));
		const consoleSpy = jest.spyOn(console, 'error');

		await addProfileServiceBlockedRoleHandler(mockEnv);

		expect(consoleSpy).toHaveBeenCalledWith('Error while adding profile service blocked roles', expect.any(Error));
	});

	it('should handle updateUserRoles errors', async () => {
		const mockEnv = {
			CURRENT_ENVIRONMENT: 'production',
			PROFILE_SERVICE_BLOCKED_ROLE_ID: 'test-role-id',
		} as env;

		jest.spyOn(rdsBackendService, 'getProfileServiceBlockedUsers').mockResolvedValue(['user1']);
		jest.spyOn(discordBotServices, 'updateUserRoles').mockRejectedValue(new Error('Discord API Error'));
		const consoleSpy = jest.spyOn(console, 'error');

		await addProfileServiceBlockedRoleHandler(mockEnv);

		expect(consoleSpy).toHaveBeenCalledWith(
			'Error occurred while updating discord users with profile service blocked role',
			expect.any(Error),
		);
	});
});
