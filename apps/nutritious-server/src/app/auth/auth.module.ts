import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { JwtModuleOptions } from '@nestjs/jwt/dist/interfaces/jwt-module-options.interface';
import { PrismaService } from '@nutritious/server';
import { CoreModule } from '../core/core.module';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';


@Module( {
	imports: [
		CoreModule,
		JwtModule.registerAsync({
			useFactory:():JwtModuleOptions=>{
				const secret = process.env['JWT_SECRET'] ?? undefined;
				if( !secret )
					throw new Error('JWT secret is not set up')

				return {
					secret,
					global: true,
					signOptions: {expiresIn: 604800}
				}
			}
		})
	],
	controllers: [ AuthController ],
	providers: [
		AuthService,
		AuthGuard,
		JwtService
	],
	exports: [
		AuthService,
		JwtService
	],
} )
export class AuthModule{}
