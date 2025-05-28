import { CapacitorConfig } from '@capacitor/cli';


const config:CapacitorConfig = {
	appId: 'de.dife.foodapp',
	appName: 'FoodApp',
	webDir: '../../dist/apps/app',
	bundledWebRuntime: false,
	launchAutoHide: false,
} as any;

export default config;
