import { Group, GroupMember, Participant, Study } from '@prisma/client';


export type PublicStudy = Pick<Study, 'id' | 'name'>;

export type SignupCheckPayload = {
	key:string;
	code:string;
}
export type SignupPayload = SignupCheckPayload & {
	signup:true;
	participant?:string;
}

export type SignupCheckResponse = {
	study:PublicStudy;
	instructions?:NonNullable<Group['instructions']>;
}

export type ParticipantCredentials = {
	login:string;
	password:string;
}

export type SignupResponse = {
	study:PublicStudy;
	credentials:ParticipantCredentials;

	participant:Participant['id'];
	badge?:Participant['badge'];
}



export type AssociatedStudies = {
	study:PublicStudy,
	badge:GroupMember['badge']
}[];
