import { SafeStep, StudyStepTypes } from '../../types';
import { StudyStepType } from './enums';


const actionStepTypes:StudyStepTypes[] = [
	StudyStepType.BlsFood,
	StudyStepType.Form,
];
const contentStepTypes:StudyStepTypes[] = [
	StudyStepType.Content,
];

export function containsOnlyContentSteps( steps?:SafeStep[] ):boolean{
	return !!( steps?.length && !( steps.find( step => !contentStepTypes.includes( step.type ) ) ) );
}

export function containsActionStep( steps?:SafeStep[] ):boolean{
	return !!steps?.find( step => actionStepTypes.includes( step.type ) );
}
