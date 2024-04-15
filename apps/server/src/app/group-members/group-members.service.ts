import { Injectable } from '@nestjs/common';

import { type GroupMember, type Prisma } from '@nutritious/core';
import { CrudMethodOpts } from 'nestjs-prisma-crud';
import { PrismaService } from '../core/services/db/prisma.service';
import { JsxTranslatedCrudService } from '../core/services/jsx-translated-crud.service';


@Injectable()
export class GroupMembersService extends JsxTranslatedCrudService<GroupMember>{
	constructor(
		private prisma:PrismaService,
	){
		super( {
			model: 'groupMember',
			allowedJoins: [ 'participant' ],
			defaultJoins: [],
		} );
	}



	public override async create( data:Prisma.GroupMemberCreateInput, opts:CrudMethodOpts ){
		const record = await this.prisma.groupMember.create( { data } );
		return this.findOne( record.id, opts );
	}

	public override async update( id:GroupMember['id'], data:Prisma.GroupMemberUpdateInput, opts:CrudMethodOpts ){
		const record = await this.prisma.groupMember.update( {
			where: { id },
			data,
		} );
		return this.findOne( record.id, opts );
	}


}
