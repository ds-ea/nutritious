const {hash} = require('argon2');
const {env, stdin, stdout} = require('node:process');
const readline = require('node:readline');


const secretRaw = env['PW_SECRET'];
if( !secretRaw ){
	console.warn(env);
	console.warn('env var PW_SECRET missing');
	process.exit(1);
}

const rl = readline.createInterface({input: stdin, output: stdout});
rl.input.on('keypress', function( c, k ){
	const len = rl.line.length;
	readline.moveCursor(rl.output, -len, 0);
	readline.clearLine(rl.output, 1);
	for( let i = 0 ; i < len ; i++ ){
		rl.output.write('*');
	}
});
rl.question('enter the password: ', async str => {
	const secret = Buffer.from(secretRaw, 'utf-8');
	const hashedPass = await hash(str, {secret});

	console.log('hash: ', hashedPass);

	rl.close();
});
