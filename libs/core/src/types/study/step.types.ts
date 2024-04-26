import { StudyStepType } from '../../lib/study';
import { SafeParticipant } from '../auth.types';
import { SafeSlot, SafeStep } from './study.types';


export type StudyStepTypes = typeof StudyStepType[ keyof typeof StudyStepType ];



export type StepResponse<TData = unknown, TMeta = unknown> = {
	participant?:SafeParticipant['id'];

	/** unique per response -> per step */
	uid:string;
	/** shared between all step responses when submitting responses for one slot */
	suid:string;

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
