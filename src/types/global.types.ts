export type env = {
	[key: string]: string;
};

export type NicknameUpdateResponseType = {
	message: string;
	data: {
		totalUsersStatus: number;
		successfulNicknameUpdates: number;
		unsuccessfulNicknameUpdates: number;
	};
};
