import { Group, PublicStudy, SafeParticipant } from '@nutritious/core';
import { CrudFilters, DataProvider, useExport } from '@refinedev/core';
import dayjs from 'dayjs';


export function flattenNestedRecord<T extends Record<PropertyKey, unknown>>( record:T, parentKey = '' ):Record<string, T>{
	return Object.keys( record )
		.reduce( ( acc, key ) => {
			const newKey = parentKey ? `${ parentKey }.${ key }` : key;
			if( typeof record[key] === 'object' && record[key] !== null ){
				const flattened = flattenNestedRecord( record[key] as T, newKey );
				Object.assign( acc, flattened );
			}else{
				acc[newKey] = record[key] as T;
			}
			return acc;
		}, {} as Record<PropertyKey, T> );
}

type UseExportOptionsType = Parameters<typeof useExport>[0];
type validFilterKeys = 'studyId' | 'groupId' | 'participantId';

type ResponseExportContext = { group:Group | undefined } | { study:PublicStudy | undefined } | { participant:SafeParticipant | undefined };

function prepExport( context:ResponseExportContext ):{ filters:CrudFilters, fileName:string }{
	const [ key, contextData ] = Object.entries( context )?.[0];
	if( !contextData )
		throw new Error( 'missing or empty export context' );

	const field = key ? key + 'Id' : undefined;
	const value = contextData.id;
	const fileNameAddon = contextData ? key + ' ' + ( contextData.name || contextData.key )?.trim() : undefined;

	if( !field || !value )
		throw new Error( 'missing or empty export filter' );

	const filters:CrudFilters = [
		{ field, operator: 'eq', value },
	];

	let fileName = [ 'responses', fileNameAddon, dayjs().format() ].join( ' - ' );

	return { filters, fileName };
}

export async function exportStudyResponses( dp:DataProvider, context:ResponseExportContext, format:'json' ){
	if( !dp )
		throw new Error( 'invalid data provider' );

	const { filters, fileName } = prepExport( context );

	const data = await dp.getList( {
		resource: 'responses/json-export',
		filters,
		pagination: { mode: 'off' },
	} );

	const dataStr = JSON.stringify( data, null, 2 );
	const blob = new Blob( [ dataStr ], { type: 'application/json' } );
	const url = URL.createObjectURL( blob );
	const link = document.createElement( 'a' );
	link.href = url;
	link.download = `${ fileName }.json`;
	link.click();
	URL.revokeObjectURL( url );
}

export function responseExportOptions<T>( context:ResponseExportContext ):UseExportOptionsType{

	const { filters, fileName: filename } = prepExport( context );

	const options:UseExportOptionsType = {
		resource: 'responses/for-export',
		download: true,
		filters,
		pageSize: 100,
		exportOptions: {
			filename,
		},

		mapData: item => ( {
			participant: item.member.badge ?? item.participantId,
			date: item.createdAt,
			slot: item.slotKey,
			type: item.type,
			group: item.groupId,
			day: item.forDay,
			//			...( typeof item.data === 'object' ? flattenNestedRecord( item.data as Record<string, unknown> ) : {} ),
			...( item.data as Record<string, unknown> ),
		} ),
	};

	return options;
}


