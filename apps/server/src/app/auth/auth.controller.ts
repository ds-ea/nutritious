import { Body, Controller, Get, Post, Req, UnauthorizedException } from '@nestjs/common';
import type { AuthCredentials, AuthLoginResponse, AuthUserInfo } from '@nutritious/core';
import { FastifyRequest } from 'fastify';
import { Sanitize } from '../../../../../libs/core/src/lib/data/sanitize';
import { Public } from '../core/decorators/public.decorator';
import { AuthedRequest } from '../types/server.types';
import { AuthService } from './auth.service';


@Controller( 'auth' )
export class AuthController{

	constructor(
		private readonly auth:AuthService,
	){}

	@Public()
	@Post( 'login' )
	public async login( @Req() req:FastifyRequest, @Body() credentials:AuthCredentials ):Promise<AuthLoginResponse>{

		const authed = await this.auth.signIn( credentials );

		if( !authed?.token )
			throw new UnauthorizedException();

		return authed;
	}


	@Get( 'me' )
	public async userinfo( @Req() req:AuthedRequest ):Promise<AuthUserInfo>{

		if( req.participant )
			return { participant: Sanitize.safeParticipant( req.participant ) };

		if( req.user )
			return { user: Sanitize.safeUser( req.user ) };

		throw new UnauthorizedException();

	}



}
