import { syncApiHandler } from '../../handlers/scheduledEventHandler';
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

	it('should call all sync functions', async () => {
		await syncApiHandler(mockEnv);

		expect(apiCallerModule.fireAndForgetApiCall).toHaveBeenCalledWith(mockEnv, 'users/status/sync', 'PATCH');
		expect(apiCallerModule.fireAndForgetApiCall).toHaveBeenCalledWith(mockEnv, 'external-accounts/users?action=discord-users-sync', 'POST');
		expect(apiCallerModule.fireAndForgetApiCall).toHaveBeenCalledWith(mockEnv, 'users', 'POST');
		expect(apiCallerModule.fireAndForgetApiCall).toHaveBeenCalledWith(mockEnv, 'discord-actions/nicknames/sync?dev=true', 'POST');
		expect(apiCallerModule.fireAndForgetApiCall).toHaveBeenCalledWith(mockEnv, 'discord-actions/group-idle-7d', 'PUT');
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
