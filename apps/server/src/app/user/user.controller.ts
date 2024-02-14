import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { Public } from '../core/decorators/public.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';


@Controller( 'users' )
@Public()
export class UserController{
	constructor( private readonly userService:UserService ){}


	@Post()
	async create( @Body() createUserDto:CreateUserDto, @Query( 'crudQuery' ) crudQuery:string ){
		const created = await this.userService.create( createUserDto, { crudQuery } );
		return created;
	}

	@Get()
	async findMany( @Query( 'crudQuery' ) crudQuery:string ){
		const matches = await this.userService.findMany( { crudQuery } );
		return matches;
	}

	@Get( ':id' )
	async findOne( @Param( 'id' ) id:string, @Query( 'crudQuery' ) crudQuery:string ){
		const match = await this.userService.findOne( id, { crudQuery } );
		return match;
	}

	@Patch( ':id' )
	async update(
		@Param( 'id' ) id:string,
		@Body() updateUserDto:UpdateUserDto,
		@Query( 'crudQuery' ) crudQuery:string,
	){
		const updated = await this.userService.update( id, updateUserDto, { crudQuery } );
		return updated;
	}

	@Delete( ':id' )
	async remove( @Param( 'id' ) id:string, @Query( 'crudQuery' ) crudQuery:string ){
		return this.userService.remove( id, { crudQuery } );
	}

}