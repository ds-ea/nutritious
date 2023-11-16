import { Module } from '@nestjs/common';
import injectAdminJs from './adminjs/inject-admin-js';

import { AppController } from './app.controller';
import { AppService } from './app.service';


@Module( {
	imports: [

		injectAdminJs(),


	],
	controllers: [ AppController ],
	providers: [ AppService ],
} )
export class AppModule{}
