import { Group, PublicStudy, SafeParticipant } from '@nutritious/core';
import { CrudFilters, useExport } from '@refinedev/core';
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


export function responseExportOptions<T>( context:{ group:Group | undefined } | { study:PublicStudy | undefined } | { participant:SafeParticipant | undefined } ):UseExportOptionsType{


	const [ key, contextData ] = Object.entries( context )?.[0];
	if( !contextData )
		throw new Error( 'missing or empty export context' );

	const field = key ? key + 'Id' : undefined;
	const value = contextData.id;
	const fileNameAddon = contextData ? key + ' ' + contextData.name?.trim() : undefined;

	if( !field || !value )
		throw new Error( 'missing or empty export filter' );

	const filters:CrudFilters = [
		{ field, operator: 'eq', value },
	];

	let filename = [ 'responses', fileNameAddon, dayjs().format() ].join( ' - ' );

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
			created: item.createdAt,
			updated: item.updatedAt,
			slot: item.slotKey,
			type: item.type,
			group: item.groupId,
			//			...( typeof item.data === 'object' ? flattenNestedRecord( item.data as Record<string, unknown> ) : {} ),
			...( item.data as Record<string, unknown> ),
		} ),
	};

	return options;
}


