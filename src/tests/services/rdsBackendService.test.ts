import config from '../../config/config';
import { getMissedUpdatesUsers } from '../../services/rdsBackendService';
import { missedUpdatesUsersMock, missedUpdatesUsersResponse } from '../fixtures/missedRoleHandler';

jest.mock('../../utils/generateJwt', () => ({
	generateJwt: jest.fn().mockResolvedValue('mocked-jwt-token'),
}));

describe('rdsBackendService', () => {
	describe('updateUserRoles', () => {
		let cursor: undefined | string;
		beforeEach(() => {
			jest.clearAllMocks();
		});

		it('should make a successful API call and return the expected data', async () => {
			jest.spyOn(global, 'fetch').mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: jest.fn().mockResolvedValueOnce({ ...missedUpdatesUsersResponse, data: missedUpdatesUsersMock }),
			} as unknown as Response);
			const result = await getMissedUpdatesUsers({}, cursor);
			const url = new URL(`${config({}).RDS_BASE_API_URL}/tasks/users/discord`);
			url.searchParams.append('q', 'status:missed-updates');
			expect(fetch).toHaveBeenCalledWith(url, {
				method: 'GET',
				headers: {
					Authorization: 'Bearer mocked-jwt-token',
					'Content-Type': 'application/json',
				},
			});
			expect(result).toEqual({ ...missedUpdatesUsersMock });
		});
		it('should make a successful API call with cursor', async () => {
			jest.spyOn(global, 'fetch').mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: jest.fn().mockResolvedValueOnce({ ...missedUpdatesUsersResponse, data: missedUpdatesUsersMock }),
			} as unknown as Response);
			const result = await getMissedUpdatesUsers({}, 'cursorValue');
			const url = new URL(`${config({}).RDS_BASE_API_URL}/tasks/users/discord`);
			url.searchParams.append('q', 'status:missed-updates');
			url.searchParams.append('cursor', 'cursorValue');
			expect(fetch).toHaveBeenCalledWith(url, {
				method: 'GET',
				headers: {
					Authorization: 'Bearer mocked-jwt-token',
					'Content-Type': 'application/json',
				},
			});
			expect(result).toEqual({ ...missedUpdatesUsersMock });
		});
		it('should throw error when api call fails', async () => {
			jest.spyOn(global, 'fetch').mockResolvedValueOnce({
				ok: false,
				status: 400,
			} as unknown as Response);
			await expect(getMissedUpdatesUsers({}, cursor)).rejects.toThrow('Fetch call to get user discord details failed with status: 400');
		});

		it('should handle unknown errors', async () => {
			const consoleSpy = jest.spyOn(console, 'error');
			jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Error occurred'));
			await expect(getMissedUpdatesUsers({}, cursor)).rejects.toThrow('Error occurred');
			expect(consoleSpy).toHaveBeenCalledWith('Error occurred while fetching discord user details');
		});
	});
});
