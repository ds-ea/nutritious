import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { type Prisma } from '@nutritious/core';
import { Sanitize } from '../../../../../libs/core/src/lib/data/sanitize';
import { CrudQuery, CrudQueryData } from '../core/decorators/crud-query.decorator';
import { UpdateGroupMemberDto } from './dto/update-group-member.dto';
import { GroupMembersService } from './group-members.service';


@Controller( 'group-members' )
export class GroupMembersController{
	constructor( private readonly groupMembersService:GroupMembersService ){}

	@Post()
	async create( @Body() createGroupMemberDto:Prisma.GroupMemberCreateInput, @CrudQuery() crudQuery:CrudQueryData ){
		const created = await this.groupMembersService.create( createGroupMemberDto, { crudQuery } );
		return created;
	}

	@Get()
	async findMany( @CrudQuery( { injectNotDeleted: false } ) crudQuery:CrudQueryData ){
		crudQuery.select = { only: [ 'id', 'participantId', 'badge' ] };
		const matches = await this.groupMembersService.findMany( { crudQuery } );
		//		for( const member of ( matches.data as ( GroupMember & { participant:Participant | SafeParticipant } )[] ) )
		//			member.participant = Sanitize.safeParticipant( member.participant );


		return matches;
	}

	@Get( ':id' )
	async findOne( @Param( 'id' ) id:string, @CrudQuery( { injectNotDeleted: false } ) crudQuery:CrudQueryData ){
		crudQuery.joins = [ 'participant' ];
		const match = await this.groupMembersService.findOne( id, { crudQuery } );
		match.participant = Sanitize.safeParticipant( match.participant );

		return match;
	}

	@Patch( ':id' )
	async update(
		@Param( 'id' ) id:string,
		@Body() updateGroupMemberDto:UpdateGroupMemberDto,
		@CrudQuery() crudQuery:CrudQueryData,
	){
		const updated = await this.groupMembersService.update( id, updateGroupMemberDto, { crudQuery } );
		return updated;
	}

	@Delete( ':id' )
	async remove( @Param( 'id' ) id:string, @CrudQuery() crudQuery:CrudQueryData ){
		return this.groupMembersService.remove( id, { crudQuery } );
	}
}
