const webpack = require('webpack');
const fs = require('fs');
const path = require('path');

/**
 * Reads the version and build number the app should report about itself.
 *
 * These are baked into the bundle at build time, so what the app shows in its menu is always the
 * version the JS was actually built from - not whatever .buildversion.json happens to say later.
 * Bumping the build for a native-only change therefore leaves the in-app version alone until the
 * web assets are rebuilt, which is the honest answer.
 *
 * An explicit NX_APP_VERSION / NX_APP_BUILD in the environment still wins, for CI.
 */
function getBuildVersion(){
	const buildVersionPath = path.join(__dirname, '.buildversion.json');

	if( !fs.existsSync(buildVersionPath) ){
		console.warn(`[app] ${ buildVersionPath } not found - the app will report no version. Run \`nx run app:version-bump\`.`);
		return {};
	}

	try{
		const { version, build } = JSON.parse(fs.readFileSync(buildVersionPath, 'utf8'));
		return {
			NX_APP_VERSION: version == null ? undefined : String(version),
			NX_APP_BUILD: build == null ? undefined : String(build),
		};
	}catch( err ){
		console.warn(`[app] could not read ${ buildVersionPath }: ${ err.message }`);
		return {};
	}
}

function getClientEnvironment(){
	// Grab NX_* environment variables and prepare them to be injected
	// into the application via DefinePlugin in webpack configuration.
	const NX_APP = /^NX_/i;

	const raw = Object.keys(process.env)
		.filter(( key ) => NX_APP.test(key))
		.reduce(( env, key ) => {
			env[key] = process.env[key];
			return env;
		}, {});

	// .buildversion.json is the source of truth for the version and wins over the environment.
	// Nx auto-loads .env into the task environment, so a stale NX_APP_VERSION there would
	// otherwise silently override the file and ship a build labelled with the wrong version.
	for( const [ key, value ] of Object.entries(getBuildVersion()) ){
		if( value === undefined )
			continue;

		if( raw[key] !== undefined && raw[key] !== value )
			console.warn(`[app] ignoring ${ key }=${ raw[key] } from the environment; .buildversion.json says ${ value }. Remove it from .env to silence this.`);

		raw[key] = value;
	}

	if( !raw['NX_API_URL'] )
		console.warn('[app] NX_API_URL is not set - this build will not be able to reach the API.');

	console.log(`[app] building version ${ raw['NX_APP_VERSION'] ?? '?' } (${ raw['NX_APP_BUILD'] ?? '?' }) from .buildversion.json`);

	// Stringify all values so we can feed into webpack DefinePlugin
	return {
		'process.env': Object.keys(raw).reduce(( env, key ) => {
			env[key] = JSON.stringify(raw[key]);
			return env;
		}, {}),
	};
}

module.exports = ( config, options, context ) => {
	// Overwrite the mode set by Angular if the NODE_ENV is set
	config.mode = process.env.NODE_ENV || config.mode;
	config.plugins.push(new webpack.DefinePlugin(getClientEnvironment()));
	return config;
};
