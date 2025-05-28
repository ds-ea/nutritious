import type { GroupMember, Participant } from '@prisma/client';
import type { PublicStudy, SafeGroup } from './study';


export type ParticipantWithMemberships = Participant &
	{
		memberships:(
			GroupMember &
			{
				study:PublicStudy,
				group:SafeGroup
			} )[]
	}

export type UpdateGroupAssignmentsDTO = {
	studyId:PublicStudy['id'];
	groupId:SafeGroup['id'];
	change:'add' | 'remove';
	badge?:string;
}
