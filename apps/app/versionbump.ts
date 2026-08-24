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
	// The app version lives in the workspace package.json - project.json has never had a
	// `version` field, so this used to write `undefined` and left nutritiousVersion null in
	// android/variables.gradle.
	const version = require(path.join(__dirname, '../../package.json')).version;

	if( !version ){
		console.error('no version found in the workspace package.json');
		return process.exit(1);
	}

	console.log('version: ', version);
	console.log('build: ', buildNumber);

	fs.writeFileSync(projectDir + '/.buildversion.json', JSON.stringify({build: buildNumber, version}));

})();
