import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';


import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthGuard } from './auth/auth.guard';
import { AuthModule } from './auth/auth.module';
import { CoreModule } from './core/core.module';
import { PageService } from './pages/page.service';
import { StudyModule } from './study/study.module';


@Module( {
	imports: [
		ConfigModule.forRoot( { isGlobal: true } ),
		CoreModule,
		AuthModule,
		StudyModule,
	],
	controllers: [ AppController ],
	providers: [
		AppService,
		PageService,
		{
			provide: APP_GUARD,
			useClass: AuthGuard,
		},
	],
} )
export class AppModule{}
