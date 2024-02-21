import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CrudQuery, CrudQueryData } from '../core/decorators/crud-query.decorator';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { UpdateParticipantDto } from './dto/update-participant.dto';
import { ParticipantsService } from './participants.service';


@Controller( 'participants' )
export class ParticipantsController{
	constructor( private readonly participantsService:ParticipantsService ){}

	@Post()
	async create( @Body() createParticipantDto:CreateParticipantDto, @CrudQuery() crudQuery:CrudQueryData ){
		const created = await this.participantsService.create( createParticipantDto, { crudQuery } );
		return created;
	}

	@Get()
	async findMany( @CrudQuery() crudQuery:CrudQueryData ){
		const matches = await this.participantsService.findMany( { crudQuery } );
		return matches;
	}

	@Get( ':id' )
	async findOne( @Param( 'id' ) id:string, @CrudQuery() crudQuery:CrudQueryData ){
		const match = await this.participantsService.findOne( id, { crudQuery } );
		return match;
	}

	@Patch( ':id' )
	async update(
		@Param( 'id' ) id:string,
		@Body() updateParticipantDto:UpdateParticipantDto,
		@CrudQuery() crudQuery:CrudQueryData,
	){
		const updated = await this.participantsService.update( id, updateParticipantDto, { crudQuery } );
		return updated;
	}

	@Delete( ':id' )
	async remove( @Param( 'id' ) id:string, @CrudQuery() crudQuery:CrudQueryData ){
		return this.participantsService.remove( id, { crudQuery } );
	}
}
