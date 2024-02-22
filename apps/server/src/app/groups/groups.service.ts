import { Injectable } from '@nestjs/common';

import { type Group, type Prisma, PrismaService } from '@nutritious/core';
import { CrudMethodOpts, PrismaCrudService } from 'nestjs-prisma-crud';


@Injectable()
export class GroupsService extends PrismaCrudService{
	constructor(
		private prisma:PrismaService,
	){
		super( {
			model: 'group',
			allowedJoins: [ 'schedule' ],
			defaultJoins: [ 'schedule' ],
		} );
	}



	public override async create( data:Prisma.GroupCreateInput, opts:CrudMethodOpts ){
		const record = await this.prisma.group.create( { data } );
		return this.findOne( record.id, opts );
	}

	public override async update( id:Group['id'], data:Prisma.GroupUpdateInput, opts:CrudMethodOpts ){
		const record = await this.prisma.group.update( {
			where: { id },
			data,
		} );
		return this.findOne( record.id, opts );
	}


}
