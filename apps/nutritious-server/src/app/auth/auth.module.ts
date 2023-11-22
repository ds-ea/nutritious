import { Module } from '@nestjs/common';
import { PrismaService } from '@nutritious/server';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';


@Module( {
	controllers: [ AuthController ],
	providers: [
		AuthService,
		PrismaService,
	],
	exports:[
		AuthService
	]
} )
export class AuthModule{}
