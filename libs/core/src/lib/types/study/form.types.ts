export enum FormInputType{
	Slider = 'slider',
	Text = 'text',
	Number = 'number',
	Choices = 'choices',
	Binary = 'binary',
}


export type FormInputTypes = typeof FormInputType[ keyof typeof FormInputType ];

export enum FormInputNecessity{
	Must = 'must',
	Should = 'should',
	Ignore = 'ignore'
}

export type FormInputRequiredLevels = typeof FormInputNecessity[ keyof typeof FormInputNecessity ];

export type FormItemTypes = 'question' | 'content';
export type FormInputConfiguration = Record<string, unknown>;

export interface FormItem{
	nope?:boolean;
	type:FormItemTypes;
}

export interface FormQuestion<T extends FormInputConfiguration = FormInputConfiguration> extends FormItem{
	key:string;
	label:string;
	description?:string;
	required?:FormInputRequiredLevels;

	input:FormInputTypes;
	config:FormInputConfiguration;
}

export interface FormContent extends FormItem{
	title?:string;
	content:string;

}

export type    FormSetup = {
	items:FormItem[];
}
