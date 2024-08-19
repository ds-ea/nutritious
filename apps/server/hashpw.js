#!/usr/bin/env np-S npx tsx

import { hash } from 'argon2';
import { env, stdin, stdout } from 'node:process';
import { createInterface } from 'node:readline';



const secretRaw = env['PW_SECRET'];
if( !secretRaw ){
	console.log( env );
	console.warn( 'env var PW_SECRET missing' );
	process.exit( 1 );
}

const rl = createInterface( { input: stdin, output: stdout } );

rl.question( 'enter your password', async str => {


	const secret = Buffer.from( secretRaw, 'utf-8' );
	const hashedPass = await hash( str, { secret } );

	console.log( 'PW_SECRET', env['PW_SECRET'] );
	console.log( 'hash: ', hashedPass );


	rl.close();
} );
