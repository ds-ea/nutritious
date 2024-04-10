import type { Group, GroupMember, Participant, Schedule, Slot, Step, Study, StudyContent, StudyForm } from '@prisma/client';
import { StudyStepType } from '../../lib/study';
import { FormSetup } from './form.types';
import { StepResponse, StudyStepTypes } from './step.types';


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

//export type SafeSlot = Omit<Slot, 'createdAt' | 'updatedAt' | 'scheduleId' | 'schedule' | 'steps'>;
export type SafeSlot = Pick<Slot,
	'id' |
	'key' |
	'name' |
	'translations' |
	'obligatory' |
	'event' |
	'date' |
	'availability' |
	'frequency' |
	'reminders' |
	'dependsOn'>;


export type PreparedSlot = SafeSlot & { steps?:SafeStep[] };

export type PreparedSchedule = {
	schedule:SafeSchedule;
	slots:PreparedSlot[];
	refs?:Partial<
		& { [StudyStepType.Form]:SafeStudyForm[] }
		& { [StudyStepType.Content]:SafeStudyContent[] }
		& { [type:string]:{ id:string }[] }
	>;
}

export type MatchedSlot = {
	prepared:PreparedSlot;
	refs:{
		[StudyStepType.Form]?:Record<SafeStudyForm['id'], SafeStudyForm>,
		[StudyStepType.Content]?:Record<SafeStudyContent['id'], SafeStudyContent>,
	} & { [type:string]:Record<string, unknown> };
}


export type PreparedStudy = {
	study:PublicStudy;
	badge:GroupMember['badge'];
	schedule?:PreparedSchedule;
}

export type SafeStudyForm = Pick<StudyForm, 'id' | 'translations' | 'intro' | 'title'>
	& { setup:FormSetup };

export type SafeStudyContent = Pick<StudyContent, 'id' | 'translations' | 'title' | 'content'>;



export type SubmitResponsesPayload = {
	responses:( StepResponse & { _study:Study['id'] } )[];
}
