import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CrudQuery, CrudQueryData } from '../core/decorators/crud-query.decorator';
import { CreateStepDto } from './dto/create-step.dto';
import { UpdateStepDto } from './dto/update-step.dto';
import { StepsService } from './steps.service';


@Controller( 'steps' )
export class StepsController{
	constructor( private readonly stepsService:StepsService ){}

	@Post()
	async create( @Body() createStepDto:CreateStepDto, @CrudQuery() crudQuery:CrudQueryData ){
		const created = await this.stepsService.create( createStepDto, { crudQuery } );
		return created;
	}

	@Get()
	async findMany( @CrudQuery() crudQuery:CrudQueryData ){
		const matches = await this.stepsService.findMany( { crudQuery } );
		return matches;
	}

	@Get( ':id' )
	async findOne( @Param( 'id' ) id:string, @CrudQuery() crudQuery:CrudQueryData ){
		const match = await this.stepsService.findOne( id, { crudQuery } );
		return match;
	}

	@Patch( ':id' )
	async update(
		@Param( 'id' ) id:string,
		@Body() updateStepDto:UpdateStepDto,
		@CrudQuery() crudQuery:CrudQueryData,
	){
		const updated = await this.stepsService.update( id, updateStepDto, { crudQuery } );
		return updated;
	}

	@Delete( ':id' )
	async remove( @Param( 'id' ) id:string, @CrudQuery() crudQuery:CrudQueryData ){
		return this.stepsService.remove( id, { crudQuery } );
	}
}
