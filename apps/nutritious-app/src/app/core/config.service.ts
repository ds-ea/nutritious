import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface AppConfig{
	API_URL: string;
	
	PRIVACY_URL?:string;
	SUPPORT_URL?:string;
	SUPPORT_EMAIL?:string;
	SUPPORT_CONTACT?:string;
}

@Injectable( {
	             providedIn: 'root',
             } )
export class ConfigService{
	protected _loaded = false;
	
	protected config:AppConfig|undefined;
	
	constructor(
		private http:HttpClient
	){ }
	
	public async loadConfig( env:'DEV'|'PROD' ):Promise<AppConfig>{
		if( this._loaded )
			throw new Error( 'can\'t load config twice' );
		
		const data = await this.http.get<Record<string, AppConfig>>('app.config.json').toPromise();
		if( !data )
			throw new Error('can not load app config file');
		
		const config = data[ env ] || undefined;
		if( !config )
			throw new Error('app config does not include data for env '+ env );
		
		this.config = config;
		this._loaded = true;
		
		return config;
	}
	
	public get( key:string ):any{
		let parts = key.split('.');
		
		let value:any = this.config;
		for( const k of parts ){
			if( value[k] === undefined )
				return undefined;
			
			value = value[k];
		}
		
		return value;
	}
	
}
