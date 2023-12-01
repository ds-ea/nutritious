import { Body, Controller, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { AuthedRequest } from '../types/server.types';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';


@Controller( 'auth' )
export class AuthController{

	constructor(
		private readonly auth:AuthService,
	){}

	@Post( 'login' )
	public async login( @Req() req:FastifyRequest, @Body() credentials:Partial<{ password:string, username:string }> ){

		const { username, password } = credentials;
		const authed = username && password
					   ? await this.auth.signIn(  username, password )
					   : undefined;

		if( !authed?.access_token )
			throw new UnauthorizedException();

		return authed;
	}


	@UseGuards(AuthGuard)
	@Post('me')
	public async userinfo( @Req() req:AuthedRequest ){

		if( !req.user )
			throw new UnauthorizedException();

		return req.user;

	}



}
