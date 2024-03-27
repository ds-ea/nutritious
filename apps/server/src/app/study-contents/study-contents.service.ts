import { Injectable } from '@nestjs/common';
import type { Prisma, Study } from '@nutritious/core';
import { CrudMethodOpts, PrismaCrudService } from 'nestjs-prisma-crud';
import { PrismaService } from '../core/services/db/prisma.service';


@Injectable()
export class StudyContentsService extends PrismaCrudService{

	constructor(
		private prisma:PrismaService,
	){
		super( {
			model: 'studyContent',
			allowedJoins: [],
			defaultJoins: [],
		} );
	}

	public override async create( data:Prisma.StudyContentUncheckedCreateInput, opts:CrudMethodOpts ){
		const record = await this.prisma.studyContent.create( { data } );
		opts.crudQuery = {};
		return this.findOne( record.id, opts );
	}

	public override async update( id:Study['id'], data:Prisma.StudyContentUncheckedUpdateInput, opts:CrudMethodOpts ){
		const record = await this.prisma.studyContent.update( {
			where: { id },
			data,
		} );
		return this.findOne( record.id, opts );
	}
}
