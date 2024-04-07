export function hoursToTime( hours:number ):string{
	return hours.toString().padStart( 2, '0' ) + ':00';
}

export function minutesToTime( minutes:number | null | undefined ):string{
	if( minutes == null )
		return '';

	return `${ String( Math.floor( minutes / 60 ) ).padStart( 2, '0' ) }:${ String( minutes % 60 ).padStart( 2, '0' ) }`;
}
