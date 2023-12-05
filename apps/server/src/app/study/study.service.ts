import { ForbiddenException, Injectable, Logger, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LegacyFoodLog, LogEntryCatalogAnswers, PickByType, PrismaService, StudyCatalog, StudyCatalogQuestionGroup } from '@nutritious/core';
import { Prisma, Study, User } from '@prisma/client';
import { hash } from 'argon2';
import dayjs from 'dayjs';
import generatePassword from 'omgopass';


@Injectable()
export class StudyService{

	constructor(
		private readonly prisma:PrismaService,
		private readonly config:ConfigService,
	){}

	public async hasStudyAccess( userId:User['id'], studyId:Study['id'], role:'participant' = 'participant' ):Promise<boolean>{
		if( role === 'participant' ){
			const user = await this.prisma.user.findUnique( { where: { id: userId } } );
			return user?.fs_study == studyId;
		}

		return false;
	}

	public async requireStudyAccess( userId:User['id'], studyId:Study['id'], role:'participant' = 'participant' ):Promise<void>{
		if( !( await this.hasStudyAccess( userId, studyId ) ) )
			throw new ForbiddenException( 'not participating in study' );
	}

	public async getStudyData( studyId:Study['id'], user:User ):Promise<{
		study:{
			name:Study['name']
		},
		catalog?:unknown
	}>{

		const study = await this.prisma.study.findUnique( { where: { id: studyId } } );
		if( !study )
			throw new NotFoundException( 'no such study' );

		await this.requireStudyAccess( user.id, study.id );

		const catalogRaw = typeof study.question_catalog === 'string' ? JSON.parse( study.question_catalog ) : study.question_catalog;
		const catalog = this.transformLegacyCatalog( catalogRaw );


		return {
			study: { name: study.name },
			catalog,
		};
	}

	public transformLegacyCatalog( legacyData:StudyCatalog ):StudyCatalog{
		const catalog = { ...legacyData };

		if( catalog.groups?.length ){
			for( const group of catalog.groups ){

				const processBooleanProperty = ( property:keyof PickByType<StudyCatalogQuestionGroup, boolean> ) => {
					const v = typeof group[property] === 'string' ? ( group[property] as unknown as string ) !== 'false' : group[property];
					if( group[property] !== undefined && group[property] ){
						group[property] = true;
					}else{
						delete group[property];
						if( `${ property }-time` in group )
							delete group[<keyof StudyCatalogQuestionGroup> `${ property }-time`];
					}
				};

				processBooleanProperty( 'askafter-enabled' );
				processBooleanProperty( 'reminder-enabled' );
				processBooleanProperty( 'ask-missed' );
				processBooleanProperty( 'questions-first' );

				if( group.questions?.length ){
					for( const question of group.questions ){
						if( question.type === 'slider' && question.config ){
							question.config.min = parseInt( question.config.min, 10 );
							question.config.max = parseInt( question.config.max, 10 );
						}
					}
				}
			}
		}

		return catalog;
	}


	public async recordFood( data:LegacyFoodLog, user:User ){
		const studyId = user.fs_study || 0;

		if( studyId )
			await this.requireStudyAccess( user.id, studyId );

		const foodData = data['data'];

		const result =
			await this.prisma.logFood.create( {
				data: {
					user: user.id,
					study: studyId,
					date: data.date,
					people: Number( data.people ),
					meal_type: data.meal_type,
					data: foodData,
				},
			} );


		return result?.id;
	}

	public async recordAnswers( data:{ data:LogEntryCatalogAnswers }, user:User ){
		const studyId = user.fs_study || 0;

		if( studyId )
			await this.requireStudyAccess( user.id, studyId );


		const result =
			await this.prisma.log.create( {
				data: {
					user: user.id,
					study: studyId,
					data: data.data,
				},
			} );


		return result?.id;
	}


	public studyAvailable( study:Study ):boolean{
		try{
			const now = dayjs();
			if( !study?.reg_public
				|| ( study.reg_limit && study.user_count > study.reg_limit )
				|| ( study.from && now.isBefore( study.from ) )
				|| ( study.until && now.isAfter( study.until ) )
			)
				return false;

		}catch( err ){
			Logger.error( 'error parsing study date', study );
			return false;
		}

		return true;
	}

	public async getStudyForSignup( key:string, regPass:string ):Promise<Study>{
		const study = await this.prisma.study.findUnique( { where: { reg_key: key } } );
		if( !study )
			throw new NotFoundException( 'study not found' );

		if( !this.studyAvailable( study ) )
			throw new ServiceUnavailableException( 'study signup not available' );

		if( study.reg_pass?.length && study.reg_pass !== regPass )
			throw new ForbiddenException( 'invalid signup key/pass' );

		return study;
	}

	public async studySignup( key:string, regPass:string, signup?:boolean, participantIdentifier?:User['fs_participant'] ){

		const study = await this.getStudyForSignup( key, regPass );

		const publicStudy = { name: study.name };
		if( !signup )
			return { study: publicStudy };

		const { username, password } = await this.createParticipant( study.id, participantIdentifier );

		return {
			credentials: { username, password },
			study: publicStudy,
		};
	}

	private async createParticipant( studyId:Study['id'], participantIdentifier?:User['fs_participant'] | undefined ){

		await this.prisma.study.update( { where: { id: studyId }, data: { user_count: { increment: 1 } } } );
		const study = await this.prisma.study.findUniqueOrThrow( { where: { id: studyId } } );

		const username = study.prefix + '_' + study.user_count;
		const password = generatePassword( { syllablesCount: 2 } );

		const secret = Buffer.from( this.config.getOrThrow<string>( 'PW_SECRET' ), 'utf-8' );
		const hashedPass = await hash( password, { secret } );

		const data:Prisma.UserCreateInput = {
			name: username,
			username,
			password: hashedPass,
			fs_study: studyId,
			fs_participant: participantIdentifier,
			roles: { connect: { id: 2 } },
		};

		const participant:User = await this.prisma.user.create( { data } );

		return { username, password, participant };
	}



}
