import { Body, Controller, ForbiddenException, Get, NotFoundException, Param, Post, Req, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { LegacyLog, LegacyLogFood, LegacyStudy } from '../../../../../libs/core/prisma/generated/client-legacy';
import { Public } from '../core/decorators/public.decorator';
import { AuthedRequest } from '../types/server.types';
import { LegacyStudyService } from './legacy-study.service';


@Controller( [ 'foodstudy' ] )
export class LegacyStudyController{

	constructor(
		private readonly fsService:LegacyStudyService,
	){}

	@Get( 'study' )
	public async getDefaultStudy( @Req() req:AuthedRequest ){

		const defaultStudyId = req.legacyUser?.fs_study;
		if( !defaultStudyId )
			throw new NotFoundException( 'no study assigned' );

		return this.getStudy( req, defaultStudyId );
	}

	@Get( 'study/:studyId' )
	public async getStudy( @Req() req:AuthedRequest, @Param( 'studyId' ) studyId:LegacyStudy['id'] ){

		const data = await this.fsService.getStudyData( studyId, req.legacyUser );
		if( !data )
			throw new NotFoundException( 'no such study' );

		return data;
	}


	@Post( 'food' )
	public async logFood( @Req() req:AuthedRequest, @Body() data:LegacyLogFood ){
		if( !req.legacyUser )
			throw new UnauthorizedException( 'must be a user in order to log food' );

		const recorded = await this.fsService.recordFood( data, req.legacyUser );
		return !!recorded;
	}

	@Post( 'log' )
	public async logAnswers( @Req() req:AuthedRequest, @Body() data:{ data:LegacyLog } ){
		if( !req.legacyUser )
			throw new UnauthorizedException( 'must be a user in order to log' );

		const recorded = await this.fsService.recordAnswers( data, req.legacyUser );
		return !!recorded;
	}


	@Public()
	@Post( 'signup' )
	public async signup( @Req() req:FastifyRequest | AuthedRequest, @Body() data:{ key:string, response:string, participant?:string, signup?:boolean } ){
		if( 'user' in req )
			throw new ForbiddenException( 'you are already logged in' );

		if( !data?.key?.length || !data?.response?.length )
			throw new UnprocessableEntityException( 'signup key and or password missing' );

		return this.fsService.studySignup( data.key, data.response, data.signup, data.participant );
	}


}