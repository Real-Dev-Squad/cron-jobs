export type env = {
	[key: string]: any;
};

export type environment = {
	[key: string]: variables;
};
export type variables = {
	RDS_BASE_API_URL: string;
	DISCORD_BOT_API_URL: string;
	MISSED_UPDATES_ROLE_ID: string;
	PROFILE_SERVICE_BLOCKED_ROLE_ID: string;
};

export type NicknameUpdateResponseType = {
	message: string;
	data: {
		totalUsersStatus: number;
		successfulNicknameUpdates: number;
		unsuccessfulNicknameUpdates: number;
	};
};
export type DiscordUsersResponse = {
	message: string;
	data: DiscordUserIdList;
};
export type DiscordUserIdList = {
	usersToAddRole: string[];
	tasks: number;
	missedUpdatesTasks: number;
	cursor: string;
};

export interface DiscordUserRole {
	userid: string;
	roleid: string;
}
export type DiscordRoleUpdatedList = {
	userid: string;
	roleid: string;
	success: boolean;
};
export type UserStatusResponse = {
	message: string;
	data: {
		totalUsers: number;
		totalIdleUsers: number;
		totalActiveUsers: number;
		totalUnprocessedUsers: number;
		unprocessedUsers: Array<unknown>;
		users: Array<unknown>;
	};
};

export type ProfileServiceBlockedUsersResponse = {
	message: string;
	count: number;
	users: Array<{
		discordId?: string;
		roles?: {
			in_discord?: boolean;
		};
		[key: string]: any;
	}>;
};
