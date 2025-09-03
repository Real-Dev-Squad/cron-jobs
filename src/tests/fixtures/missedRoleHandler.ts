export const missedUpdatesUsersResponse = {
	message: 'Discord details of users with status missed updates fetched successfully',
	data: {},
};
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

export const profileServiceBlockedUsersResponse = {
	message: 'Users with profile status BLOCKED returned successfully!',
	count: 2,
	users: [
		{
			discordId: 'user1',
			roles: { in_discord: true },
		},
		{
			discordId: 'user2',
			roles: { in_discord: true },
		},
	],
};
