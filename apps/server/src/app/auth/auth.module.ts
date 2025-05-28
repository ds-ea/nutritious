import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { JwtModuleOptions } from '@nestjs/jwt/dist/interfaces/jwt-module-options.interface';

import { CoreModule } from '../core/core.module';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';


@Module( {
	imports: [
		CoreModule,
		JwtModule.registerAsync( {
			inject: [ ConfigService ],
			useFactory: ( config:ConfigService ):JwtModuleOptions => {

				const secret = config.get<string>( 'JWT_SECRET' ) ?? undefined;
				if( !secret )
					throw new Error( 'JWT secret is not set up' );

				return {
					secret,
					global: true,
					signOptions: { expiresIn: 1800 },
				};
			},
		} ),
	],
	controllers: [ AuthController ],
	providers: [
		AuthService,
		AuthGuard,
		JwtService,
	],
	exports: [
		AuthService,
		JwtService,
	],
} )
export class AuthModule{}
