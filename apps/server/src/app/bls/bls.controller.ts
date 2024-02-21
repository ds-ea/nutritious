import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CrudQuery, CrudQueryData } from '../core/decorators/crud-query.decorator';
import { BlsService } from './bls.service';
import { CreateBlDto } from './dto/create-bl.dto';
import { UpdateBlDto } from './dto/update-bl.dto';


@Controller( 'bls' )
export class BlsController{
	constructor( private readonly blsService:BlsService ){}

	@Post()
	async create( @Body() createBlDto:CreateBlDto, @CrudQuery() crudQuery:CrudQueryData ){
		const created = await this.blsService.create( createBlDto, { crudQuery } );
		return created;
	}

	@Get()
	async findMany( @CrudQuery() crudQuery:CrudQueryData ){
		const matches = await this.blsService.findMany( { crudQuery } );
		return matches;
	}

	@Get( ':id' )
	async findOne( @Param( 'id' ) id:string, @CrudQuery() crudQuery:CrudQueryData ){
		const match = await this.blsService.findOne( id, { crudQuery } );
		return match;
	}

	@Patch( ':id' )
	async update(
		@Param( 'id' ) id:string,
		@Body() updateBlDto:UpdateBlDto,
		@CrudQuery() crudQuery:CrudQueryData,
	){
		const updated = await this.blsService.update( id, updateBlDto, { crudQuery } );
		return updated;
	}

	@Delete( ':id' )
	async remove( @Param( 'id' ) id:string, @CrudQuery() crudQuery:CrudQueryData ){
		return this.blsService.remove( id, { crudQuery } );
	}
}
