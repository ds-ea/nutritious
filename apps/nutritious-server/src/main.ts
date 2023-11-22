import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

import { AppModule } from './app/app.module';

import * as fastifyHttpProxy from '@fastify/http-proxy';


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


	const globalPrefix = 'api';
	app.setGlobalPrefix( globalPrefix );
	const port = process.env['PORT'] || 3000;
	await app.listen( port );
	Logger.log(
		`🚀 Application is running on: http://localhost:${ port }/${ globalPrefix }`,
	);
}

bootstrap();
