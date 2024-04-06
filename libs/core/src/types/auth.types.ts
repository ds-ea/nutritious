import { Participant, User } from '@prisma/client';


export type SafeUser = Pick<User, 'id' | 'name' | 'settings'>;
export type SafeParticipant = Pick<Participant, 'id' | 'name' | 'settings' | 'lang' | 'timeZone'>;

export type ParticipantAccount = {
	host?:string;
	hostName?:string;
	participant:SafeParticipant;
	token:string;
};

export type AuthUserCredentials = {
	email:string;
	password:string;
};

export  type AuthParticipantCredentials = {
	participant:string;
	password:string;
};

export type AuthCredentials = AuthUserCredentials | AuthParticipantCredentials;

export type AuthLoginPayload = {
	sub?:string | number;
};

export type AuthUserInfo =
	| { user:SafeUser }
	| { participant:SafeParticipant };

export type AuthLoginResponse =
	{
		token?:string;
		hostName?:string;
	}
	& AuthUserInfo
	;



