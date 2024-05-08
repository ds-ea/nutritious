import { Injectable } from '@nestjs/common';
import { EntityState, Participant, UpdateGroupAssignmentsDTO } from '@nutritious/core';
import { PrismaService } from '../core/services/db/prisma.service';
import { JsxTranslatedCrudService } from '../core/services/jsx-translated-crud.service';


@Injectable()
export class ParticipantsService extends JsxTranslatedCrudService<Participant>{

	constructor(
		private readonly prisma:PrismaService,
	){
		super( {
			model: 'participant',
			allowedJoins: [ 'memberships', 'memberships.study', 'memberships.group' ],
			defaultJoins: [],
			forbiddenPaths: [ 'password' ],
		} );
	}

	public async updateGroupAssignments( participantId:string, changes:UpdateGroupAssignmentsDTO[] ){
		const participant = await this.prisma.participant.findUniqueOrThrow( {
			where: { id: participantId },
			include: { memberships: true },
		} );

		const { memberships } = participant;

		// TODO: validate membership collisions (badge per group/study and multiple groups per participant per study)


		for( const change of changes ){
			const existing = memberships.find( m => m.studyId === change.studyId && m.groupId === change.groupId );

			if( change.change === 'add' ){
				if( existing )
					await this.prisma.groupMember.update( { where: { id: existing.id }, data: { state: EntityState.Enabled, badge: change.badge } } );
				else
					await this.prisma.groupMember.create( {
						data: {
							participantId,
							state: EntityState.Enabled,
							groupId: change.groupId,
							studyId: change.studyId,
							badge: change.badge,
						},
					} );
			}else if( change.change === 'remove' ){
				if( existing )
					await this.prisma.groupMember.update( { where: { id: existing.id }, data: { state: EntityState.Disabled } } );
			}else if( existing && change.badge !== existing.badge )
				await this.prisma.groupMember.update( { where: { id: existing.id }, data: { badge: change.badge } } );
		}

		return Promise.resolve( undefined );
	}
}
