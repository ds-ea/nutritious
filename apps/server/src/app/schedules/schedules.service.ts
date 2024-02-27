import { Injectable } from '@nestjs/common';
import { type Prisma, PrismaService, Schedule, type Slot, type Step } from '@nutritious/core';
import { CrudMethodOpts, PrismaCrudService } from 'nestjs-prisma-crud';


@Injectable()
export class SchedulesService extends PrismaCrudService{
	constructor(
		private prisma:PrismaService,
	){
		super( {
			model: 'schedule',
			allowedJoins: [ 'slots', 'slots.steps' ],
			defaultJoins: [ 'slots', 'slots.steps' ],
		} );
	}

	public override async create( data:Prisma.ScheduleCreateInput, opts:CrudMethodOpts ){
		const record = await this.prisma.schedule.create( { data } );
		return this.findOne( record.id, opts );
	}

	public override async update( scheduleId:Schedule['id'], data:Prisma.ScheduleUpdateInput, opts:CrudMethodOpts ){

		const slots = data.slots;
		if( data.slots )
			delete data.slots;

		const record = await this.prisma.schedule.update( {
			where: { id: scheduleId },
			data,
		} );


		if( slots && Array.isArray( slots ) ){

			const stepCreates:Prisma.StepCreateManyInput[] = [];
			const stepUpdates:Prisma.StepUpdateArgs[] = [];
			const stepRemoves:Step['id'][] = [];

			for( const slotData of slots ){
				slotData.scheduleId = scheduleId;

				const steps = slotData.steps;
				delete slotData.steps;

				let slot:Slot | undefined;

				if( slotData.id ){
					const { id, ...withoutId } = slotData as typeof slotData;
					delete withoutId['createdAt'];
					delete withoutId['updatedAt'];

					slot = await this.prisma.slot.update( {
						where: { id: slotData.id },
						data: withoutId as Prisma.SlotUncheckedUpdateInput,
					} );

				}else
					slot = await this.prisma.slot.create( { data: slotData } );

				if( !slot )
					throw new Error( 'unable to update slot' );


				if( steps?.length ){
					for( const stepData of steps ){
						stepData.slotId = slot.id;

						if( '_remove' in stepData ){
							if( stepData.id )
								stepRemoves.push( stepData.id );

						}else if( stepData.id ){
							const { id, ...withoutId } = stepData as typeof stepData;
							delete withoutId['createdAt'];
							delete withoutId['updatedAt'];

							stepUpdates.push( {
								where: { id: stepData.id },
								data: withoutId,
							} );
						}else{
							stepCreates.push( stepData );
						}
					}

				}
			}


			if( stepCreates.length )
				await this.prisma.step.createMany( { data: stepCreates } );
			if( stepUpdates.length )
				await Promise.all( stepUpdates.map( stepUpdate => this.prisma.step.update( stepUpdate ) ) );
			if( stepRemoves.length )
				await this.prisma.step.deleteMany( { where: { id: { in: stepRemoves } } } );



		}



		return this.findOne( record.id, opts );
	}

}
