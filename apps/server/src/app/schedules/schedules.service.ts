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
			allowedJoins: [ 'slots' ],
			defaultJoins: [ 'slots' ],
		} );
	}

	public override async create( data:Prisma.ScheduleCreateInput, opts:CrudMethodOpts ){
		const record = await this.prisma.schedule.create( { data } );
		return this.findOne( record.id, opts );
	}

	public override async update( id:Schedule['id'], data:Prisma.ScheduleUpdateInput, opts:CrudMethodOpts ){
		if( data.slots && Array.isArray( data.slots ) ){
			const slotUpdates:Prisma.ScheduleUpdateInput['slots'] = {};

			const creates:Prisma.SlotCreateManyScheduleInput[] = [];
			const updates:Prisma.SlotUpdateManyWithWhereWithoutScheduleInput[] = [];

			for( const slotData of data.slots ){
				if( slotData.id ){
					const { id, scheduleId, ...withoutId } = slotData as typeof slotData & { scheduleId:unknown };

					updates.push( {
							where: { id: slotData.id },
							data: withoutId,
						},
					);
				}else
					creates.push( slotData );
			}


			if( creates?.length )
				slotUpdates.createMany ??= { data: creates };

			if( updates?.length )
				slotUpdates.updateMany ??= updates;

			data.slots = slotUpdates;
		}

		const record = await this.prisma.schedule.update( {
			where: { id },
			data,
		} );

		return this.findOne( record.id, opts );
	}

}
