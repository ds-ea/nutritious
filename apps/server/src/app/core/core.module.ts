import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaLegacyService, PrismaService } from '@nutritious/core';


@Module( {
	providers: [
		PrismaService,
		PrismaLegacyService,
	],
	exports: [
		PrismaService,
		PrismaLegacyService,
	],
} )
export class CoreModule{
	constructor( readonly config:ConfigService ){
		if( !config.get<string>( 'PW_SECRET' )?.length )
			throw new Error( 'PW_SECRET is missing' );
		if( !config.get<string>( 'JWT_SECRET' )?.length )
			throw new Error( 'JWT_SECRET is missing' );

	}
}
