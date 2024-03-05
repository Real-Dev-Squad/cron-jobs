import { RDS_BASE_DEVELOPMENT_API_URL } from '../../constants/urls';
import { env } from '../../types/global.types';
import { apiCaller } from '../../utils/apiCaller';
import { generateJwt } from '../../utils/generateJwt';

jest.mock('../../utils/generateJwt', () => ({
	generateJwt: jest.fn().mockResolvedValue('mocked-token'),
}));

describe('apiCaller', () => {
	const mockEnv: env = {
		CURRENT_ENVIRONMENT: {
			RDS_BASE_API_URL: 'default',
		},
	};

	beforeEach(() => {
		jest.clearAllMocks();
		(globalThis as any).fetch = jest.fn(() =>
			Promise.resolve({
				json: () => Promise.resolve({ success: true }),
			}),
		);
	});

	it('should make a successful API call', async () => {
		const result = await apiCaller(mockEnv, 'users', 'GET');
		expect(generateJwt).toHaveBeenCalledWith(mockEnv);

		expect(result).toEqual({ success: true });
		expect((globalThis as any).fetch).toHaveBeenCalledWith(`${RDS_BASE_DEVELOPMENT_API_URL}/users`, {
			method: 'GET',
			headers: {
				Authorization: 'Bearer mocked-token',
				'Content-Type': 'application/json',
			},
		});
	});

	it('should make a successful POST API call', async () => {
		const result = await apiCaller(mockEnv, 'test', 'POST', {
			body: JSON.stringify({ data: 'example' }),
		});
		expect(generateJwt).toHaveBeenCalledWith(mockEnv);

		expect(result).toEqual({ success: true });
		expect((globalThis as any).fetch).toHaveBeenCalledWith(`${RDS_BASE_DEVELOPMENT_API_URL}/test`, {
			method: 'POST',
			headers: {
				Authorization: 'Bearer mocked-token',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ data: 'example' }),
		});
	});

	it('should log and rethrow error during fetch call failure', async () => {
		const mockError = new Error('Network error');

		const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

		(globalThis as any).fetch = jest.fn().mockRejectedValue(mockError);

		await expect(apiCaller({}, 'someEndpoint', 'GET')).rejects.toThrowError(mockError);
		expect(consoleErrorSpy).toHaveBeenCalledWith(`Error during fetch operation: ${mockError}`);
		expect(consoleErrorSpy).toHaveBeenCalledTimes(1);

		consoleErrorSpy.mockRestore();
	});
});
