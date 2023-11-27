import AdminJSFastify, { AuthenticationOptions } from '@adminjs/fastify';
import { Database, Resource } from '@adminjs/prisma';
import { FastifySessionOptions } from '@fastify/session';
import { PrismaClient } from '@prisma/client';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';

import AdminJS from 'adminjs';
import Fastify from 'fastify';
import { AuthService } from './auth/auth.helper.js';
import { componentLoader } from './resources/components.js';
import { enumMap, resources } from './resources/setup.js';


type Callback = ( err?:any ) => void;
type CallbackSession = ( err:any, result?:Fastify.Session | null ) => void;



// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
BigInt.prototype.toJSON = function(){ return this.toString(); };


const PORT = 7880;

const start = async () => {

	const prisma = new PrismaClient();
	AdminJS.registerAdapter( { Database, Resource } );

	const app = Fastify( {} );
	const admin = new AdminJS( {
		rootPath: '/admin',
		componentLoader,
		resources:
			Object.values( resources ).map(
				( [ model, options, features ] ) =>
					( { model, options, features, client: prisma, enumMap } ),
			),
	} );

	const cookieSecret = 'asdlknasdfjaposihferut34u5b09347trdghfvkjh';

	const authService = new AuthService( prisma );
	const auth:AuthenticationOptions = {
		authenticate: ( email, password ) => authService.checkCredentials( { email }, password ),
		cookieName: 'nutritious-admin',
		cookiePassword: cookieSecret,
	};

	const sessionStore = new PrismaSessionStore( prisma, {
		sessionModelName: 'adminSession',
		dbRecordIdIsSessionId: false,
	} );

	const sessionOptions:FastifySessionOptions = {
		store: sessionStore,
		saveUninitialized: false,
		secret: cookieSecret,
		cookie: {
			httpOnly: true,
			secure: 'auto',
		},
	};


	await AdminJSFastify.buildAuthenticatedRouter(
		admin,
		auth,
		app,
		sessionOptions,
	);

	app.listen( { port: PORT }, ( err, addr ) => {
		if( err ){
			console.error( err );
		}else{
			console.log( `AdminJS started on http://localhost:${ PORT }${ admin.options.rootPath }` );
		}
	} );
};

start();
