import { Body, Controller, Post, Req, UnauthorizedException } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { AuthCredentials, AuthLoginResponse } from '../../../../../libs/core/src/lib/types/auth.types';
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

		if( !authed?.access_token )
			throw new UnauthorizedException();

		return authed;
	}


	@Post( 'me' )
	public async userinfo( @Req() req:AuthedRequest ){

		if( !req.user )
			throw new UnauthorizedException();

		return req.user;

	}



}
