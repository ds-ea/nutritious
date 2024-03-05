import { Injectable } from '@nestjs/common';
import { type Prisma, PrismaService, type Study } from '@nutritious/core';
import { CrudMethodOpts, PrismaCrudService } from 'nestjs-prisma-crud';


@Injectable()
export class StudyFormsService extends PrismaCrudService{
	constructor(
		private prisma:PrismaService,
	){
		super( {
			model: 'studyForm',
			allowedJoins: [],
			defaultJoins: [],
		} );
	}

	public override async create( data:Prisma.StudyFormUncheckedCreateInput, opts:CrudMethodOpts ){
		const record = await this.prisma.studyForm.create( { data } );


		opts.crudQuery = {};

		return this.findOne( record.id, opts );
	}


	public override async update( id:Study['id'], data:Prisma.StudyFormUncheckedUpdateInput, opts:CrudMethodOpts ){
		const record = await this.prisma.studyForm.update( {
			where: { id },
			data,
		} );
		return this.findOne( record.id, opts );
	}


}
