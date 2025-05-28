import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CrudQuery, CrudQueryData } from '../core/decorators/crud-query.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';


@Controller( 'users' )
export class UsersController{
	constructor( private readonly userService:UsersService ){}


	@Post()
	async create( @Body() createUserDto:CreateUserDto, @CrudQuery() crudQuery:CrudQueryData ){
		const created = await this.userService.create( createUserDto, { crudQuery } );
		return created;
	}

	@Get()
	async findMany( @CrudQuery() crudQuery:CrudQueryData ){
		const matches = await this.userService.findMany( { crudQuery } );
		return matches;
	}

	@Get( ':id' )
	async findOne( @Param( 'id' ) id:string, @CrudQuery() crudQuery:CrudQueryData ){
		const match = await this.userService.findOne( id, { crudQuery } );
		return match;
	}

	@Patch( ':id' )
	async update(
		@Param( 'id' ) id:string,
		@Body() updateUserDto:UpdateUserDto,
		@CrudQuery() crudQuery:CrudQueryData,
	){
		const updated = await this.userService.update( id, updateUserDto, { crudQuery } );
		return updated;
	}

	@Delete( ':id' )
	async remove( @Param( 'id' ) id:string, @CrudQuery() crudQuery:CrudQueryData ){
		return this.userService.remove( id, { crudQuery } );
	}

}
