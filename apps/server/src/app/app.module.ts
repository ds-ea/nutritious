import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { PrismaService } from '@nutritious/core';
import { PrismaCrudModule } from 'nestjs-prisma-crud';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthGuard } from './auth/auth.guard';
import { AuthModule } from './auth/auth.module';
import { CoreModule } from './core/core.module';
import { LegacyStudyModule } from './legacy-study/legacy-study.module';
import { PageService } from './pages/page.service';
import { StudyModule } from './study/study.module';
import { UsersModule } from './users/users.module';


@Module( {
	imports: [
		ConfigModule.forRoot( { isGlobal: true } ),
		PrismaCrudModule.register( { prismaService: PrismaService } ),
		CoreModule,
		AuthModule,
		StudyModule,
		LegacyStudyModule,
		UsersModule,
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
