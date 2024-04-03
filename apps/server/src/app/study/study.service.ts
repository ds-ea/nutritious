import { ConflictException, ForbiddenException, Injectable, InternalServerErrorException, Logger, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AssociatedStudies, EntityState, type Group, GroupMember, type Participant, ParticipantCredentials, type Prisma, SignupCheckResponse, SignupResponse, Study, TimeFrame, type User } from '@nutritious/core';
import { hash } from 'argon2';
import dayjs from 'dayjs';
import { nanoid } from 'nanoid';
import generatePassword from 'omgopass';
import { Sanitize } from '../../../../../libs/core/src/lib/data/sanitize';
import { PrismaService } from '../core/services/db/prisma.service';


@Injectable()
export class StudyService{

	constructor(
		private readonly prisma:PrismaService,
		private readonly config:ConfigService,
	){}

	public async hasStudyAccess( studyId:string
		//Study[ 'id' ]
		, userId?:User[ 'id' ], role:'participant' = 'participant' ):Promise<boolean>{
		//		if( role === 'participant' ){
		//			const user = await this.prisma.user.findUnique( { where: { id: userId } } );
		//			return user?.fs_study == studyId;
		//		}

		return false;
	}

	public async requireStudyAccess( studyId:string, userId?:User[ 'id' ], role:'participant' = 'participant' ):Promise<void>{
		if( !( await this.hasStudyAccess( studyId, userId ) ) )
			throw new ForbiddenException( 'not participating in study' );
	}

	public async getStudyData( studyId:string, user?:User ):Promise<{
		study:{
			name:string
		},
		catalog?:unknown
	} | void>{

		const study = null; // await this.prisma.study.findUnique( { where: { id: studyId } } );
		if( !study )
			throw new NotFoundException( 'no such study' );

		//		await this.requireStudyAccess( study.id, user?.id );
		//
		//		const catalog = {};
		//
		//
		//		return {
		//			study: { name: study.name },
		//			catalog,
		//		};
	}


	public timeframeAvailable( period:TimeFrame, now:dayjs.Dayjs = dayjs() ){

		if( period.state !== EntityState.Enabled )
			return false;

		if( period.from && now.isBefore( period.from ) )
			return false;

		if( period.until && now.isAfter( period.until ) )
			return false;

		return true;
	}

	public async studyAvailable( group:Group, study:Study ):Promise<boolean>{
		try{

			if( group?.state !== EntityState.Enabled ||
				study?.state !== EntityState.Enabled
			)
				return false;

			if( group.regLimit ){
				const participantCount = await this.prisma.groupMember.count( { where: { groupId: group.id } } );
				if( participantCount && participantCount >= group.regLimit )
					return false;
			}

			const now = dayjs();
			if( group.signupPeriod && !this.timeframeAvailable( group.signupPeriod, now ) )
				return false;


			if( study.signupPeriod && !this.timeframeAvailable( study.signupPeriod, now ) )
				return false;

		}catch( err ){
			Logger.error( 'error parsing study date', group, study );
			return false;
		}

		return true;
	}

	public async getStudyForSignup( key:string, regPass:string ):Promise<{ group:Group, study:Study }>{

		const group = await this.prisma.group.findUnique( { where: { regKey: key } } );
		if( !group || !group.studyId )
			throw new NotFoundException( 'study was not found' );

		const study = await this.prisma.study.findUnique( { where: { id: group.studyId } } );
		if( !study )
			throw new NotFoundException( 'study not found' );

		if( !await this.studyAvailable( group, study ) )
			throw new ServiceUnavailableException( 'study signup not available' );


		return { group, study };
	}

	public async studySignup( key:string, regPass:string, signup?:false ):Promise<SignupCheckResponse>
	public async studySignup( key:string, regPass:string, signup:true, participantBadge?:string ):Promise<SignupResponse>
	public async studySignup( key:string, regPass:string, signup?:boolean, participantBadge?:string ):Promise<SignupCheckResponse | SignupResponse>{

		const { study, group } = await this.getStudyForSignup( key, regPass );

		if( !study || !group )
			throw new InternalServerErrorException( 'study or group unavailable' );

		const publicStudy = Sanitize.publicStudy( study );

		if( !signup )
			return { study: publicStudy, instructions: group.instructions ?? undefined } as SignupCheckResponse;

		const { participant, plainPassword } = await this.createParticipant();
		const member = await this.assignParticipantToGroup( study.id, group.id, participant.id, participantBadge );

		const credentials:ParticipantCredentials = {
			login: participant.login,
			password: plainPassword,
		};

		return {
			study: publicStudy,
			credentials,
			participant: participant.id,
			badge: participantBadge,
		} as SignupResponse;
	}

	private async assignParticipantToGroup( studyId:Study['id'], groupId:Group['id'], participantId:Participant['id'], participantBadge?:string ):Promise<GroupMember>{

		const existing = await this.prisma.groupMember.findFirst( { where: { groupId, participantId, studyId } } );
		if( existing )
			throw new ConflictException( 'participant is already part of this study exists' );

		const data:Prisma.GroupMemberCreateInput = {
			study: { connect: { id: studyId } },
			group: { connect: { id: groupId } },
			participant: { connect: { id: participantId } },
		};

		if( participantBadge )
			data.badge = participantBadge;

		const member = await this.prisma.groupMember.create( { data } );

		return member;
	}

	private async createParticipant():Promise<{
		plainPassword:string,
		participant:Participant
	}>{

		const login = nanoid( 16 );
		const plainPassword = generatePassword( { syllablesCount: 4 } );

		const secret = Buffer.from( this.config.getOrThrow<string>( 'PW_SECRET' ), 'utf-8' );
		const hashedPass = await hash( plainPassword, { secret } );


		const data:Prisma.ParticipantCreateInput = {
			login,
			password: hashedPass,
		};

		const participant = await this.prisma.participant.create( { data } );

		return { participant, plainPassword };
	}

	public async getAssociatedStudies( participantId:Participant['id'] ):Promise<AssociatedStudies>{

		const memberships = await this.prisma.groupMember.findMany( {
			where: { participantId },
			include: { study: true, group: true },
		} );
		//		const groups = await this.prisma.group.findMany({where: {id: {in: memberships.map(m=>m.groupId)}}});
		//		const studies = await this.prisma.study.findMany({where: {id: {in: memberships.map(m=>m.studyId)}}});

		const associated:AssociatedStudies = [];

		for( const membership of memberships ){
			console.log( membership );

			if( membership.study.state !== EntityState.Enabled ||
				membership.group.state !== EntityState.Enabled
			)
				continue;

			associated.push( {
				study: Sanitize.publicStudy( membership.study ),
				badge: membership.badge,
			} );

		}

		return associated;
	}


}
