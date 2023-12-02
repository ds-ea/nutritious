import { Module } from '@nestjs/common';
import { PrismaService } from '@nutritious/server';

@Module({
	providers:[
		PrismaService
	],
	exports:[
		PrismaService,
	],
})
export class CoreModule {}
