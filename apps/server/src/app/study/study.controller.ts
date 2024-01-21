import { Body, Controller, ForbiddenException, Get, NotFoundException, Param, Post, Req, UnprocessableEntityException } from '@nestjs/common';
import { LegacyFoodLog, LogEntryCatalogAnswers } from '@nutritious/core';
import { Study } from '@prisma/client';
import { FastifyRequest } from 'fastify';
import { Public } from '../core/decorators/public.decorator';
import { AuthedRequest } from '../types/server.types';
import { StudyService } from './study.service';


@Controller( [ 'study', 'foodstudy' ] )
export class StudyController{

	constructor(
		private readonly fsService:StudyService,
	){}

	@Get( 'study' )
	public async getDefaultStudy( @Req() req:AuthedRequest ){

		const defaultStudyId = req.user?.fs_study;
		if( !defaultStudyId )
			throw new NotFoundException( 'no study assigned' );

		return this.getStudy( req, defaultStudyId );
	}

	@Get( 'study/:studyId' )
	public async getStudy( @Req() req:AuthedRequest, @Param( 'studyId' ) studyId:Study['id'] ){

		const data = await this.fsService.getStudyData( studyId, req.user );
		if( !data )
			throw new NotFoundException( 'no such study' );

		return data;
	}


	@Post( 'food' )
	public async logFood( @Req() req:AuthedRequest, @Body() data:LegacyFoodLog ){
		const recorded = await this.fsService.recordFood( data, req.user );
		return !!recorded;
	}

	@Post( 'log' )
	public async logAnswers( @Req() req:AuthedRequest, @Body() data:{ data:LogEntryCatalogAnswers } ){
		const recorded = await this.fsService.recordAnswers( data, req.user );
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
