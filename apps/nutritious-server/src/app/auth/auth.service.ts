import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@nutritious/core';
import { User } from '@prisma/client';
import * as argon2 from 'argon2';
import * as bcrypt from 'bcrypt';


@Injectable()
export class AuthService{

	constructor(
		private readonly prisma:PrismaService,
		private readonly jwtService:JwtService,
		private readonly config:ConfigService,
	){
	}

	/**
	 * validates password against hash, automatically differentiates between legacy bcrypt and newer argon2
	 */
	private async verifyPassword( plain:string, hash:string ):Promise<boolean>{
		if( !plain?.length || !hash?.length )
			return false;

		// bcrypt
		if( hash.substring( 0, 4 ) === '$2y$' ){
			const convertedHash = hash.replace( /^\$2y(.+)$/i, '$2a$1' );
			return bcrypt.compare( plain, convertedHash );
		}

		// argon2
		return argon2.verify( hash, plain );
	}

	public async checkCredentials( login:{ username:string } | { email:string }, password:string ):Promise<User | undefined>{
		const where = 'username' in login ? { username: login.username } : { email: login.email };
		const user = await this.prisma.user.findUnique( { where } );
		if( !user || !( await this.verifyPassword( password, user.password ) ) )
			return undefined;

		return {
			id: user.id,
			role_id: user.role_id,

			name: user.name,
			username: user.username,
			email: user.email,

			settings: user.settings,
			fs_study: user.fs_study,
			fs_participant: user.fs_participant,
		} as User;
	}

	async signIn( username:string, password:string ){
		const authorizedUser = await this.checkCredentials( { username }, password );

		if( !authorizedUser )
			return undefined;

		const payload = { sub: authorizedUser.id };
		return {
			access_token: await this.jwtService.signAsync(
				payload,
				{ secret: this.config.get( 'JWT_SECRET' ) },
			),
		};

	}

}
