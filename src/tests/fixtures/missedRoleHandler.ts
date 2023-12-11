export const missedUpdatesUsersMock = {
	usersToAddRole: ['user1', 'user2'],
	tasks: 10,
	missedUpdatesTasks: 5,
	cursor: 'some-cursor',
};
export const missedUpdatesUsersMockWithNoUsers = {
	usersToAddRole: [],
	tasks: 10,
	missedUpdatesTasks: 5,
};
export const missedUpdatesUsersMockWithoutCursor = {
	usersToAddRole: ['user1', 'user2'],
	tasks: 10,
	missedUpdatesTasks: 5,
};

export const updateRolesResponseMock = {
	userid: 'user1',
	roleid: '1',
	success: true,
};
export const discordUserRoleMock = [
	{ userid: 'user1', roleid: '1' },
	{ userid: 'user2', roleid: '2' },
];

export const discordRoleUpdateResult = [
	{
		userid: '1',
		roleid: '2',
		success: true,
	},
];
