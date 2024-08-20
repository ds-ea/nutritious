import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ConfigService } from './config.service';


export enum CallMethod{
	GET = 'GET',
	POST = 'POST',
	PATCH = 'PATCH',
	PUT = 'PUT',
	DELETE = 'DELETE',
	OPTIONS = 'OPTIONS',
	HEAD = 'HEAD',
}

// export type CallMethods = keyof typeof CallMethod | null ;

export interface callOptions{
	body?:any;
	headers?:HttpHeaders | {
		[header:string]:string | string[];
	};
	params?:HttpParams | {
		[param:string]:string | string[];
	};
	observe?:any;
	reportProgress?:boolean;
	responseType?:'arraybuffer' | 'blob' | 'json' | 'text';

	withCredentials?:boolean;
	ignore401?:boolean;
	nocache?:boolean;

	noAuth?:boolean;
	noAuthRefresh?:boolean;
}


@Injectable( {
	providedIn: 'root',
} )
export class ApiService{

	protected _token:string | undefined;
	protected _refreshToken:string | undefined;

	public url:string | undefined;

	public unauthorized:EventEmitter<Error> = new EventEmitter<Error>();

	constructor(
		protected http:HttpClient,
		protected config:ConfigService,
	){
		this.url = this.config.get( 'API_URL' );
	}


	public setToken( token:string | undefined ){
		this._token = token;
	}


	public get<T>( call:string, data?:any, options:callOptions = {}, baseURL?:string ):Observable<T>{
		return this.call<T>( call, data, CallMethod.GET, options, baseURL );
	}

	public post<T>( call:string, data?:any, options:callOptions = {}, baseURL?:string ):Observable<T>{
		return this.call<T>( call, data, CallMethod.POST, options, baseURL );
	}


	public call<T>(
		call:string,
		data?:any,
		method:CallMethod | null = null,
		options:callOptions = {},
		baseURL?:string,
	):Observable<T>{

		let apiBase = baseURL ?? this.url;
		if( !apiBase )
			throw new Error( 'API base url was not set' );

		if( apiBase.charAt( apiBase.length - 1 ) != '/' )
			apiBase += '/';

		let url = apiBase + call;

		if( !method )
			method = data ? CallMethod.POST : CallMethod.GET;


		if( data ){
			options = options || {};

			if( method === CallMethod.GET ){
				options.params = new HttpParams( typeof data === 'object' ? { fromObject: data } : { fromString: data } );
			}else{
				options.body = data;
			}
		}

		const includesAuth = this._token && !options.noAuth;
		if( includesAuth ){
			// options.headers = { ...options.headers||{}, ...{Authorization: 'Bearer '+ this._token}};
			options.headers = options.headers || {};
			//@ts-ignore
			options.headers['Authorization'] = `Bearer ${ this._token }`;

		}

		if( options.nocache ){
			options.headers = options.headers || {};
			//@ts-ignore
			options.headers['Cache-Control'] = 'no-cache';
			//@ts-ignore
			options.headers['Pragma'] = 'no-cache';
		}

		const allowAuthRefresh = !options.noAuthRefresh;
		if( options.noAuthRefresh !== null ){
			delete options.noAuthRefresh;
		}

		const ignore401 = options.ignore401 || false;
		if( options.ignore401 !== null ){
			delete options.ignore401;
		}

		return this.http.request( method as string, url, options )
			.pipe(
				catchError( error => {
					if( error.status === 401 && !ignore401 )
						this.unauthorized.emit( error );

					throw error;
				} ),
			);
	}



}
