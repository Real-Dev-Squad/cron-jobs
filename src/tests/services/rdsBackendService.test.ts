import config from '../../config/config';
import { getMissedUpdatesUsers } from '../../services/rdsBackendService';
import { missedUpdatesUsersMock } from '../fixtures/missedRoleHandler';

jest.mock('../../utils/generateJwt', () => ({
	generateJwt: jest.fn().mockResolvedValueOnce('mocked-jwt-token'),
}));

describe('rdsBackendService', () => {
	describe('updateUserRoles', () => {
		beforeEach(() => {
			jest.clearAllMocks();
		});

		it('should make a successful API call and return the expected data', async () => {
			jest.spyOn(global, 'fetch').mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: jest.fn().mockResolvedValueOnce(missedUpdatesUsersMock),
			} as unknown as Response);
			const result = await getMissedUpdatesUsers({});

			expect(fetch).toHaveBeenCalledWith(`${config({}).RDS_BASE_API_URL}/tasks/users/discord?q=status:missed-updates`, {
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
			await expect(getMissedUpdatesUsers({})).rejects.toThrow('Fetch call to get user discord details failed with status: 400');
		});

		it('should handle unknown errors', async () => {
			const consoleSpy = jest.spyOn(console, 'error');
			jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Error occurred'));
			await expect(getMissedUpdatesUsers({})).rejects.toThrow('Error occurred');
			expect(consoleSpy).toHaveBeenCalledWith('Error occurrent while fetching discord user details');
		});
	});
});
