import { fastifyHelmet } from '@fastify/helmet';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Eta } from 'eta';
import * as fs from 'fs';
import { join } from 'path';

import { ServerModule } from './app/server.module';


async function bootstrap(){

	const app = await NestFactory.create<NestFastifyApplication>(
		ServerModule,
		new FastifyAdapter(),
	);

	const adapter = app.getHttpAdapter();
	const fastify = adapter.getInstance();


	/*const adminProxyTarget = process.env['ADMIN_URL'] ?? undefined;
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
	} );*/



	// cors - yes
	app.enableCors( {
		origin: true,
		credentials: true,
		preflightContinue: true,
	} );

	await app.register( fastifyHelmet, {
		contentSecurityPolicy:
		// eslint-disable-next-line no-constant-condition
			process.env['NODE_ENV'] === 'development' && false
			? {

					directives: {
						defaultSrc: [ `'self'`, 'unpkg.com' ],
						styleSrc: [
							`'self'`,
							`'unsafe-inline'`,
							'cdn.jsdelivr.net',
							'fonts.googleapis.com',
							'unpkg.com',
						],
						fontSrc: [ `'self'`, 'fonts.gstatic.com', 'data:' ],
						imgSrc: [ `'self'`, 'data:', 'cdn.jsdelivr.net' ],
						scriptSrc: [
							`'self'`,
							`https: 'unsafe-inline'`,
							`cdn.jsdelivr.net`,
							`'unsafe-eval'`,
						],
					},
				}
			: {
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

	// server admin panel
	app.useStaticAssets( {
		root: join( __dirname, 'admin' ),
		prefix: '/admin',
		decorateReply: false,
		redirect: false,
		wildcard: false,
	} );
	// pseudo rewrite
	fastify.get( '/admin/*', ( req, res ) => {
		const stream = fs.readFileSync( join( __dirname, 'admin/index.html' ) );
		res.type( 'text/html' ).send( stream );
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
