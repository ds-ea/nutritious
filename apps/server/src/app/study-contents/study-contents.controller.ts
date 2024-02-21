import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CrudQuery, CrudQueryData } from '../core/decorators/crud-query.decorator';
import { CreateStudyContentDto } from './dto/create-study-content.dto';
import { UpdateStudyContentDto } from './dto/update-study-content.dto';
import { StudyContentsService } from './study-contents.service';


@Controller( 'study-contents' )
export class StudyContentsController{
	constructor( private readonly studyContentsService:StudyContentsService ){}

	@Post()
	async create( @Body() createStudyContentDto:CreateStudyContentDto, @CrudQuery() crudQuery:CrudQueryData ){
		const created = await this.studyContentsService.create( createStudyContentDto, { crudQuery } );
		return created;
	}

	@Get()
	async findMany( @CrudQuery() crudQuery:CrudQueryData ){
		const matches = await this.studyContentsService.findMany( { crudQuery } );
		return matches;
	}

	@Get( ':id' )
	async findOne( @Param( 'id' ) id:string, @CrudQuery() crudQuery:CrudQueryData ){
		const match = await this.studyContentsService.findOne( id, { crudQuery } );
		return match;
	}

	@Patch( ':id' )
	async update(
		@Param( 'id' ) id:string,
		@Body() updateStudyContentDto:UpdateStudyContentDto,
		@CrudQuery() crudQuery:CrudQueryData,
	){
		const updated = await this.studyContentsService.update( id, updateStudyContentDto, { crudQuery } );
		return updated;
	}

	@Delete( ':id' )
	async remove( @Param( 'id' ) id:string, @CrudQuery() crudQuery:CrudQueryData ){
		return this.studyContentsService.remove( id, { crudQuery } );
	}
}
