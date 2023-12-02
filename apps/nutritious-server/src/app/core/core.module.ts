import { Module } from '@nestjs/common';
import { PrismaService } from '@nutritious/core';


@Module( {
	providers: [
		PrismaService,
	],
	exports: [
		PrismaService,
	],
} )
export class CoreModule{}
