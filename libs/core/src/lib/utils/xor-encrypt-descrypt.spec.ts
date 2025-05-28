import { xorEncryptDecrypt } from './xor-encrypt-decrypt';


describe( 'xorEncryptDecrypt', () => {
	it( 'should properly encrypt and decrypt strings without forbidden characters', () => {
		const printableAscii:string = Array.from( { length: 95 }, ( _, i ) => String.fromCharCode( 32 + i ) ).join( '' ); // All printable ASCII characters
		const key = 'abc';
		const salt = '123';

		// Test encryption
		const encryptedString:string = xorEncryptDecrypt( printableAscii, key, salt );
		expect( encryptedString ).not.toEqual( printableAscii ); // Ensure encryption changes the string

		// Test decryption
		const decryptedString:string = xorEncryptDecrypt( encryptedString, key, salt );
		expect( decryptedString ).toEqual( printableAscii ); // Ensure decryption restores the original string
	} );

	it( 'should properly encrypt and decrypt strings with forbidden characters', () => {
		const printableAscii:string = Array.from( { length: 95 }, ( _, i ) => String.fromCharCode( 32 + i ) ).join( '' ); // All printable ASCII characters
		const key = 'abc';
		const salt = '123';
		const forbiddenChars = ':'; // Colon as a forbidden character

		// Test encryption
		const encryptedString:string = xorEncryptDecrypt( printableAscii, key, salt, forbiddenChars );
		expect( encryptedString ).not.toEqual( printableAscii ); // Ensure encryption changes the string
		expect( encryptedString ).not.toMatch( /:/ ); // Ensure encrypted string does not contain a colon

		// Test decryption
		const decryptedString:string = xorEncryptDecrypt( encryptedString, key, salt, forbiddenChars );
		expect( decryptedString ).toEqual( printableAscii ); // Ensure decryption restores the original string
	} );
} );
