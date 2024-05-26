import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { Sanitize } from '@nutritious/core';
import { CrudQuery, CrudQueryData } from '../core/decorators/crud-query.decorator';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { SchedulesService } from './schedules.service';


@Controller( 'schedules' )
export class SchedulesController{
	constructor( private readonly schedulesService:SchedulesService ){}

	@Post()
	async create( @Body() createScheduleDto:CreateScheduleDto, @CrudQuery( { injectNotDeleted: false } ) crudQuery:CrudQueryData ){
		const created = await this.schedulesService.create( createScheduleDto, { crudQuery } );
		return created;
	}

	@Get()
	async findMany( @CrudQuery( { injectNotDeleted: false } ) crudQuery:CrudQueryData ){
		const matches = await this.schedulesService.findMany( { crudQuery } );
		matches.data = Sanitize.enforceDeepState( matches.data, [ 'slots', 'slots.steps' ] );
		return matches;
	}

	@Get( ':id' )
	async findOne( @Param( 'id' ) id:string, @CrudQuery( { injectNotDeleted: false } ) crudQuery:CrudQueryData ){
		const match = await this.schedulesService.findOne( id, { crudQuery } );
		return Sanitize.enforceDeepState( match, [ 'slots', 'slots.steps' ] );
	}

	@Patch( ':id' )
	async update(
		@Param( 'id' ) id:string,
		@Body() updateScheduleDto:UpdateScheduleDto,
		@CrudQuery( { injectNotDeleted: false } ) crudQuery:CrudQueryData,
	){
		const updated = await this.schedulesService.update( id, updateScheduleDto, { crudQuery } );
		return updated;
	}

	@Delete( ':id' )
	async remove( @Param( 'id' ) id:string, @CrudQuery( { injectNotDeleted: false } ) crudQuery:CrudQueryData ){
		return this.schedulesService.remove( id, { crudQuery } );
	}
}
