/* eslint-disable */
export default {
	displayName: 'nutritious-admin-e2e',
	preset: '../..//jest.preset.js',
	setupFiles: ['<rootDir>/src/test-setup.ts'],
	testEnvironment: 'node',
	transform: {
		'^.+\\.[tj]s$': [
			'ts-jest',
			{
				tsconfig: '<rootDir>/tsconfig.spec.json',
			},
		],
	},
	moduleFileExtensions: ['ts', 'js', 'html'],
	coverageDirectory: '../..//coverage/nutritious-admin-e2e',
};
