import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthGuard } from './auth/auth.guard';
import { AuthModule } from './auth/auth.module';
import { CoreModule } from './core/core.module';
import { FoodStudyModule } from './food-study/food-study.module';
import { PageService } from './pages/page.service';


@Module( {
	imports: [
		CoreModule,
		AuthModule,
		FoodStudyModule,
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
