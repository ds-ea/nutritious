import { Body, Controller, Get, NotFoundException, Param, Post, Req, UseGuards } from '@nestjs/common';
import { PrismaService } from '@nutritious/server';
import { Study } from '@prisma/client';
import { AuthGuard } from '../auth/auth.guard';
import { AuthedRequest } from '../types/server.types';
import { FoodStudyService, LegacyFoodLog } from './food-study.service';

@Controller('foodstudy')
export class FoodStudyController {

	constructor(
		private readonly fsService:FoodStudyService
	){}

	@Get('study')
	public async getDefaultStudy( @Req()req:AuthedRequest ){
		const defaultStudyId = req.user?.fs_study;
		console.log(req.user);
		if( !defaultStudyId )
			throw new NotFoundException('no study assigned');

		return this.getStudy( req, defaultStudyId );
	}

	@Get('study/:studyId')
	public async getStudy( @Req() req:AuthedRequest, @Param('studyId') studyId:Study['id'] ){

		const data = await this.fsService.getStudyData( studyId, req.user );
		if( !data )
			throw new NotFoundException('no such study');

		return data;
	}


	@Post('food')
	public async logFood(@Req() req:AuthedRequest, @Body() data:LegacyFoodLog ){
		console.log('log food', data);

		const recorded = await this.fsService.recordFood( data, req.user  );

		return !!recorded;
	}


}
