import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ipsy.foodapp',
  appName: 'Nutritious',
	webDir: '../../dist/apps/nutritious-app',
  bundledWebRuntime: false,
  launchAutoHide: false
} as any;

export default config;
