/**
 * Capacitor's Android console bridge calls String() on every console argument, so anything
 * passed as a separate argument arrives in logcat as "[object Object]" - useless precisely when
 * something has gone wrong. Fold detail into the message string instead.
 */
export function describeError( err:unknown ):string{
	if( err == null )
		return 'unknown error';

	if( typeof err === 'string' )
		return err;

	// HttpErrorResponse and anything else carrying a status
	const maybeHttp = err as { status?:number, statusText?:string, message?:string, error?:unknown };
	if( typeof maybeHttp.status === 'number' ){
		const detail = typeof maybeHttp.error === 'string'
					   ? maybeHttp.error
					   : maybeHttp.message ?? maybeHttp.statusText ?? '';

		return `HTTP ${ maybeHttp.status }${ detail ? ` ${ detail }` : '' }`;
	}

	if( err instanceof Error )
		return `${ err.name }: ${ err.message }`;

	try{
		return JSON.stringify( err ) ?? String( err );
	}catch{
		return String( err );
	}
}
