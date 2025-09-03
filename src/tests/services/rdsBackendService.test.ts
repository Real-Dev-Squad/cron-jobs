import config from '../../config/config';
import { getMissedUpdatesUsers, getProfileServiceBlockedUsers } from '../../services/rdsBackendService';
import { missedUpdatesUsersMock, missedUpdatesUsersResponse, profileServiceBlockedUsersResponse } from '../fixtures/missedRoleHandler';

jest.mock('../../utils/generateJwt', () => ({
	generateJwt: jest.fn().mockResolvedValue('mocked-jwt-token'),
}));

describe('rdsBackendService', () => {
	describe('getMissedUpdatesUsers', () => {
		let cursor: undefined | string;
		beforeEach(() => {
			jest.clearAllMocks();
		});

		it('should make a successful API call and return the expected data', async () => {
			jest.spyOn(globalThis as any, 'fetch').mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: jest.fn().mockResolvedValueOnce({ ...missedUpdatesUsersResponse, data: missedUpdatesUsersMock }),
			} as unknown as Response);
			const result = await getMissedUpdatesUsers({}, cursor);
			const url = new URL(`${config({}).RDS_BASE_API_URL}/tasks/users/discord`);
			url.searchParams.append('q', 'status:missed-updates -days-count:3');
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
			jest.spyOn(globalThis as any, 'fetch').mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: jest.fn().mockResolvedValueOnce({ ...missedUpdatesUsersResponse, data: missedUpdatesUsersMock }),
			} as unknown as Response);
			const result = await getMissedUpdatesUsers({}, 'cursorValue');
			const url = new URL(`${config({}).RDS_BASE_API_URL}/tasks/users/discord`);
			url.searchParams.append('q', 'status:missed-updates -days-count:3');
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
			jest.spyOn(globalThis as any, 'fetch').mockResolvedValueOnce({
				ok: false,
				status: 400,
			} as unknown as Response);
			await expect(getMissedUpdatesUsers({}, cursor)).rejects.toThrow('Fetch call to get user discord details failed with status: 400');
		});

		it('should handle unknown errors', async () => {
			const consoleSpy = jest.spyOn(console, 'error');
			jest.spyOn(globalThis as any, 'fetch').mockRejectedValueOnce(new Error('Error occurred'));
			await expect(getMissedUpdatesUsers({}, cursor)).rejects.toThrow('Error occurred');
			expect(consoleSpy).toHaveBeenCalledWith('Error occurred while fetching discord user details');
		});
	});

	describe('getProfileServiceBlockedUsers', () => {
		let cursor: undefined | string;
		beforeEach(() => {
			jest.clearAllMocks();
		});

		it('should make a successful API call and return the expected data', async () => {
			jest.spyOn(globalThis as any, 'fetch').mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: jest.fn().mockResolvedValueOnce(profileServiceBlockedUsersResponse),
			} as unknown as Response);
			const result = await getProfileServiceBlockedUsers({}, cursor);
			const url = new URL(`${config({}).RDS_BASE_API_URL}/users`);
			url.searchParams.append('profileStatus', 'BLOCKED');
			expect(fetch).toHaveBeenCalledWith(url, {
				method: 'GET',
				headers: {
					Authorization: 'Bearer mocked-jwt-token',
					'Content-Type': 'application/json',
				},
			});
			expect(result).toEqual({
				usersToAddRole: ['user1', 'user2'],
				tasks: 2,
				missedUpdatesTasks: 0,
				cursor: undefined,
			});
		});
		it('should make a successful API call with cursor', async () => {
			jest.spyOn(globalThis as any, 'fetch').mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: jest.fn().mockResolvedValueOnce(profileServiceBlockedUsersResponse),
			} as unknown as Response);
			const result = await getProfileServiceBlockedUsers({}, 'cursorValue');
			const url = new URL(`${config({}).RDS_BASE_API_URL}/users`);
			url.searchParams.append('profileStatus', 'BLOCKED');
			url.searchParams.append('cursor', 'cursorValue');
			expect(fetch).toHaveBeenCalledWith(url, {
				method: 'GET',
				headers: {
					Authorization: 'Bearer mocked-jwt-token',
					'Content-Type': 'application/json',
				},
			});
			expect(result).toEqual({
				usersToAddRole: ['user1', 'user2'],
				tasks: 2,
				missedUpdatesTasks: 0,
				cursor: undefined,
			});
		});
		it('should throw error when api call fails', async () => {
			jest.spyOn(globalThis as any, 'fetch').mockResolvedValueOnce({
				ok: false,
				status: 400,
			} as unknown as Response);
			await expect(getProfileServiceBlockedUsers({}, cursor)).rejects.toThrow(
				'Fetch call to get profile service blocked users failed with status: 400',
			);
		});
		it('should make a successful API call and return the expected data', async () => {
			jest.spyOn(globalThis as any, 'fetch').mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: jest.fn().mockResolvedValueOnce(profileServiceBlockedUsersResponse),
			} as unknown as Response);
			const result = await getProfileServiceBlockedUsers({}, cursor);
			const url = new URL(`${config({}).RDS_BASE_API_URL}/users`);
			url.searchParams.append('profileStatus', 'BLOCKED');
			expect(fetch).toHaveBeenCalledWith(url, {
				method: 'GET',
				headers: {
					Authorization: 'Bearer mocked-jwt-token',
					'Content-Type': 'application/json',
				},
			});
			expect(result).toEqual({
				usersToAddRole: ['user1', 'user2'],
				tasks: 2,
				missedUpdatesTasks: 0,
				cursor: undefined,
			});
		});

		it('should handle unknown errors', async () => {
			const consoleSpy = jest.spyOn(console, 'error');
			jest.spyOn(globalThis as any, 'fetch').mockRejectedValueOnce(new Error('Error occurred'));
			await expect(getProfileServiceBlockedUsers({}, cursor)).rejects.toThrow('Error occurred');
			expect(consoleSpy).toHaveBeenCalledWith('Error occurred while fetching profile service blocked users', expect.any(Error));
		});
	});
});
