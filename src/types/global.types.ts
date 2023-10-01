export type env = {
	[key: string]: string;
};

export type nicknameUpdateResponseType = {
	message: string;
	data: {
		totalUsersStatus: number;
		successfulNicknameUpdates: number;
		unsuccessfulNicknameUpdates: number;
	};
};
