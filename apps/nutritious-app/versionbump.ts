#!/usr/bin/env ts-node

const path = require('path');

const fs = require('fs');
const {generate} = require('build-number-generator');

const processConfigXML = false;

(async () => {

	if (!process.argv[2]) {
		console.log('versionbump.ts app-name');
		return;
	}

	const projectKey = path.normalize(process.argv[2]);
	const projectDir = path.join(__dirname, projectKey);

	if( !fs.existsSync(projectDir) ){
		console.error('project does not exist: '+ projectDir);
		return process.exit(1);
	}


	const buildNumber = Number(generate());
	const version = require(projectDir + '/package.json').version;

	console.log('version: ', version);
	console.log('build: ', buildNumber);

	fs.writeFileSync(projectDir + '/.buildversion.json', JSON.stringify({build: buildNumber, version}));

})();
