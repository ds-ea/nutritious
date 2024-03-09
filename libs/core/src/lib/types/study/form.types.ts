export enum FormInputType{
	Slider = 'slider',
	Text = 'text',
	Number = 'number',
	Choices = 'choices',
	Binary = 'binary',
}

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


export enum FormInputNecessity{
	Must = 'must',
	Should = 'should',
	Ignore = 'ignore'
}

export type FormInputRequiredLevels = typeof FormInputNecessity[ keyof typeof FormInputNecessity ];

export type FormItemTypes = 'question' | 'content';
export type FormContentFormats = 'plain' | 'rich' | 'html';


export interface FormItem{
	type:FormItemTypes;
	heading?:string;
}

// @formatter:off
// prettier-ignore
type InputRelatedConfig<T extends FormInputTypes>
	= T extends FormInputType.Slider  ? FormInputConfigSlider
	: T extends FormInputType.Text  ? FormInputConfigText
	: T extends FormInputType.Number  ? FormInputConfigNumber
	: T extends FormInputType.Choices  ? FormInputConfigChoices
	: T extends FormInputType.Binary  ? FormInputConfigBinary
	: never;
// @formatter:on

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
	config:C;
}

export interface FormContent extends FormItem{
	type:'content';
	content:{
		[type in FormContentFormats]?:{
			data:string;
			meta?:Record<string, string>;
		}
	};
}

export type FormSetup = {
	items:( FormQuestion | FormContent )[];
}
