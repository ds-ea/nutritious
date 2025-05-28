import { Injectable } from '@angular/core';


export type AppConfig = {
	DEPLOYMENT_ENV?:string;
	PROJECT_NAME?:string;
	API_URL?:string;
	PRIVACY_URL?:string;
	SUPPORT_URL?:string;
	QR_CODE_HASH?:string;
}
type AppConfigKeys = keyof AppConfig;
const appConfigKeys:AppConfigKeys[] = [ 'DEPLOYMENT_ENV', 'PROJECT_NAME', 'API_URL', 'PRIVACY_URL', 'SUPPORT_URL', 'QR_CODE_HASH' ];

@Injectable( {
	providedIn: 'root',
} )
export class ConfigService{
	protected _loaded = false;

	protected config:AppConfig | undefined;

	constructor(){ }

	public async loadConfig():Promise<AppConfig>{
		if( this._loaded )
			throw new Error( 'can\'t load config twice' );

		const config:AppConfig = {
			DEPLOYMENT_ENV: process.env['NX_DEPLOYMENT_ENV'],
			PROJECT_NAME: process.env['NX_PROJECT_NAME'],
			API_URL: process.env['NX_API_URL'],
			PRIVACY_URL: process.env['NX_PRIVACY_URL'],
			SUPPORT_URL: process.env['NX_SUPPORT_URL'],
			QR_CODE_HASH: process.env['NX_QR_CODE_HASH'],
		};

		this.config = config;
		this._loaded = true;

		return config;
	}

	public get( key:keyof AppConfig ):any{
		let parts = key.split( '.' );

		let value:any = this.config;
		for( const k of parts ){
			if( value[k] === undefined )
				return undefined;

			value = value[k];
		}

		return value;
	}

}
