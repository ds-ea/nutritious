import { DynamicModule, Module } from '@nestjs/common';
import { DMMF } from '@prisma/client/runtime/library';
import { PrismaService, PrismaServiceEnumName, PrismaServiceModelName } from '@nutritious/server';


type PseudoAdminJS = { registerAdapter:( options:unknown ) => void };

type PseudoAdminJSPrisma = {
	Resource:unknown,
	Database:unknown,
};

type PseudoAdminJSModule = {
	AdminModule:{
		createAdminAsync:( options:{
			useFactory:() => void
		} ) => Promise<DynamicModule>
	}
};

async function getAdminJS():Promise<PseudoAdminJSModule>{

	const { default: AdminJSPrisma } = await ( eval( `import('@adminjs/prisma')` ) as Promise<{ default:PseudoAdminJSPrisma }> );
	const { AdminJS } = await ( eval( `import('adminjs')` ) as Promise<{ AdminJS:PseudoAdminJS }> );

	AdminJS['registerAdapter']( {
		Resource: AdminJSPrisma.Resource,
		Database: AdminJSPrisma.Database,
	} );


	const module = await ( eval( `import('@adminjs/nestjs')` ) as Promise<{ default:PseudoAdminJSModule }> );
	return module.default;
}


const DEFAULT_ADMIN = {
	email: 'a',
	password: 'a',
};

const authenticate = async ( email:string, password:string ) => {
	if( email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password ){
		return Promise.resolve( DEFAULT_ADMIN );
	}
	return null;
};



export default ()=>
	getAdminJS().then( ( { AdminModule } ) => AdminModule['createAdminAsync']( {
		useFactory: () => {

			const client = new PrismaService();
			const dataModel = client._dmmf.datamodel;

			const models = dataModel.models.reduce(
				( acc, model ) => (
					( acc[model.name as PrismaServiceModelName] = model ), acc
				),
				{} as Record<PrismaServiceModelName, DMMF.Model>,
			);

			const enumMap = dataModel.enums.reduce(
				( acc, enumItem ) => (
					( acc[enumItem.name as PrismaServiceEnumName] = enumItem ), acc
				),
				{} as Record<PrismaServiceEnumName, DMMF.DatamodelEnum>,
			);

			const backendModels = [
				//					models.data_types,
				models.fs_bls,
				models.fs_log,
				models.fs_log_food,
				models.fs_studies,
				models.pages,
				models.users
			];

			return {
				adminJsOptions: {
					rootPath: '/admin',
					resources:
						Object.values(backendModels).map( model => ( {model, client, enumMap} ))
				},
				auth: {
					authenticate,
					cookieName: 'adminjs',
					cookiePassword: 'secret',
				},
				sessionOptions: {
					resave: true,
					saveUninitialized: true,
					secret: 'secret',
				},
			};
		},
	} ) );
