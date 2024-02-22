import { Injectable } from '@nestjs/common';
import { Prisma, PrismaService, Study } from '@nutritious/core';
import { CrudMethodOpts, PrismaCrudService } from 'nestjs-prisma-crud';
import generatePassword from 'omgopass';


@Injectable()
export class StudiesService extends PrismaCrudService{
	constructor(
		private prisma:PrismaService,
	){
		super( {
			model: 'study',
			allowedJoins: [ 'groups' ],
			defaultJoins: [],
		} );
	}



	public override async create( data:Prisma.StudyCreateInput, opts:CrudMethodOpts ){
		const record = await this.prisma.study.create( { data } );

		await this._createDefaultStudyData( record );

		opts.crudQuery = {};
		opts.crudQuery.joins = [ 'groups' ];
		return this.findOne( record.id, opts );
	}


	public override async update( id:Study['id'], data:Prisma.StudyUpdateInput, opts:CrudMethodOpts ){
		const record = await this.prisma.study.update( {
			where: { id },
			data,
		} );
		return this.findOne( record.id, opts );
	}

	public override findMany( opts:CrudMethodOpts ){
		opts.crudQuery = {
			select: { only: [ 'id', 'name', 'state', 'signupPeriod', 'responsePeriod' ] },
			where: { state: { not: 'DELETED' } },
		};
		return super.findMany( opts );
	}



	public override findOne( id:string | number, opts:CrudMethodOpts ){
		opts.crudQuery = {
			where: { state: { not: 'DELETED' } },
		};

		return super.findOne( id, opts );
	}

	private async _createDefaultStudyData( study:Study ){


		// create schedule
		const defaultSchedule = await this.prisma.schedule.create( {
			data: {
				studyId: study.id,
				name: 'Default Schedule',
				weekSetup: { startOfWeek: 1 },
				daySetup: [
					{
						days: [ 0, 1, 2, 3, 4, 5, 6 ],
						grace: 5 * 60,
					},
				],
			},
		} );


		// create group
		let regKey = generatePassword( { syllablesCount: 4 } );
		let enforceUniquenessAttempts = 5;
		while(
			enforceUniquenessAttempts-- > 0
			&& ( await this.prisma.group.findUnique( { where: { regKey } } ) )
			)
			regKey = generatePassword( { syllablesCount: 4 } );

		const defaultGroup = await this.prisma.group.create( {
			data: {
				studyId: study.id,
				scheduleId: defaultSchedule.id,
				state: 'ENABLED',
				name: 'Participants',
				regKey,
				regPass: generatePassword( { syllablesCount: 4 } ),
			},
		} );


	}
}
