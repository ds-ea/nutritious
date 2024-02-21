import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CrudQuery, CrudQueryData } from '../core/decorators/crud-query.decorator';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { PagesService } from './pages.service';


@Controller( 'pages' )
export class PagesController{
	constructor( private readonly pagesService:PagesService ){}

	@Post()
	async create( @Body() createPageDto:CreatePageDto, @CrudQuery() crudQuery:CrudQueryData ){
		const created = await this.pagesService.create( createPageDto, { crudQuery } );
		return created;
	}

	@Get()
	async findMany( @CrudQuery() crudQuery:CrudQueryData ){
		const matches = await this.pagesService.findMany( { crudQuery } );
		return matches;
	}

	@Get( ':id' )
	async findOne( @Param( 'id' ) id:string, @CrudQuery() crudQuery:CrudQueryData ){
		const match = await this.pagesService.findOne( id, { crudQuery } );
		return match;
	}

	@Patch( ':id' )
	async update(
		@Param( 'id' ) id:string,
		@Body() updatePageDto:UpdatePageDto,
		@CrudQuery() crudQuery:CrudQueryData,
	){
		const updated = await this.pagesService.update( id, updatePageDto, { crudQuery } );
		return updated;
	}

	@Delete( ':id' )
	async remove( @Param( 'id' ) id:string, @CrudQuery() crudQuery:CrudQueryData ){
		return this.pagesService.remove( id, { crudQuery } );
	}
}
