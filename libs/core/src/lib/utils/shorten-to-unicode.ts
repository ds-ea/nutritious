/**
 * used to compress partial URLs in QR codes
 * generated using ChatGPT
 */

export function shortenToUnicode( input:string ):string{
	// Check if the input is a string
	if( typeof input !== 'string' ){
		throw new TypeError( 'Input must be a string' );
	}

	// Pad the input string with a placeholder character if its length is odd
	if( input.length % 2 !== 0 ){
		input += ' ';
	}

	// Initialize an empty array to store the shortened characters
	const shortenedChars:string[] = [];

	// Iterate through the input string by step of 2
	for( let i = 0 ; i < input.length ; i += 2 ){
		// Get the next two characters from the input string
		const char1 = input[i];
		const char2 = input[i + 1];

		// Combine the character codes of the two characters
		const combinedCharCode = char1.charCodeAt( 0 ) * 256 + char2.charCodeAt( 0 );

		// Convert the combined character code to its Unicode equivalent
		const unicodeChar = String.fromCharCode( combinedCharCode );

		// Add the Unicode character to the array
		shortenedChars.push( unicodeChar );
	}

	// Join the Unicode characters and return the result
	return shortenedChars.join( '' );
}

export function decodeFromUnicode( input:string ):string{
	// Check if the input is a string
	if( typeof input !== 'string' ){
		throw new TypeError( 'Input must be a string' );
	}

	// Initialize an empty array to store the decoded characters
	const decodedChars:string[] = [];

	// Iterate through the input string
	for( let i = 0 ; i < input.length ; i++ ){
		// Get the Unicode character
		const unicodeChar = input[i];

		// Get the character code of the Unicode character
		const charCode = unicodeChar.charCodeAt( 0 );

		// Extract the original ASCII characters from the character code
		const char1 = String.fromCharCode( Math.floor( charCode / 256 ) );
		const char2 = String.fromCharCode( charCode % 256 );

		// Add the original ASCII characters to the array
		decodedChars.push( char1, char2 );
	}

	// Join the decoded characters and return the result
	return decodedChars.join( '' );
}
