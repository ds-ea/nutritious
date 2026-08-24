import { xorEncryptDecrypt } from './xor-encrypt-decrypt';


const printableAscii = Array.from( { length: 95 }, ( _, i ) => String.fromCharCode( 32 + i ) ).join( '' );

describe( 'xorEncryptDecrypt', () => {

	it( 'round-trips a string through the same key and salt', () => {
		const key = 'abc';
		const salt = '123';

		const encrypted = xorEncryptDecrypt( printableAscii, key, salt );
		expect( encrypted ).not.toEqual( printableAscii );

		expect( xorEncryptDecrypt( encrypted, key, salt ) ).toEqual( printableAscii );
	} );

	it( 'round-trips without a salt', () => {
		const key = 'abc';

		const encrypted = xorEncryptDecrypt( printableAscii, key );
		expect( encrypted ).not.toEqual( printableAscii );

		expect( xorEncryptDecrypt( encrypted, key ) ).toEqual( printableAscii );
	} );

	it( 'produces different output for a different key', () => {
		const salt = '123';

		expect( xorEncryptDecrypt( printableAscii, 'abc', salt ) )
			.not.toEqual( xorEncryptDecrypt( printableAscii, 'xyz', salt ) );
	} );

	it( 'does not decrypt with the wrong salt', () => {
		const key = 'abc';

		const encrypted = xorEncryptDecrypt( printableAscii, key, '123' );
		expect( xorEncryptDecrypt( encrypted, key, '456' ) ).not.toEqual( printableAscii );
	} );

	it( 'handles the empty string', () => {
		expect( xorEncryptDecrypt( '', 'abc', '123' ) ).toEqual( '' );
	} );

	// NOTE: an earlier version of this spec exercised a 4th `forbiddenChars` argument that
	// xorEncryptDecrypt has never accepted, so the call silently ignored it and the assertion
	// failed. The QR payload no longer uses ':' as a separator (it is '█'), so there is nothing
	// for such an escape mechanism to protect. See apps/app/.../signup-code.ts.
} );
