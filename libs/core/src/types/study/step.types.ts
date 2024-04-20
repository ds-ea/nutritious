import { StudyStepType } from '../../lib/study';
import { SafeParticipant } from '../auth.types';
import { SafeSlot, SafeStep } from './study.types';


export type StudyStepTypes = typeof StudyStepType[ keyof typeof StudyStepType ];



export type StepResponse<TData = unknown, TMeta = unknown> = {
	participant?:SafeParticipant['id'];

	uid:string;

	step:SafeStep['id'];
	type:SafeStep['type'] | string;

	slot:SafeSlot['id'];
	slotKey?:SafeSlot['key'];

	created:Date | string;
	updated:Date | string;
	forDay:string;

	meta?:TMeta;
	data:TData
};
