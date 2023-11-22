import importExportFeature from '@adminjs/import-export';
import passwordsFeature from '@adminjs/passwords';
import { $Enums, BLS, Log, LogFood, Page, Prisma, Study, User } from '@prisma/client';
import { DMMF } from '@prisma/client/runtime/library.js';
import { PropertyOptions, ResourceWithOptions } from 'adminjs';
import * as argon2 from 'argon2';
import { componentLoader, Components } from './components.js';


/** all registered models */
export type PrismaServiceModelName = Prisma.ModelName;
/** all registered enums */
export type PrismaServiceEnumName = keyof typeof $Enums;

const dataModel = Prisma.dmmf.datamodel;


const models = dataModel.models.reduce(
	( acc, model ) => (
		( acc[model.name as PrismaServiceModelName] = model ), acc
	),
	{} as Record<PrismaServiceModelName, DMMF.Model>,
);

export const enumMap = dataModel.enums.reduce(
	( acc, enumItem ) => (
		( acc[enumItem.name as PrismaServiceEnumName] = enumItem ), acc
	),
	{} as Record<PrismaServiceEnumName, DMMF.DatamodelEnum>,
);


export const resources:[ DMMF.Model, ResourceWithOptions['options'], ResourceWithOptions['features']? ] [] =
	[
		//					models.data_types,
		// ///////////////////////////////////////////////////////
		// BLS Data
		[
			models.BLS,
			{
				listProperties: [ 'id', 'bls_key', 'name_de' ] as Array<keyof BLS>,
			},
		],


		// ///////////////////////////////////////////////////////
		// Log
		[
			models.Log,
			{
				listProperties: [ 'study', 'user', 'date' ] as Array<keyof Log>,
				sort: { sortBy: 'date' as keyof Log, direction: 'desc' },
				properties: {
					study: { reference: 'Study', },
					user: { reference: 'User' },
				},
			},
			[
				importExportFeature( { componentLoader } ),
			],
		],

		// ///////////////////////////////////////////////////////
		// Log Food
		[
			models.LogFood,
			{
				listProperties: [ 'study', 'user', 'date', 'bls_key' ] as Array<keyof LogFood>,
				sort: { sortBy: 'date' as keyof Log, direction: 'desc' },
				properties: {
					study: { reference: 'Study', },
					user: { reference: 'User', },
				},

			},
		],

		// ///////////////////////////////////////////////////////
		// Study
		[
			models.Study,
			{
				listProperties: [ 'question_catalog', 'id', 'name', 'from', 'until', 'reg_limit', 'user_count', 'reg_public' ] as Array<keyof Study>,
				sort: { sortBy: 'id' as keyof Study, direction: 'desc' },
				properties: {
					name: { isTitle: true },
					question_catalog: {
						components: {
							//							edit: nutriComponents.QuestionCatalogElement,
							show: Components.QuestionCatalog,
							list: Components.TestComponent,
						},
					},

				} as Record<keyof Study, PropertyOptions>,
			},
		],


		// ///////////////////////////////////////////////////////
		// Page
		[
			models.Page,
			{
				listProperties: [ 'id', 'title', 'status' ] as Array<keyof Page>,
			},
		],


		// ///////////////////////////////////////////////////////
		// User
		[
			models.User,
			{
				listProperties: [ 'id', 'username', 'role_id', 'fs_study' ] as Array<keyof User>,
				properties: {
					'password': { isVisible: false },
					'role_id': {
						availableValues: [
							{ value: 1, label: 'Admin' },
							{ value: 2, label: 'Study Participant' },
						],
					},
					'fs_study': {
						reference: 'Study',
					},

				} as Record<keyof User, PropertyOptions>,
				sort: { sortBy: 'id', direction: 'asc' },
				navigation: { name: 'Users', icon: 'User' },
			},
			[
				passwordsFeature( {
					componentLoader,
					properties: {
						encryptedPassword: 'password',
						password: 'newPassword',
					},
					hash: argon2.hash,
				} ),
			],
		],
	];
