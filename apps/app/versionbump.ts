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

	// Runs automatically before app:build via dependsOn. Set NX_SKIP_VERSION_BUMP to a truthy
	// value to build without minting a new build number - useful for local iteration, where a
	// fresh number on every build defeats the Nx cache.
	const skip = process.env['NX_SKIP_VERSION_BUMP'];
	if( skip !== undefined && !['', '0', 'false', 'no', 'off'].includes(String(skip).toLowerCase()) ){
		const current = require(path.join(__dirname, '.buildversion.json'));
		console.log(`version bump skipped (NX_SKIP_VERSION_BUMP) - keeping ${ current.version } (${ current.build })`);
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

	// Android reads .buildversion.json through variables.gradle. Xcode cannot, so the two
	// fields have to be written into the project file directly - otherwise every iOS build
	// silently ships whatever version was last hardcoded there.
	const pbxprojPath = path.join(projectDir, 'ios/App/App.xcodeproj/project.pbxproj');
	if( !fs.existsSync(pbxprojPath) ){
		console.warn('no Xcode project at ' + pbxprojPath + ' - skipping iOS version update');
		return;
	}

	const pbxproj = fs.readFileSync(pbxprojPath, 'utf8');
	const updated = pbxproj
		.replace(/CURRENT_PROJECT_VERSION = [^;]+;/g, `CURRENT_PROJECT_VERSION = ${buildNumber};`)
		.replace(/MARKETING_VERSION = [^;]+;/g, `MARKETING_VERSION = ${version};`);

	const bumped = (updated.match(/CURRENT_PROJECT_VERSION = /g) || []).length;
	if( !bumped ){
		console.error('no CURRENT_PROJECT_VERSION entries found in the Xcode project');
		return process.exit(1);
	}

	fs.writeFileSync(pbxprojPath, updated);
	console.log(`ios: updated ${bumped} build configurations`);

})();
