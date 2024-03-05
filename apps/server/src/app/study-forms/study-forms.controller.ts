import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CrudQuery, CrudQueryData } from '../core/decorators/crud-query.decorator';
import { CreateStudyFormDto } from './dto/create-study-form.dto';
import { UpdateStudyFormDto } from './dto/update-study-form.dto';
import { StudyFormsService } from './study-forms.service';


@Controller( 'study-forms' )
export class StudyFormsController{
	constructor( private readonly studyFormsService:StudyFormsService ){}

	@Post()
	async create( @Body() createStudyFormDto:CreateStudyFormDto, @CrudQuery() crudQuery:CrudQueryData ){
		const created = await this.studyFormsService.create( createStudyFormDto, { crudQuery } );
		return created;
	}

	@Get()
	async findMany( @CrudQuery( { injectNotDeleted: false } ) crudQuery:CrudQueryData ){
		const matches = await this.studyFormsService.findMany( { crudQuery } );
		return matches;
	}

	@Get( ':id' )
	async findOne( @Param( 'id' ) id:string, @CrudQuery( { injectNotDeleted: false } ) crudQuery:CrudQueryData ){
		const match = await this.studyFormsService.findOne( id, { crudQuery } );
		return match;
	}

	@Patch( ':id' )
	async update(
		@Param( 'id' ) id:string,
		@Body() updateStudyFormDto:UpdateStudyFormDto,
		@CrudQuery( { injectNotDeleted: false } ) crudQuery:CrudQueryData,
	){
		const updated = await this.studyFormsService.update( id, updateStudyFormDto, { crudQuery } );
		return updated;
	}

	@Delete( ':id' )
	async remove( @Param( 'id' ) id:string, @CrudQuery( { injectNotDeleted: false } ) crudQuery:CrudQueryData ){
		return this.studyFormsService.remove( id, { crudQuery } );
	}
}
