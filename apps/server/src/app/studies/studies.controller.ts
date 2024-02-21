import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CrudQuery, CrudQueryData } from '../core/decorators/crud-query.decorator';
import { CreateStudyDto } from './dto/create-study.dto';
import { UpdateStudyDto } from './dto/update-study.dto';
import { StudiesService } from './studies.service';


@Controller( 'studies' )
export class StudiesController{
	constructor( private readonly studiesService:StudiesService ){}

	@Post()
	async create( @Body() createStudyDto:CreateStudyDto, @CrudQuery() crudQuery:CrudQueryData ){
		const created = await this.studiesService.create( createStudyDto, { crudQuery } );
		return created;
	}

	@Get()
	async findMany( @CrudQuery() crudQuery:CrudQueryData ){
		const matches = await this.studiesService.findMany( { crudQuery } );
		return matches;
	}

	@Get( ':id' )
	async findOne( @Param( 'id' ) id:string, @CrudQuery() crudQuery:CrudQueryData ){
		const match = await this.studiesService.findOne( id, { crudQuery } );
		return match;
	}

	@Patch( ':id' )
	async update(
		@Param( 'id' ) id:string,
		@Body() updateStudyDto:UpdateStudyDto,
		@CrudQuery() crudQuery:CrudQueryData,
	){
		const updated = await this.studiesService.update( id, updateStudyDto, { crudQuery } );
		return updated;
	}

	@Delete( ':id' )
	async remove( @Param( 'id' ) id:string, @CrudQuery() crudQuery:CrudQueryData ){
		return this.studiesService.remove( id, { crudQuery } );
	}
}
