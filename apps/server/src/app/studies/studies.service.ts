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

		let regKey = generatePassword( { syllablesCount: 4 } );
		let enforceUniquenessAttempts = 5;
		while(
			enforceUniquenessAttempts-- > 0
			&& ( await this.prisma.group.findUnique( { where: { regKey } } ) )
			)
			regKey = generatePassword( { syllablesCount: 4 } );

		const defaultGroup = await this.prisma.group.create( {
			data: {
				studyId: record.id,
				state: 'ENABLED',
				name: 'Participants',
				regKey,
				regPass: generatePassword( { syllablesCount: 4 } ),
			},
		} );

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
}
