import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@nutritious/server';
import { LogFood, Study, User } from '@prisma/client';
import { LogEntryFood } from '../../../../nutritious-app/src/interfaces/log.interface';


export type LegacyFoodLog = {
	date:LogFood['date'],
	meal_type:LogFood['meal_type'],
	people:LogFood['people'],
	data:LogEntryFood,
}


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

		const catalog = typeof study.question_catalog === 'string' ? JSON.parse( study.question_catalog ) : study.question_catalog;

		return {
			study: { name: study.name },
			catalog,
		};
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
					people: Number(data.people),
					data: JSON.stringify( foodData ),
				},
			} );


		return result?.id;
	}

}
