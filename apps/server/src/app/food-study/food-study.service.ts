import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { LegacyFoodLog, LogEntryCatalogAnswers, PickByType, PrismaService, StudyCatalog, StudyCatalogQuestionGroup } from '@nutritious/core';
import { Study, User } from '@prisma/client';


@Injectable()
export class FoodStudyService{

	constructor(
		private readonly prisma:PrismaService,
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
					data: JSON.stringify( foodData ),
				},
			} );


		return result?.id;
	}

	public async recordAnswers( data:LogEntryCatalogAnswers, user:User ){
		const studyId = user.fs_study || 0;

		if( studyId )
			await this.requireStudyAccess( user.id, studyId );


		const result =
			await this.prisma.log.create( {
				data: {
					user: user.id,
					study: studyId,
					data: data,
				},
			} );


		return result?.id;
	}



}
