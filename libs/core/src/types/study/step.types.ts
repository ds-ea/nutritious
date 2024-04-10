import { StudyStepType } from '../../lib/study';
import { SafeParticipant } from '../auth.types';
import { SafeSlot, SafeStep } from './study.types';


export type StudyStepTypes = typeof StudyStepType[ keyof typeof StudyStepType ];



export type StepResponse<T = unknown> = {
	participant?:SafeParticipant['id'];

	step:SafeStep['id'];

	slot:SafeSlot['id'];
	slotKey?:SafeSlot['key'];

	created:Date | string;
	updated:Date | string;

	data:T;
};
