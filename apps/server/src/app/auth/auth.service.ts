import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Prisma } from '@nutritious/core';
import { Participant, User } from '@prisma/client';
import * as argon2 from 'argon2';
import * as bcrypt from 'bcrypt';
import dayjs from 'dayjs';
import { AuthCredentials, AuthLoginResponse, AuthUserInfo } from '../../../../../libs/core/src/lib/types/auth.types';
import { PrismaService } from '../core/services/db/prisma.service';


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
		const secret = Buffer.from( this.config.getOrThrow<string>( 'PW_SECRET' ), 'utf-8' );
		return argon2.verify( hash, plain, { secret } );
	}

	public async checkCredentials( credentials:AuthCredentials ):Promise<{ user:User } | { participant:Participant } | undefined>{
		if( !credentials?.password?.length )
			return undefined;

		let password:User['password'] | Participant['password'] | undefined;
		let data:{ user:User } | { participant:Participant } | undefined = undefined;


		// participant login
		if( 'participant' in credentials ){
			const where:Prisma.ParticipantWhereUniqueInput = { login: credentials.participant };
			const participant = await this.prisma.participant.findUnique( { where } );
			if( participant?.state === 'ENABLED' ){
				password = participant.password;
				data = { participant };
			}



		}else{ // user login

			const where:Prisma.UserWhereUniqueInput = { email: credentials.email };
			const user = await this.prisma.user.findUnique( { where } );
			if( user?.state === 'ENABLED' ){
				password = user.password;
				data = { user };
			}
		}

		if( !password?.length )
			return undefined;

		if( !data || !( await this.verifyPassword( credentials.password, password ) ) )
			return undefined;

		return data;

		/*return {
			id: user.id,
			role_id: user.role_id,

			name: user.name,
			username: user.username,
			email: user.email,

			settings: user.settings,
			fs_study: user.fs_study,
			fs_participant: user.fs_participant,
		} as LegacyUser;*/
	}

	async signIn( credentials:AuthCredentials ):Promise<AuthLoginResponse | undefined>{

		const authorized = await this.checkCredentials( credentials );

		if( !authorized )
			return undefined;

		const sub =
			'user' in authorized
			? { user: authorized.user.id }
			: { participant: authorized.participant.id };

		const userInfo:AuthUserInfo =
			'user' in authorized
			? {
					user: {
						id: authorized.user.id,
						name: authorized.user.name,
					},
				}
			: {
					participant: {
						id: authorized.participant.id,
						name: authorized.participant.name,
						settings: authorized.participant.settings,
						lang: authorized.participant.lang,
						timeZone: authorized.participant.timeZone,
					},
				};

		const exp = dayjs().add( 30, 'minutes' ).unix();

		return {
			access_token: await this.jwtService.signAsync(
				{ sub },
				{
					secret: this.config.get( 'JWT_SECRET' ),
					expiresIn: exp,
				},
			),
			...userInfo,
		};

	}

}
