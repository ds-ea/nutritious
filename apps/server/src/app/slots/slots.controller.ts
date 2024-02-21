import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CrudQuery, CrudQueryData } from '../core/decorators/crud-query.decorator';
import { CreateSlotDto } from './dto/create-slot.dto';
import { UpdateSlotDto } from './dto/update-slot.dto';
import { SlotsService } from './slots.service';


@Controller( 'slots' )
export class SlotsController{
	constructor( private readonly slotsService:SlotsService ){}

	@Post()
	async create( @Body() createSlotDto:CreateSlotDto, @CrudQuery() crudQuery:CrudQueryData ){
		const created = await this.slotsService.create( createSlotDto, { crudQuery } );
		return created;
	}

	@Get()
	async findMany( @CrudQuery() crudQuery:CrudQueryData ){
		const matches = await this.slotsService.findMany( { crudQuery } );
		return matches;
	}

	@Get( ':id' )
	async findOne( @Param( 'id' ) id:string, @CrudQuery() crudQuery:CrudQueryData ){
		const match = await this.slotsService.findOne( id, { crudQuery } );
		return match;
	}

	@Patch( ':id' )
	async update(
		@Param( 'id' ) id:string,
		@Body() updateSlotDto:UpdateSlotDto,
		@CrudQuery() crudQuery:CrudQueryData,
	){
		const updated = await this.slotsService.update( id, updateSlotDto, { crudQuery } );
		return updated;
	}

	@Delete( ':id' )
	async remove( @Param( 'id' ) id:string, @CrudQuery() crudQuery:CrudQueryData ){
		return this.slotsService.remove( id, { crudQuery } );
	}
}
