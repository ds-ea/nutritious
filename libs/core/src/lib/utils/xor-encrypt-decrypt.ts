export function xorEncryptDecrypt( str:string, key:string, salt = '' ):string{
	let result = '';
	for( let i = 0 ; i < str.length ; i++ ){
		result += String.fromCharCode( str.charCodeAt( i ) ^ key.charCodeAt( i % key.length ) ^ salt.charCodeAt( i % salt.length ) );
	}
	return result;
}
