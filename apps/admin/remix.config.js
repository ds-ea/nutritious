/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
	ignoredRouteFiles: ["**/.*"], serverModuleFormat: "cjs", // appDirectory: "app",
	// assetsBuildDirectory: "public/build",
	// serverBuildPath: "build/index.js",
	// publicPath: "/build/",
	browserNodeBuiltinsPolyfill: {modules: {path: true, events: true, fs: true, util: true, assert: true}}
};