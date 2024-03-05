import {
	syncIdle7dUsers,
	syncIdleUsers,
	syncNickNames,
	syncOnboarding31dPlusUsers,
	syncUnverifiedUsers,
	syncUsersStatus,
} from '../../handlers/scheduledEventHandler';
import { env } from '../../types/global.types';
import * as apiCallerModule from '../../utils/apiCaller';

jest.mock('../../utils/apiCaller', () => ({
	apiCaller: jest.fn(),
}));

const consoleErrorMock: jest.SpyInstance = jest.spyOn(console, 'error').mockImplementation();
const apiCallerFunction = apiCallerModule.apiCaller;

beforeEach(() => {
	jest.clearAllMocks();
});

afterAll(() => {
	consoleErrorMock.mockRestore();
});

describe('syncUsersStatus', () => {
	const mockEnv: env = {
		CURRENT_ENVIRONMENT: {
			RDS_BASE_API_URL: 'default',
		},
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('should successfully sync users status', async () => {
		(apiCallerFunction as jest.Mock).mockResolvedValueOnce(undefined);
		(apiCallerFunction as jest.Mock).mockResolvedValueOnce({
			data: {
				users: [{ userId: 'asdoiuahow212' }],
			},
		});
		(apiCallerFunction as jest.Mock).mockResolvedValueOnce({ success: true });

		await syncUsersStatus(mockEnv);

		expect(apiCallerFunction).toHaveBeenCalledWith(mockEnv, 'users/status/update', 'PATCH');
		expect(apiCallerFunction).toHaveBeenCalledWith(mockEnv, 'users/status?aggregate=true', 'GET');
		expect(apiCallerFunction).toHaveBeenCalledWith(mockEnv, 'users/status/batch', 'PATCH', {
			method: 'PATCH',
			body: JSON.stringify({ users: [{ userId: 'asdoiuahow212' }] }),
		});
		expect(apiCallerFunction).toHaveBeenCalledTimes(3);
	});

	it('should handle error during users data retrieval', async () => {
		(apiCallerFunction as jest.Mock).mockResolvedValueOnce(undefined);
		(apiCallerFunction as jest.Mock).mockRejectedValueOnce(new Error('Error fetching users data'));

		const result = await syncUsersStatus(mockEnv);

		expect(result).toBeNull();

		expect(apiCallerFunction).toHaveBeenCalledWith(mockEnv, 'users/status/update', 'PATCH');
		expect(apiCallerFunction).toHaveBeenCalledWith(mockEnv, 'users/status?aggregate=true', 'GET');
		expect(apiCallerFunction).toHaveBeenCalledTimes(2);

		expect(console.error).toHaveBeenCalledWith('Error during syncUsersStatus:', new Error('Error fetching users data'));
		expect(console.error).toHaveBeenCalledTimes(1);
	});

	it('should log an error when no users are found or data is not in the expected format', async () => {
		(apiCallerFunction as jest.Mock).mockResolvedValueOnce(undefined);
		(apiCallerFunction as jest.Mock).mockResolvedValueOnce({
			data: {
				users: [],
			},
		});

		const result = await syncUsersStatus(mockEnv);

		expect(result).toBeNull();

		expect(apiCallerFunction).toHaveBeenCalledWith(mockEnv, 'users/status/update', 'PATCH');
		expect(apiCallerFunction).toHaveBeenCalledWith(mockEnv, 'users/status?aggregate=true', 'GET');
		expect(apiCallerFunction).toHaveBeenCalledTimes(2);

		expect(console.error).toHaveBeenCalledWith('Error: Users data is not in the expected format or no users found');
		expect(console.error).toHaveBeenCalledTimes(1);
	});
});

describe('sync apis', () => {
	const mockEnv: env = {
		CURRENT_ENVIRONMENT: {
			RDS_BASE_API_URL: 'staging',
		},
	};

	const testSyncFunction = async (syncFunction: Function, endpoint: string, method: string) => {
		await syncFunction(mockEnv);

		expect(apiCallerFunction).toHaveBeenCalledWith(mockEnv, endpoint, method);
		expect(apiCallerFunction).toHaveBeenCalledTimes(1);
	};

	it('should sync unverified users', async () => {
		await testSyncFunction(syncUnverifiedUsers, 'users', 'POST');
	});

	it('should sync idle users', async () => {
		await testSyncFunction(syncIdleUsers, 'discord-actions/group-idle', 'PUT');
	});

	it('should sync nicknames', async () => {
		await testSyncFunction(syncNickNames, 'discord-actions/nicknames/sync?dev=true', 'POST');
	});

	it('should sync idle 7d users', async () => {
		await testSyncFunction(syncIdle7dUsers, 'discord-actions/group-idle-7d', 'PUT');
	});

	it('should sync onboarding 31d+ users', async () => {
		await testSyncFunction(syncOnboarding31dPlusUsers, 'discord-actions/group-onboarding-31d-plus', 'PUT');
	});
});
