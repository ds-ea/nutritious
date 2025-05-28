/** @deprecated */
export enum StudyStepType{
	Food = 'food',
	Mood = 'mood',
	Sleep = 'sleep',
	Catalog = 'catalog',
}

/** @deprecated */
export interface StudyStep{
	version:string;
	type:StudyStepType;
}

/** @deprecated */
export interface Study{
	name:string;
	steps?:StudyStepType[];
}

/** @deprecated */
export interface StudyDTO{
	study:Study;

	food?:StudyStep;
	mood?:StudyStep;
	sleep?:StudyStep;
	catalog?:StudyCatalog;
}

/** @deprecated */
export interface StudyCatalogQuestionConfig{
}

/** @deprecated */
export interface StudyCatalogQuestionConfigSlider extends StudyCatalogQuestionConfig{
	min?:number;
	minLabel?:string;
	step?:number;
	max?:number;
	maxLabel?:string;
}

/** @deprecated */
export interface StudyCatalogQuestionConfigBinary extends StudyCatalogQuestionConfig{
	yesLabel?:string;
	noLabel?:string;
}

/** @deprecated */
export interface StudyCatalogQuestionConfigNumber extends StudyCatalogQuestionConfig{
	min?:number;
	max?:number;
}

/** @deprecated */
export interface StudyCatalogQuestionConfigChoices extends StudyCatalogQuestionConfig{
	/** maximum number of choices, defaults to 0, which is any number (incl. multiple) */
	limit:number;
}

/** @deprecated */
export enum StudyCatalogQuestionType{
	Slider = 'slider',
	Choices = 'choices',
	Number = 'number',
	Text = 'text',
	Binary = 'binary',
}

/** @deprecated */
export const StudyCatalogQuestionTypes = Object.values( StudyCatalogQuestionType );
/** @deprecated */
export type StudyCatalogQuestionTranslatableKey = 'question';

/** @deprecated */
export interface StudyCatalogQuestion<C extends StudyCatalogQuestionConfig = any>{
	type:StudyCatalogQuestionType;
	key:string;
	question:string;

	translated?:{
		[langKey:string]:{
			question:string;
		}
	};

	config:C;
	choices?:{
		label:string;
		value:string;
	}[];
}

/** @deprecated */
export interface StudyCatalogQuestionGroup{
	key:string;
	questions:StudyCatalogQuestion[];
	'questions-first'?:boolean;
	'ask-missed'?:boolean;
	'askafter-enabled'?:boolean;
	'reminder-enabled'?:boolean;
	'askafter-time'?:string; // time HH:MM 24h
	'reminder-time'?:string; // time HH:MM 24h
}

/** @deprecated */
export interface StudyCatalog extends StudyStep{
	format?:number;
	groups?:StudyCatalogQuestionGroup[];
}

/** @deprecated */
export type StudyParticipantCredentials = {
	username:string;
	password:string;
	participant:string;
}
