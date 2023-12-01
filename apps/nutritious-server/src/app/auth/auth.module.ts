import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtModuleOptions } from '@nestjs/jwt/dist/interfaces/jwt-module-options.interface';
import { PrismaService } from '@nutritious/server';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';


@Module( {
	imports: [
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
		PrismaService,
	],
	exports: [
		AuthService,
	],
} )
export class AuthModule{}
