import { StudyStep } from './study.types';
import { PickByType } from './utility.types';


export type StudyCatalogQuestionConfig = Record<string, unknown>;

export interface StudyCatalogQuestionConfigSlider extends StudyCatalogQuestionConfig{
	min?:number;
	minLabel?:string;
	step?:number;
	max?:number;
	maxLabel?:string;
}

export interface StudyCatalogQuestionConfigBinary extends StudyCatalogQuestionConfig{
	yesLabel?:string;
	noLabel?:string;
}

export interface StudyCatalogQuestionConfigNumber extends StudyCatalogQuestionConfig{
	min?:number;
	max?:number;
}

export interface StudyCatalogQuestionConfigChoices extends StudyCatalogQuestionConfig{
	/** maximum number of choices, defaults to 0, which is any number (incl. multiple) */
	limit:number;
}

export enum StudyCatalogQuestionType{
	Slider = 'slider',
	Choices = 'choices',
	Number = 'number',
	Text = 'text',
	Binary = 'binary',
}

export const StudyCatalogQuestionTypes = Object.values( StudyCatalogQuestionType );
export type StudyCatalogQuestionTranslatableKey = 'question';

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


type BoolAttri = PickByType<StudyCatalogQuestionGroup, boolean>;

export type StudyCatalogQuestionGroup = {
	key:string;
	questions:StudyCatalogQuestion[];
	'questions-first'?:boolean;
	'ask-missed'?:boolean;
	'askafter-enabled'?:boolean;
	'reminder-enabled'?:boolean;
	'askafter-time'?:string; // time HH:MM 24h
	'reminder-time'?:string; // time HH:MM 24h
}

export interface StudyCatalog extends StudyStep{
	format?:number;
	groups?:StudyCatalogQuestionGroup[];
}
