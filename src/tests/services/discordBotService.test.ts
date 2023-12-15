import config from '../../config/config';
import { updateUserRoles } from '../../services/discordBotServices';
import { discordRoleUpdateResult, discordUserRoleMock } from '../fixtures/missedRoleHandler';

jest.mock('../../utils/generateJwt', () => ({
	generateDiscordBotJwt: jest.fn().mockResolvedValueOnce('mocked-jwt-token'),
}));
describe('discordBotService', () => {
	describe('updateUserRoles', () => {
		let fetchSpy: jest.Mock<any, any, any>;
		beforeEach(() => {
			fetchSpy = jest.fn();
			jest.clearAllMocks();
		});

		it('should make a successful API call and return the expected data', async () => {
			fetchSpy.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: jest.fn().mockResolvedValueOnce(discordRoleUpdateResult),
			} as unknown as Response);
			const result = await updateUserRoles({ DISCORD_BOT: { fetch: fetchSpy } }, discordUserRoleMock);

			expect(fetchSpy).toHaveBeenCalledWith(`${config({}).DISCORD_BOT_API_URL}/roles?action=add-role`, {
				method: 'POST',
				headers: {
					Authorization: 'Bearer mocked-jwt-token',
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(discordUserRoleMock),
			});
			expect(result).toEqual([...discordRoleUpdateResult]);
		});

		it('should throw error when api call fails', async () => {
			fetchSpy.mockResolvedValueOnce({
				ok: false,
				status: 400,
			} as unknown as Response);
			await expect(updateUserRoles({ DISCORD_BOT: { fetch: fetchSpy } }, [])).rejects.toThrow('Role Update failed with status: 400');
		});
		it('should handle unknown errors', async () => {
			const consoleSpy = jest.spyOn(console, 'error');
			fetchSpy.mockRejectedValueOnce(new Error('Error occurred'));
			await expect(updateUserRoles({ DISCORD_BOT: { fetch: fetchSpy } }, [])).rejects.toThrow('Error occurred');
			expect(consoleSpy).toHaveBeenCalledWith('Error while updating discord user roles');
		});
	});
});
