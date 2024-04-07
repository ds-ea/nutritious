import type { Group, GroupMember, Participant, Schedule, Slot, Step, Study, StudyContent, StudyForm } from '@prisma/client';
import { StudyStepTypes } from './step.types';


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


export type SafeSchedule = Pick<Schedule, 'id' | 'daySetup' | 'weekSetup'>;

export type SafeStep =
	Pick<Step, 'id' | 'ref'>
	& { type:StudyStepTypes };

export type SafeSlot = Omit<Slot, 'createdAt' | 'updatedAt' | 'scheduleId' | 'schedule' | 'steps'>;
export type PreparedSlot = SafeSlot & { steps?:SafeStep[] };

export type PreparedSchedule = {
	schedule:SafeSchedule;
	slots:PreparedSlot[];
	refs?:Partial<
		& { form:SafeStudyForm[] }
		& { content:SafeStudyContent[] }
	>;

}

export type PreparedStudy = {
	study:PublicStudy;
	badge:GroupMember['badge'];
	schedule?:PreparedSchedule;
}

export type SafeStudyForm = Pick<StudyForm, 'id' | 'translations' | 'intro' | 'title' | 'setup'>;
export type SafeStudyContent = Pick<StudyContent, 'id' | 'translations' | 'title' | 'content'>;
