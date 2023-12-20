import { addMissedUpdatesRole } from '../../handlers/scheduledEventHandler';
import { updateUserRoles } from '../../services/discordBotServices';
import { getMissedUpdatesUsers } from '../../services/rdsBackendService';
import {
	missedUpdatesUsersMock,
	missedUpdatesUsersMockWithNoUsers,
	missedUpdatesUsersMockWithoutCursor,
} from '../fixtures/missedRoleHandler';

jest.mock('.../../../../services/rdsBackendService', () => ({
	getMissedUpdatesUsers: jest.fn(),
}));
jest.mock('.../../../../services/discordBotServices', () => ({
	updateUserRoles: jest.fn(),
}));
describe('addMissedUpdatesRole', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});
	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should call getMissedUpdatesUsers and updateUserRoles when there are users to add role', async () => {
		(getMissedUpdatesUsers as jest.Mock)
			.mockResolvedValueOnce(missedUpdatesUsersMock)
			.mockResolvedValueOnce(missedUpdatesUsersMockWithoutCursor);
		await addMissedUpdatesRole({});
		expect(getMissedUpdatesUsers).toHaveBeenCalledTimes(2);
		expect(updateUserRoles).toHaveBeenCalledTimes(2);
	});

	it('should not call updateUserRoles when there are no users to add role', async () => {
		(getMissedUpdatesUsers as jest.Mock).mockResolvedValueOnce(missedUpdatesUsersMockWithNoUsers);

		await addMissedUpdatesRole({});
		expect(getMissedUpdatesUsers).toHaveBeenCalledTimes(1);
		expect(updateUserRoles).toHaveBeenCalledTimes(0);
	});

	it('should create chunks of userId and update roles multiple times when count is greater than 25', async () => {
		const mockValue: any = { ...missedUpdatesUsersMockWithoutCursor, usersToAddRole: new Array(75).fill('id') };
		(getMissedUpdatesUsers as jest.Mock).mockResolvedValueOnce(mockValue);

		await addMissedUpdatesRole({});
		expect(getMissedUpdatesUsers).toHaveBeenCalledTimes(1);
		expect(updateUserRoles).toHaveBeenCalledTimes(3);
	});

	it('should handle errors', async () => {
		(getMissedUpdatesUsers as jest.Mock).mockRejectedValueOnce(new Error('Error fetching missed updates users'));
		const consoleSpy = jest.spyOn(console, 'error');
		await addMissedUpdatesRole({});
		expect(consoleSpy).toHaveBeenCalledWith('Error while adding missed updates roles');
	});

	it('should continue updating user roles even when a call fails', async () => {
		(updateUserRoles as jest.Mock).mockRejectedValueOnce(new Error('Error occurred'));
		const consoleSpy = jest.spyOn(console, 'error');
		const mockValue: any = { ...missedUpdatesUsersMockWithoutCursor, usersToAddRole: new Array(75).fill('id') };
		(getMissedUpdatesUsers as jest.Mock).mockResolvedValueOnce(mockValue);
		await addMissedUpdatesRole({});
		expect(getMissedUpdatesUsers).toHaveBeenCalledTimes(1);
		expect(consoleSpy).toHaveBeenCalledTimes(1);
		expect(updateUserRoles).toHaveBeenCalledTimes(3);
	});
});
