import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { type Prisma } from '@nutritious/core';
import { CrudQuery, CrudQueryData } from '../core/decorators/crud-query.decorator';
import { UpdateGroupDto } from './dto/update-group.dto';
import { GroupsService } from './groups.service';


@Controller( 'groups' )
export class GroupsController{
	constructor( private readonly groupsService:GroupsService ){}

	@Post()
	async create( @Body() createGroupDto:Prisma.GroupCreateInput, @CrudQuery() crudQuery:CrudQueryData ){
		const created = await this.groupsService.create( createGroupDto, { crudQuery } );
		return created;
	}

	@Get()
	async findMany( @CrudQuery() crudQuery:CrudQueryData ){
		const matches = await this.groupsService.findMany( { crudQuery } );
		return matches;
	}

	@Get( ':id' )
	async findOne( @Param( 'id' ) id:string, @CrudQuery() crudQuery:CrudQueryData ){
		const match = await this.groupsService.findOne( id, { crudQuery } );
		return match;
	}

	@Patch( ':id' )
	async update(
		@Param( 'id' ) id:string,
		@Body() updateGroupDto:UpdateGroupDto,
		@CrudQuery() crudQuery:CrudQueryData,
	){
		const updated = await this.groupsService.update( id, updateGroupDto, { crudQuery } );
		return updated;
	}

	@Delete( ':id' )
	async remove( @Param( 'id' ) id:string, @CrudQuery() crudQuery:CrudQueryData ){
		return this.groupsService.remove( id, { crudQuery } );
	}
}
