import { Body, Controller, Get, NotFoundException, Param, Post, Req } from '@nestjs/common';
import { LegacyFoodLog, LogEntryCatalogAnswers } from '@nutritious/core';
import { Study } from '@prisma/client';
import { AuthedRequest } from '../types/server.types';
import { FoodStudyService } from './food-study.service';


@Controller( 'foodstudy' )
export class FoodStudyController{

	constructor(
		private readonly fsService:FoodStudyService,
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
	public async logAnswers( @Req() req:AuthedRequest, @Body() data:LogEntryCatalogAnswers ){
		const recorded = await this.fsService.recordAnswers( data, req.user );
		return !!recorded;
	}


}
