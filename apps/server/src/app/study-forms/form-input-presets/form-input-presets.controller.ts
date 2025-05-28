import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CrudQuery, CrudQueryData } from '../../core/decorators/crud-query.decorator';
import { CreateFormInputPresetDto } from './dto/create-form-input-preset.dto';
import { UpdateFormInputPresetDto } from './dto/update-form-input-preset.dto';
import { FormInputPresetsService } from './form-input-presets.service';


@Controller( 'form-input-presets' )
export class FormInputPresetsController{
	constructor( private readonly formInputPresetsService:FormInputPresetsService ){}

	@Post()
	async create( @Body() createFormInputPresetDto:CreateFormInputPresetDto, @CrudQuery() crudQuery:CrudQueryData ){
		const created = await this.formInputPresetsService.create( createFormInputPresetDto, { crudQuery } );
		return created;
	}

	@Get()
	async findMany( @CrudQuery( { injectNotDeleted: false } ) crudQuery:CrudQueryData ){
		const matches = await this.formInputPresetsService.findMany( { crudQuery } );
		return matches;
	}

	@Get( ':id' )
	async findOne( @Param( 'id' ) id:string, @CrudQuery( { injectNotDeleted: false } ) crudQuery:CrudQueryData ){
		const match = await this.formInputPresetsService.findOne( id, { crudQuery } );
		return match;
	}

	@Patch( ':id' )
	async update(
		@Param( 'id' ) id:string,
		@Body() updateFormInputPresetDto:UpdateFormInputPresetDto,
		@CrudQuery( { injectNotDeleted: false } ) crudQuery:CrudQueryData,
	){
		const updated = await this.formInputPresetsService.update( id, updateFormInputPresetDto, { crudQuery } );
		return updated;
	}

	@Delete( ':id' )
	async remove( @Param( 'id' ) id:string, @CrudQuery( { injectNotDeleted: false } ) crudQuery:CrudQueryData ){
		return this.formInputPresetsService.remove( id, { crudQuery } );
	}
}
