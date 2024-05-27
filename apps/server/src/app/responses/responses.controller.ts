import { Controller, Delete, Get, MethodNotAllowedException, Param, Patch, Post } from '@nestjs/common';
import { ExportableMember, ExportableResponse, GroupMember, Sanitize, StudyResponse } from '@nutritious/core';
import { CrudQuery, CrudQueryData } from '../core/decorators/crud-query.decorator';
import { ResponsesService } from './responses.service';


export function flattenNestedRecord<T extends Record<PropertyKey, unknown>>( record:T, parentKey = '' ):Record<string, string | number>{
	return Object.keys( record )
		.reduce( ( acc, key ) => {
			const newKey = parentKey ? `${ parentKey }.${ key }` : key;
			if( typeof record[key] === 'object' && record[key] !== null ){

				// flatten simple arrays
				if( Array.isArray( record[key] ) ){
					const arrayLike = record[key] as unknown[];
					if( arrayLike[0] && typeof arrayLike[0] != 'object' ){
						acc[newKey] = arrayLike.join( ',' );
						return acc;
					}
				}

				const flattened = flattenNestedRecord( record[key] as T, newKey );
				Object.assign( acc, flattened );

			}else{
				acc[newKey] = record[key] as string | number;
			}
			return acc;
		}, {} as Record<PropertyKey, string | number> );
}


@Controller( 'responses' )
export class ResponsesController{

	constructor( private readonly responsesService:ResponsesService ){}

	@Post()
	async create(){
		throw new MethodNotAllowedException( 'responses can not be created directly' );
	}

	@Patch( ':id' )
	async update(){
		throw new MethodNotAllowedException( 'responses can not be updated directly' );
	}

	@Delete( ':id' )
	async remove( @Param( 'id' ) id:string, @CrudQuery() crudQuery:CrudQueryData ){
		//		return this.responsesService.remove( id, { crudQuery } );
		throw new MethodNotAllowedException( 'responses can not be deleted directly' );
	}


	@Get( ':id' )
	async findOne( @Param( 'id' ) id:string, @CrudQuery() crudQuery:CrudQueryData ){
		const match = await this.responsesService.findOne( id, { crudQuery } );
		return match;
	}

	@Get()
	async findMany( @CrudQuery( { injectNotDeleted: false } ) crudQuery:CrudQueryData ){
		const crudResponse = await this.responsesService.findMany<StudyResponse & { member?:GroupMember | ExportableMember }>( { crudQuery } );
		if( crudResponse.data )
			crudResponse.data = crudResponse.data.map( response => {
				if( response.member )
					response.member = Sanitize.exportableMember( response.member );

				return response;
			} ) as ExportableResponse[];
		return crudResponse;
	}

	@Get( 'for-export' )
	async listForExport( @CrudQuery( { injectNotDeleted: false } ) crudQuery:CrudQueryData ){
		const crudResponse = await this.responsesService.findMany<StudyResponse & { member?:GroupMember | ExportableMember }>( { crudQuery } );

		const dataKeys = new Set<string>();

		if( crudResponse.data?.length ){
			crudResponse.data = crudResponse.data.map( response => {
				if( response.member )
					response.member = Sanitize.exportableMember( response.member );

				response.data = flattenNestedRecord( response.data as any );

				Object.keys( response.data ).forEach( k => dataKeys.add( k ) );

				return response;
			} ) as ExportableResponse[];


			const itemData = crudResponse.data[0]?.data as Record<string, unknown>;
			if( itemData )
				for( const key of dataKeys ){
					if( !( key in itemData ) )
						itemData[key] = null;
				}
		}


		return crudResponse;
	}

}
