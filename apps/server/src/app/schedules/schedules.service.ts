import { Injectable } from '@nestjs/common';
import { type Prisma, PrismaService, Schedule } from '@nutritious/core';
import { CrudMethodOpts, PrismaCrudService } from 'nestjs-prisma-crud';


@Injectable()
export class SchedulesService extends PrismaCrudService{
	constructor(
		private prisma:PrismaService,
	){
		super( {
			model: 'schedule',
			allowedJoins: [],
			defaultJoins: [],
		} );
	}

	public override async create( data:Prisma.ScheduleCreateInput, opts:CrudMethodOpts ){
		const record = await this.prisma.schedule.create( { data } );
		return this.findOne( record.id, opts );
	}

	public override async update( id:Schedule['id'], data:Prisma.ScheduleUpdateInput, opts:CrudMethodOpts ){
		const record = await this.prisma.schedule.update( {
			where: { id },
			data,
		} );
		return this.findOne( record.id, opts );
	}

}
