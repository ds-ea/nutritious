import { fastifyHelmet } from '@fastify/helmet';

import fastifyHttpProxy from '@fastify/http-proxy';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Eta } from 'eta';
import { join } from 'path';

import { AppModule } from './app/app.module';


async function bootstrap(){

	const app = await NestFactory.create<NestFastifyApplication>(
		AppModule,
		new FastifyAdapter(),
	);

	const adapter = app.getHttpAdapter();
	const fastify = adapter.getInstance();


	const adminProxyTarget = process.env['ADMIN_URL'] ?? undefined;
	if( adminProxyTarget )
		fastify.register( fastifyHttpProxy, {
			upstream: adminProxyTarget,
			prefix: '/admin',
			http2: false,
			proxyPayloads: false,
		} );

	// required for passing non-json data to proxied adminjs
	fastify.addContentTypeParser( '*', ( req, body, done ) => {
		done( null, body );
	} );



	// cors - yes
	app.enableCors( {
		origin: true,
		credentials: true,
		preflightContinue: true,
	} );

	await app.register( fastifyHelmet, {
		contentSecurityPolicy: {
			directives: {
				defaultSrc: [ `'self'` ],
				//				formAction: null, // currently important to allow redirect handling in OIDC flows
				styleSrc: [ `'self'`, `'unsafe-inline'` ],
				imgSrc: [ `'self'`, 'data:', 'validator.swagger.io' ],
				scriptSrc: [ `'self'`, `https: 'unsafe-inline'` ],
			},
		},
	} );


	app.useStaticAssets( {
		root: join( __dirname, 'public' ),
		prefix: '/public/',
	} );


	app.setViewEngine( {
		engine: {
			eta: new Eta(),
		},
		templates: join( __dirname, 'views' ),
		viewExt: 'eta',
		includeViewExtension: true,
		options: {
			useWith: true,
		},
	} );


	const globalPrefix = '';
	app.setGlobalPrefix( globalPrefix );
	const port = process.env['PORT'] || 80;
	const host = process.env['HOST'] || '0.0.0.0';
	await app.listen( port, host, ( err, addr ) => {
		if( err ){
			console.error( err );
		}else{
			const localAddr = addr
				.replace( '[::1]', 'localhost' )
				.replace( '0.0.0.0', 'localhost' )
			;
			Logger.log( `🚀 Application is running on: ${ localAddr }${ globalPrefix }` );
		}
	} );

}

bootstrap();
