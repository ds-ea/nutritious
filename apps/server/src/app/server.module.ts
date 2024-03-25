import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { PrismaCrudModule } from 'nestjs-prisma-crud';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthGuard } from './auth/auth.guard';
import { AuthModule } from './auth/auth.module';
import { BlsModule } from './bls/bls.module';
import { CoreModule } from './core/core.module';
import { PrismaService } from './core/services/db/prisma.service';
import { GroupsModule } from './groups/groups.module';
import { LegacyMigrationsService } from './legacy-migrations.service';
import { LegacyStudyModule } from './legacy-study/legacy-study.module';
import { PagesModule } from './pages/pages.module';
import { PagesService } from './pages/pages.service';
import { ParticipantsModule } from './participants/participants.module';
import { SchedulesModule } from './schedules/schedules.module';
import { SlotsModule } from './slots/slots.module';
import { StepsModule } from './steps/steps.module';
import { StudiesModule } from './studies/studies.module';
import { StudyContentsModule } from './study-contents/study-contents.module';
import { StudyFormsModule } from './study-forms/study-forms.module';
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
		GroupsModule,
		StudiesModule,
		PagesModule,
		BlsModule,
		ParticipantsModule,
		SchedulesModule,
		StudyContentsModule,
		StudyFormsModule,
		SlotsModule,
		StepsModule,
	],
	controllers: [ AppController ],
	providers: [
		AppService,
		PagesService,
		LegacyMigrationsService,
		{
			provide: APP_GUARD,
			useClass: AuthGuard,
		},
	],
} )
export class ServerModule{}
