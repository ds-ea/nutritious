import { StudyStepTypes } from '@nutritious/core';


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
