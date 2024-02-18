import axios, { AxiosInstance, AxiosResponse, Method, RawAxiosRequestHeaders } from 'axios';


export interface ApiConfig{
	url:string;
}

export abstract class ApiClientModule{
	public constructor( protected client:ApiClient ){}
}

export abstract class ApiClient{
	protected token?:string;
	protected refreshToken?:string;

	public axios:AxiosInstance;

	public constructor( protected config:ApiConfig ){
		this.axios = axios.create( {
			baseURL: this.config.url,
			timeout: 1000,
		} );

		this.axios.interceptors.request.use(
			async ( config ) => {
				if( this.token && config?.headers )
					config.headers.Authorization = `Bearer ${ this.token }`;

				return config;
			},
		);
	}

	public setAuth( token:string | null, refreshToken?:string | null ){
		this.token = token ?? undefined;
		if( refreshToken !== undefined )
			this.refreshToken = refreshToken ?? undefined;
	}

	public call<T>( action:string, method:Method, data?:unknown ):Promise<AxiosResponse<T>>{

		const headers:RawAxiosRequestHeaders = {};

		return this.axios.request<T>( {
			url: action,
			method,
			data,
			headers,
		} );
	}

	public get<T>( action:string, data?:unknown ):Promise<AxiosResponse<T>>{
		return this.call( action, 'GET', data );
	}

	public post<T>( action:string, data?:unknown ):Promise<AxiosResponse<T>>{
		return this.call( action, 'POST', data );
	}

	public patch<T>( action:string, data?:unknown ):Promise<AxiosResponse<T>>{
		return this.call( action, 'PATCH', data );
	}

	public delete<T>( action:string, data?:unknown ):Promise<AxiosResponse<T>>{
		return this.call( action, 'DELETE', data );
	}

}
