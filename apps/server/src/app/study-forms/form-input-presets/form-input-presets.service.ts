import { Injectable } from '@nestjs/common';
import type { FormInputPreset, Prisma } from '@nutritious/core';
import { CrudMethodOpts } from 'nestjs-prisma-crud';
import { PrismaService } from '../../core/services/db/prisma.service';
import { JsxTranslatedCrudService } from '../../core/services/jsx-translated-crud.service';


@Injectable()
export class FormInputPresetsService extends JsxTranslatedCrudService<FormInputPreset>{
	constructor(
		private prisma:PrismaService,
	){
		super( {
			model: 'formInputPreset',
			allowedJoins: [],
			defaultJoins: [],
		} );
	}

	public override async create( data:Prisma.FormInputPresetUncheckedCreateInput, opts:CrudMethodOpts ){
		const record = await this.prisma.formInputPreset.create( { data } );


		opts.crudQuery = {};

		return this.findOne( record.id, opts );
	}


	public override async update( id:FormInputPreset['id'], data:Prisma.FormInputPresetUncheckedUpdateInput, opts:CrudMethodOpts ){
		if( 'id' in data )
			delete data['id'];

		const record = await this.prisma.formInputPreset.update( {
			where: { id },
			data,
		} );
		return this.findOne( record.id, opts );
	}


}
