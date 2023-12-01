import AdminJSFastify, { AuthenticationOptions } from '@adminjs/fastify';
import { Database, Resource } from '@adminjs/prisma';
import { FastifySessionOptions } from '@fastify/session';
import { Logger } from '@nestjs/common';
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

	const port = Number(process.env['PORT'] || 80);
	const host = process.env['HOST'] || '0.0.0.0';

	app.listen( { port, host }, ( err, addr ) => {
		if( err ){
			console.error( err );
		}else{
			const localAddr = addr.replace('[::1]','localhost');
			console.log( `AdminJS started on ${localAddr}${ admin.options.rootPath }` );
		}
	} );
};

start();
