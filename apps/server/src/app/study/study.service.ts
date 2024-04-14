import { ConflictException, ForbiddenException, Injectable, InternalServerErrorException, Logger, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { EntityState, type Group, type GroupMember, type Participant, type ParticipantCredentials, type PreparedSchedule, PreparedSlot, type PreparedStudy, type Prisma, SafeSlot, Sanitize, type Schedule, type SignupCheckResponse, type  SignupResponse, type Slot, type Step, type Study, StudyStepType, StudyStepTypes, SubmitResponsesPayload, type TimeFrame, type User } from '@nutritious/core';
import { hash } from 'argon2';
import dayjs from 'dayjs';
import { nanoid } from 'nanoid';
import generatePassword from 'omgopass';
import { Nullable } from 'vitest';
import { PrismaService } from '../core/services/db/prisma.service';


type StepRefMap = {
	[type:StudyStepTypes | string]:{
		[ref:string]:unknown
	}
};

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

	public async prepareStudies( participantId:Participant['id'] ):Promise<PreparedStudy[]>{

		const memberships = await this.prisma.groupMember.findMany( {
			where: { participantId },
			include: { study: true, group: true },
		} );
		//		const groups = await this.prisma.group.findMany({where: {id: {in: memberships.map(m=>m.groupId)}}});
		//		const studies = await this.prisma.study.findMany({where: {id: {in: memberships.map(m=>m.studyId)}}});

		const studies:PreparedStudy[] = [];

		for( const membership of memberships ){
			if( membership.study.state !== EntityState.Enabled ||
				membership.group.state !== EntityState.Enabled
			)
				continue;

			const schedule = await this.prepareSchedule( membership.group.scheduleId );


			const prepared:PreparedStudy = {
				study: Sanitize.publicStudy( membership.study ),
				badge: membership.badge,
				schedule,
			};

			studies.push( prepared );

		}

		return studies;
	}

	public prepareSlot( slot:Slot & { steps?:Step[] }, stepRefs:StepRefMap ):PreparedSlot{
		const prepared:PreparedSlot = Sanitize.safeSlot( slot );

		if( slot.steps ){
			prepared.steps = slot.steps.map( Sanitize.safeStep );
			for( const step of prepared.steps )
				if( step.ref ){
					if( !stepRefs[step.type] )
						stepRefs[step.type] = {};

					stepRefs[step.type][step.ref] = null;
				}
		}


		return prepared;
	}

	public async prepareSchedule( scheduleId:Nullable<Schedule['id']> ):Promise<PreparedSchedule | undefined>{

		if( !scheduleId )
			return undefined;

		const schedule = await this.prisma.schedule.findUnique( {
			where: { id: scheduleId },
		} );

		if( !schedule )
			return undefined;

		const stepRefs:StepRefMap = {};

		const slots:SafeSlot[] = await this.prisma.slot.findMany( { where: { scheduleId }, include: { steps: true } } )
			.then( slots =>
				slots.map( slot => this.prepareSlot( slot, stepRefs ),
				) );


		const prepared:PreparedSchedule = {
			schedule: Sanitize.safeSchedule( schedule ),
			slots,
		};

		if( Object.keys( stepRefs ).length ){
			const preparedRefs:PreparedSchedule['refs'] = {};
			for( const [ refType, refs ] of Object.entries( stepRefs ) ){
				if( refType === StudyStepType.Form )
					preparedRefs[refType] = await this.prisma.studyForm.findMany( { where: { id: { in: Object.keys( refs ) } } } )
						.then( forms => forms.map( Sanitize.safeStudyForm ) );
				else if( refType === StudyStepType.Content )
					preparedRefs[refType] = await this.prisma.studyContent.findMany( { where: { id: { in: Object.keys( refs ) } } } )
						.then( contents => contents.map( Sanitize.safeStudyContent ) );
			}
			prepared.refs = preparedRefs;
		}

		return prepared;

	}


	public async recordResponses( participantId:Participant['id'], payload:SubmitResponsesPayload ){

		const data:Prisma.ResponseCreateManyInput[] = [];

		for( const submittedResponse of payload.responses ){
			const { _study: studyId, ...response } = submittedResponse;

			data.push( {
				stepId: response.step,
				slotId: response.slot,
				participantId,
				data: response.data as Prisma.InputJsonValue,
			} );
		}

		const created = await this.prisma.response.createMany( { data: data } );

		return Promise.resolve( undefined );
	}
}


