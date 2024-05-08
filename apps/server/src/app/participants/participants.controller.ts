import { Body, Controller, Delete, Get, NotImplementedException, Param, Patch, Post } from '@nestjs/common';
import { type Participant, ParticipantWithMemberships, Sanitize, UpdateGroupAssignmentsDTO } from '@nutritious/core';
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
		matches.data = matches.data.map( Sanitize.safeParticipant ) as Participant[];

		return matches;
	}

	@Get( ':id' )
	async findOne( @Param( 'id' ) id:string, @CrudQuery() crudQuery:CrudQueryData ):Promise<ParticipantWithMemberships>{
		crudQuery.joins = [ 'memberships', 'memberships.study', 'memberships.group' ];
		const match = await this.participantsService.findOne( id, { crudQuery } );

		if( match?.memberships?.length )
			match.memberships.forEach(
				( membership:ParticipantWithMemberships['memberships'][number] ) => {
					membership.study = Sanitize.publicStudy( membership.study );
					membership.group = Sanitize.safeGroup( membership.group );
				},
			);

		return match;
	}

	@Patch( ':id' )
	async update(
		@Param( 'id' ) id:string,
		@Body() updateParticipantDto:UpdateParticipantDto,
		@CrudQuery() crudQuery:CrudQueryData,
	){
		throw new NotImplementedException( 'updating participants is not supported' );
		const updated = await this.participantsService.update( id, updateParticipantDto, { crudQuery } );
		return updated;
	}

	@Delete( ':id' )
	async remove( @Param( 'id' ) id:string, @CrudQuery() crudQuery:CrudQueryData ){
		throw new NotImplementedException( 'removing participants is not supported' );
		return this.participantsService.remove( id, { crudQuery } );
	}


	@Post( ':id/assign-groups' )
	async updateParticipantGroupAssignments( @Param( 'id' ) participantId:string, @Body() data:UpdateGroupAssignmentsDTO[] ){
		const updated = await this.participantsService.updateGroupAssignments( participantId, data );

		return this.findOne( participantId, {} );
	}
}
