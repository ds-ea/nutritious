import { ComponentLoader } from 'adminjs';

export const componentLoader = new ComponentLoader();
export const Components = {
	QuestionCatalog: componentLoader.add('QuestionCatalog', '../components/question-catalog'),
	TestComponent: componentLoader.add('TestComponent', '../components/test')
};

