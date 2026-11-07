import { xorEncryptDecrypt } from '../../../../../../libs/core/src';


/**
 * Salt paired with the build-time NX_QR_CODE_HASH when obfuscating '0x' payloads.
 * Must stay byte-identical to the generator in the admin panel.
 */
export const SIGNUP_CODE_SALT = 'asdoufawejasdifya0w3y-r8werfwe7gbR&#_(*&H#Q0u';

/** Separator for the current payload format. */
export const SIGNUP_CODE_SEPARATOR = '█';

export type ParsedSignupCode = {
	key:string;
	code:string;
	/** hostname only - present for the current format, absent for the legacy 'key:code' one */
	domain?:string;
	/** full origin the app should talk to, e.g. https://api.example.org */
	url?:string;
}


/**
 * Parses the contents of a signup QR code.
 *
 * Two formats are in circulation:
 *
 * - legacy: `key:code`
 * - current: `version █ key █ code █ shortenedDomain [ █ ... ]`, where `version === '0x'` means
 *   every following part is XOR-obfuscated with `qrKey` (build-time NX_QR_CODE_HASH) and
 *   {@link SIGNUP_CODE_SALT}, and `shortenedDomain` carries the scheme in its first character:
 *   a leading `1` means https, anything else means http.
 *
 * Returns undefined when the payload cannot be understood, so callers can show a scan error
 * instead of silently patching a broken host into the form.
 */
export function parseSignupCode( content:string, qrKey?:string ):ParsedSignupCode | undefined{
	if( !content?.length )
		return undefined;

	if( content.indexOf( SIGNUP_CODE_SEPARATOR ) === -1 ){
		// legacy format
		const [ key, code ] = content.split( ':', 2 );
		if( !key?.length || !code?.length )
			return undefined;

		return { key, code };
	}

	const [ version, ...rawParts ] = content.split( SIGNUP_CODE_SEPARATOR );

	const parts =
		version === '0x'
		? rawParts.map( value => xorEncryptDecrypt( value, qrKey ?? '', SIGNUP_CODE_SALT ) )
		: rawParts;

	const [ key, code, shortenedDomain ] = parts;

	if( !key?.length || !code?.length || !shortenedDomain?.length )
		return undefined;

	const url = 'http' + ( shortenedDomain.charAt( 0 ) === '1' ? 's' : '' ) + '://' + shortenedDomain.slice( 1 );

	let domain:string;
	try{
		domain = new URL( url ).hostname;
	}catch{
		return undefined;
	}

	if( !domain?.length )
		return undefined;

	return { key, code, domain, url };
}


/**
 * Inverse of {@link parseSignupCode}, for tests and for generating codes.
 */
export function buildSignupCode(
	{ key, code, host, secure = true }:{ key:string, code:string, host:string, secure?:boolean },
	qrKey?:string,
):string{
	const shortenedDomain = ( secure ? '1' : '0' ) + host;
	const parts = [ key, code, shortenedDomain ];

	if( qrKey == null )
		return [ '1x', ...parts ].join( SIGNUP_CODE_SEPARATOR );

	return [ '0x', ...parts.map( p => xorEncryptDecrypt( p, qrKey, SIGNUP_CODE_SALT ) ) ]
		.join( SIGNUP_CODE_SEPARATOR );
}
