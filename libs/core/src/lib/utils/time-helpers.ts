import { type TranslateService } from '@ngx-translate/core';


export function hoursToTime( hours:number ):string{
	return hours.toString().padStart( 2, '0' ) + ':00';
}

export function minutesToTime( minutes:number | null | undefined ):string{
	if( minutes == null )
		return '';

	// wrap 24h
	minutes = minutes % 1440;

	return `${ String( Math.floor( minutes / 60 ) ).padStart( 2, '0' ) }:${ String( minutes % 60 ).padStart( 2, '0' ) }`;
}



const dayMap = [ 'SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT' ] as const;
export const humanReadableDays = ( days?:number[], translate?:TranslateService, translateSuffix = '_SHORT' ):string[] | undefined => {
	if( !days?.length )
		return undefined;

	let parts:string[] | undefined;

	if( days.length === 2 && days.includes( 0 ) && days.includes( 6 ) )
		parts = [ translate ? 'DATE.WEEKENDS' : 'weekends' ];
	else if( days.length === 5 && !days.includes( 0 ) && !days.includes( 6 ) )
		parts = [ translate ? 'DATE.WEEKDAYS' : 'weekdays' ];
	else
		parts = days.map( day => translate ? `DATE.DAY_${ dayMap[day] }${ translateSuffix }` : dayMap[day] );

	return translate ? parts.map( str => translate.instant( str ) ) : parts;
};
