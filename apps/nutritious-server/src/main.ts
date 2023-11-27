import { fastifyHelmet } from '@fastify/helmet';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { join } from 'path';

import { AppModule } from './app/app.module';

import * as fastifyHttpProxy from '@fastify/http-proxy';
import { Eta } from "eta";


async function bootstrap(){

	const app = await NestFactory.create<NestFastifyApplication>(
		AppModule,
		new FastifyAdapter(),
	);

	const adapter = app.getHttpAdapter();
	const fastify = adapter.getInstance();


	fastify.register( fastifyHttpProxy, {
		upstream: 'http://localhost:7880/admin',
		prefix: '/admin',
		http2: false,
		proxyPayloads: false,
	});

	// required for passing non-json data to proxied adminjs
	fastify.addContentTypeParser( '*', ( req, body, done )=>{
		done( null, body );
	} );



	// cors - yes
	app.enableCors( {
		credentials: true,
		origin: true,
	} );

	await app.register( fastifyHelmet, {
		contentSecurityPolicy: {
			directives: {
				defaultSrc: [`'self'`],
				formAction: null, // currently important to allow redirect handling in OIDC flows
				styleSrc: [`'self'`, `'unsafe-inline'`],
				imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
				scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
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
	const port = process.env['PORT'] || 3000;
	await app.listen( port );
	Logger.log(
		`🚀 Application is running on: http://localhost:${ port }/${ globalPrefix }`,
	);
}

bootstrap();
