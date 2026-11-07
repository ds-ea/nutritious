import { CapacitorConfig } from '@capacitor/cli';


const config:CapacitorConfig = {
	appId: 'de.dife.foodapp',
	appName: 'FoodApp',
	webDir: '../../dist/apps/app',

	plugins: {
		SplashScreen: {
			// hidden explicitly once the app initializer has loaded config and translations,
			// see appInitializerFactory in src/app/app.module.ts
			launchAutoHide: false,
		},
	},
};

export default config;
