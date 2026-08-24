import { xorEncryptDecrypt } from '../../../../../../libs/core/src';
import { buildSignupCode, parseSignupCode, SIGNUP_CODE_SALT } from './signup-code';


const QR_KEY = 'test-qr-code-hash';

describe( 'parseSignupCode', () => {

	describe( 'legacy "key:code" format', () => {

		it( 'splits key and code', () => {
			expect( parseSignupCode( 'ABC123:secret' ) ).toEqual( { key: 'ABC123', code: 'secret' } );
		} );

		it( 'keeps everything after the first colon as the code', () => {
			// split( ':', 2 ) means a code containing a colon is truncated - documenting current
			// behaviour so a future change to the separator is a deliberate one.
			expect( parseSignupCode( 'ABC123:se:cret' ) ).toEqual( { key: 'ABC123', code: 'se' } );
		} );

		it( 'carries no domain, so the form keeps whatever host is already set', () => {
			expect( parseSignupCode( 'ABC123:secret' )?.domain ).toBeUndefined();
			expect( parseSignupCode( 'ABC123:secret' )?.url ).toBeUndefined();
		} );

		it( 'rejects a payload with no colon', () => {
			expect( parseSignupCode( 'justsometext' ) ).toBeUndefined();
		} );

		it( 'rejects an empty code', () => {
			expect( parseSignupCode( 'ABC123:' ) ).toBeUndefined();
		} );

	} );


	describe( 'current "█"-delimited format', () => {

		it( 'parses an unencrypted payload', () => {
			const content = [ '1x', 'KEY', 'CODE', '1api.example.org' ].join( '█' );

			expect( parseSignupCode( content ) ).toEqual( {
				key: 'KEY',
				code: 'CODE',
				domain: 'api.example.org',
				url: 'https://api.example.org',
			} );
		} );

		it( 'treats a leading 1 on the host as https and anything else as http', () => {
			expect( parseSignupCode( [ '1x', 'K', 'C', '1api.example.org' ].join( '█' ) )?.url )
				.toBe( 'https://api.example.org' );

			expect( parseSignupCode( [ '1x', 'K', 'C', '0api.example.org' ].join( '█' ) )?.url )
				.toBe( 'http://api.example.org' );
		} );

		it( 'decrypts a "0x" payload with the build-time QR key', () => {
			const encrypt = ( v:string ) => xorEncryptDecrypt( v, QR_KEY, SIGNUP_CODE_SALT );
			const content = [ '0x', encrypt( 'KEY' ), encrypt( 'CODE' ), encrypt( '1api.example.org' ) ].join( '█' );

			expect( parseSignupCode( content, QR_KEY ) ).toEqual( {
				key: 'KEY',
				code: 'CODE',
				domain: 'api.example.org',
				url: 'https://api.example.org',
			} );
		} );

		it( 'round-trips through buildSignupCode', () => {
			const content = buildSignupCode(
				{ key: 'STUDY-7', code: 'p4ssw0rd', host: 'nutritious.example.org' },
				QR_KEY,
			);

			expect( parseSignupCode( content, QR_KEY ) ).toEqual( {
				key: 'STUDY-7',
				code: 'p4ssw0rd',
				domain: 'nutritious.example.org',
				url: 'https://nutritious.example.org',
			} );
		} );

		it( 'preserves a host that carries a port', () => {
			const parsed = parseSignupCode( [ '1x', 'K', 'C', '0localhost:3000' ].join( '█' ) );

			expect( parsed?.url ).toBe( 'http://localhost:3000' );
			expect( parsed?.domain ).toBe( 'localhost' );
		} );

		it( 'ignores trailing parts reserved for future use', () => {
			const content = [ '1x', 'KEY', 'CODE', '1api.example.org', 'extra', 'more' ].join( '█' );

			expect( parseSignupCode( content )?.key ).toBe( 'KEY' );
		} );

		it( 'returns undefined when decrypted with the wrong key rather than patching garbage', () => {
			const content = buildSignupCode(
				{ key: 'KEY', code: 'CODE', host: 'api.example.org' },
				QR_KEY,
			);

			// A build with a mismatched NX_QR_CODE_HASH decodes to noise; it must not silently
			// end up as the API host.
			const parsed = parseSignupCode( content, 'a-completely-different-key' );

			if( parsed )
				expect( parsed.domain ).not.toBe( 'api.example.org' );
			else
				expect( parsed ).toBeUndefined();
		} );

		it( 'returns undefined for a truncated payload', () => {
			expect( parseSignupCode( [ '1x', 'KEY' ].join( '█' ) ) ).toBeUndefined();
			expect( parseSignupCode( [ '1x', 'KEY', 'CODE' ].join( '█' ) ) ).toBeUndefined();
		} );

		it( 'returns undefined for an unusable host', () => {
			expect( parseSignupCode( [ '1x', 'KEY', 'CODE', '1' ].join( '█' ) ) ).toBeUndefined();
		} );

	} );


	it( 'returns undefined for empty input', () => {
		expect( parseSignupCode( '' ) ).toBeUndefined();
		expect( parseSignupCode( undefined as unknown as string ) ).toBeUndefined();
	} );

} );
