/* eslint-disable */
export default {
	displayName: 'app',
	preset: '../../jest.preset.js',
	setupFilesAfterEnv: [ '<rootDir>/src/test-setup.ts' ],
	coverageDirectory: '../../coverage/apps/app',
	globals: {
		// Ionic and Stencil publish untranspiled ESM inside .js files. jest-preset-angular
		// only routes **/*.mjs through esbuild by default and hands everything else to the
		// Angular compiler, which leaves node_modules .js untouched - so anything importing
		// @ionic/angular dies on "Cannot use import statement outside a module".
		ngJest: {
			processWithEsbuild: [
				'**/*.mjs',
				'**/node_modules/@ionic/**/*.js',
				'**/node_modules/@stencil/**/*.js',
				'**/node_modules/ionicons/**/*.js',
			],
		},
	},
	transform: {
		'^.+\\.(ts|mjs|js|html)$': [
			'jest-preset-angular',
			{
				tsconfig: '<rootDir>/tsconfig.spec.json',
				stringifyContentPathRegex: '\\.(html|svg)$',
			},
		],
	},
	transformIgnorePatterns: [ 'node_modules/(?!.*(@ionic|@stencil|ionicons)|.*\\.mjs$)' ],
	snapshotSerializers: [
		'jest-preset-angular/build/serializers/no-ng-attributes',
		'jest-preset-angular/build/serializers/ng-snapshot',
		'jest-preset-angular/build/serializers/html-comment',
	],
};
