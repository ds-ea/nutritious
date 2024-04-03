import { Body, Controller, ForbiddenException, Get, NotFoundException, Param, Post, Req, UnprocessableEntityException } from '@nestjs/common';
import { AssociatedStudies, SignupCheckPayload, SignupPayload } from '@nutritious/core';
import { FastifyRequest } from 'fastify';
import { Public } from '../core/decorators/public.decorator';
import { AuthedRequest } from '../types/server.types';
import { StudyService } from './study.service';


@Controller( [ 'study' ] )
export class StudyController{

	constructor(
		private readonly studyService:StudyService,
	){}

	@Get( 'study' )
	public async getDefaultStudy( @Req() req:AuthedRequest ){

		throw new NotFoundException( 'no study assigned' );

		//		return this.getStudy( req, defaultStudyId );
	}

	@Get( 'study/:studyId' )
	public async getStudy( @Req() req:AuthedRequest, @Param( 'studyId' ) studyId:string ){

		const data = await this.studyService.getStudyData( studyId, req.user );
		if( !data )
			throw new NotFoundException( 'no such study' );

		return data;
	}


	@Public()
	@Post( 'signup' )
	public async signup( @Req() req:FastifyRequest | AuthedRequest, @Body() data:SignupCheckPayload | SignupPayload ){
		if( 'user' in req )
			throw new ForbiddenException( 'you are already logged in' );

		if( !data?.key?.length || !data?.code?.length )
			throw new UnprocessableEntityException( 'signup key and or password missing' );

		if( 'signup' in data )
			return this.studyService.studySignup( data.key, data.code, data.signup, data.participant );
		else
			return this.studyService.studySignup( data.key, data.code );
	}



	@Get( 'studies' )
	public async getAssociatedStudies( @Req() req:AuthedRequest ):Promise<AssociatedStudies | undefined>{
		if( !( 'participant' in req ) || !req.participant )
			throw new ForbiddenException( 'you are not logged in' );

		return this.studyService.getAssociatedStudies( req.participant.id );
	}

}
