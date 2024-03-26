import {
	syncExternalAccounts,
	syncIdle7dUsers,
	syncIdleUsers,
	syncNickNames,
	syncOnboarding31dPlusUsers,
	syncUnverifiedUsers,
	syncUsersStatus,
} from '../../handlers/scheduledEventHandler';
import { env } from '../../types/global.types';
import * as apiCallerModule from '../../utils/apiCaller';

const consoleErrorMock: jest.SpyInstance = jest.spyOn(console, 'error').mockImplementation();
const fireAndForgetApiCallMock = jest.fn();

beforeEach(() => {
	jest.clearAllMocks();
	jest.spyOn(apiCallerModule, 'fireAndForgetApiCall').mockImplementation(fireAndForgetApiCallMock);
});

afterAll(() => {
	consoleErrorMock.mockRestore();
});

describe('sync apis', () => {
	const mockEnv: env = {
		CURRENT_ENVIRONMENT: {
			RDS_BASE_API_URL: 'staging',
		},
	};

	const testSyncFunction = async (syncFunction: Function, endpoint: string, method: string) => {
		await syncFunction(mockEnv);

		expect(apiCallerModule.fireAndForgetApiCall).toHaveBeenCalledWith(mockEnv, endpoint, method);
		expect(apiCallerModule.fireAndForgetApiCall).toHaveBeenCalledTimes(1);
	};

	it('should sync users status', async () => {
		testSyncFunction(syncUsersStatus, 'users/status/sync', 'PATCH');
	});

	it('should sync unverified users', async () => {
		testSyncFunction(syncUnverifiedUsers, 'users', 'POST');
	});

	it('should sync idle users', async () => {
		testSyncFunction(syncIdleUsers, 'discord-actions/group-idle', 'PUT');
	});

	it('should sync external accounts', async () => {
		testSyncFunction(syncExternalAccounts, 'external-accounts/users?action=discord-users-sync', 'POST');
	});

	it('should sync nicknames', async () => {
		testSyncFunction(syncNickNames, 'discord-actions/nicknames/sync?dev=true', 'POST');
	});

	it('should sync idle 7d users', async () => {
		testSyncFunction(syncIdle7dUsers, 'discord-actions/group-idle-7d', 'PUT');
	});

	it('should sync onboarding 31d+ users', async () => {
		testSyncFunction(syncOnboarding31dPlusUsers, 'discord-actions/group-onboarding-31d-plus', 'PUT');
	});
});
