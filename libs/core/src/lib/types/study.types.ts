import { StudyCatalog } from './catalog.types';


export enum StudyStepType{
	Food = 'food',
	Mood = 'mood',
	Sleep = 'sleep',
	Catalog = 'catalog',
}

export interface StudyStep{
	version:string;
	type:StudyStepType;
}

export interface Study{
	name:string;
	steps?:StudyStepType[];
}

export interface StudyDTO{
	study:Study;

	food?:StudyStep;
	mood?:StudyStep;
	sleep?:StudyStep;
	catalog?:StudyCatalog;
}


