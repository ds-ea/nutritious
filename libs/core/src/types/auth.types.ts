import type { Participant, User } from '@prisma/client';


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
	{
		user:{
			id:User['id'],
			name:User['name']
		},
	}
	|
	{
		participant:{
			id:Participant['id'],
			name:Participant['name'],
			settings?:Participant['settings']
			lang?:Participant['lang']
			timeZone?:Participant['timeZone']
		},
	};

export type AuthLoginResponse = {
	access_token?:string;
} & AuthUserInfo;
