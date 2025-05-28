import type { FormInputPreset } from '@prisma/client';
import { FormInputNecessity, FormInputType } from '../../lib/study';
import { ContentContainer } from '../content.types';


export type FormInputTypes = typeof FormInputType[ keyof typeof FormInputType ];
export type FormInputConfiguration = Record<string, unknown>;

export type FormInputConfigSlider = {
	step?:number;
	min?:number;
	max?:number;
	labelMin?:string;
	labelMax?:string;
}
export type FormInputConfigNumber = {
	min?:number;
	max?:number;
	prefix?:string;
	suffix?:string;
}
export type FormInputConfigText = {
	variant?:'string' | 'text';
	minLength?:number;
	maxLength?:number;
}
export type FormInputConfigBinary = {
	labelOn?:string;
	labelOff?:string;
}

export type FormInputConfigChoices = {
	limit?:number;
	options:{ label:string, value:string }[];
}

// @formatter:off
// prettier-ignore
export type FormInputConfigRating = (
	{
		behavior:'stepped' | 'linear' | 'stars';
		variant?:string;
		options?:{ label:string, value:string }[];
	} & Partial<FormInputConfigSlider>
) & (
	| { behavior:'stepped';
		options:{ label:string, value:string }[];
	}
	| ({ behavior:'linear' } & FormInputConfigSlider )
	| { behavior:'stars'; }
	);
// @formatter:on

export type FormInputRequiredLevels = typeof FormInputNecessity[ keyof typeof FormInputNecessity ];

export type FormItemTypes = 'question' | 'content';

export interface FormItem{
	type:FormItemTypes;
	heading?:string;
}

// @formatter:off
// prettier-ignore
export type InputRelatedConfig<T extends FormInputTypes | unknown>
	= T extends FormInputType.Slider  ? FormInputConfigSlider
	: T extends FormInputType.Text  ? FormInputConfigText
	: T extends FormInputType.Number  ? FormInputConfigNumber
	: T extends FormInputType.Choices  ? FormInputConfigChoices
	: T extends FormInputType.Binary  ? FormInputConfigBinary
	: T extends FormInputType.Rating  ? FormInputConfigRating
	: Record<string, unknown>;
// @formatter:on

export type InputPreset<T extends FormInputTypes | unknown = unknown> = {
	id:FormInputPreset['id'];
	inputType:T;
	name?:string;
	config:InputRelatedConfig<T>;
	translations?:string | null;
}
export type SafeInputPreset<T extends FormInputTypes | unknown = unknown> = Omit<InputPreset<T>, 'name'>;


export interface FormQuestion<
	T extends FormInputTypes = FormInputTypes,
	C extends FormInputConfiguration = InputRelatedConfig<T>
> extends FormItem{
	type:'question';
	key:string;
	heading:string;
	description?:string;
	required?:FormInputRequiredLevels;

	input:T;
	preset?:InputPreset['id'];
	config:C;
}

export interface FormContent extends FormItem{
	type:'content';
	content:ContentContainer;
}

export type FormSetup = {
	items:( FormQuestion | FormContent )[];
}


export type FormResponseData = {
	answers:Record<string, unknown>;
}
