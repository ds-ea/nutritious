import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@nutritious/core';
import { User } from '@prisma/client';


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


	public studyAvailable( study:unknown,
		//	Study
	):boolean{
		/*try{
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
		}*/

		return true;
	}

	public async getStudyForSignup( key:string, regPass:string ):Promise<
		//		Study |
		undefined>{
		return undefined;

		/*const study = await this.prisma.study.findUnique( { where: { reg_key: key } } );
		if( !study )
			throw new NotFoundException( 'study not found' );

		if( !this.studyAvailable( study ) )
			throw new ServiceUnavailableException( 'study signup not available' );

		if( study.reg_pass?.length && study.reg_pass !== regPass )
			throw new ForbiddenException( 'invalid signup key/pass' );

		return study;*/
	}

	public async studySignup( key:string, regPass:string, signup?:boolean, participantIdentifier?:unknown ){

		return undefined;
		/*
	const study = await this.getStudyForSignup( key, regPass );

	const publicStudy = { name: study.name };
	if( !signup )
		return { study: publicStudy };

	const { username, password } = await this.createParticipant( study.id, participantIdentifier );

	return {
		credentials: { username, password },
		study: publicStudy,
	};*/
	}

	private async createParticipant( studyId:
			string
		// Study['id']
		, participantIdentifier?:string | undefined ){
		return undefined;

		/*await this.prisma.study.update( { where: { id: studyId }, data: { user_count: { increment: 1 } } } );
		const study = await this.prisma.study.findUniqueOrThrow( { where: { id: studyId } } );

		const username = study.prefix + '_' + study.user_count;
		const password = generatePassword( { syllablesCount: 2 } );

		const secret = Buffer.from( this.config.getOrThrow<string>( 'PW_SECRET' ), 'utf-8' );
		const hashedPass = await hash( password, { secret } );

		const data:Prisma.UserCreateInput = {
			name: username,
			password: hashedPass,

		};

		const participant:User = await this.prisma.user.create( { data } );

		return { username, password, participant };*/
	}



}
