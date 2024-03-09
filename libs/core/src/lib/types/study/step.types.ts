export enum StudyStepType{
	'Content' = 'content',
	'Form' = 'form',
	'BlsFood' = 'bls-food-entry',
}

export type StudyStepTypes = typeof StudyStepType[ keyof typeof StudyStepType ];

export const StudyStepTypeMeta:Record<StudyStepTypes, { name:string, icon:string }> = {
	content: {
		name: 'Content',
		icon: 'Newspaper',
	},
	form: {
		name: 'Form',
		icon: 'Quiz',
	},
	'bls-food-entry': {
		name: 'BLS Food Entry',
		icon: 'EmojiFoodBeverage',
	},
};
