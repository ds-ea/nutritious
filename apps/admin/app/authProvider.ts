import { AdminClient } from '@nutritious/api-client';
import type { AuthBindings } from '@refinedev/core';
import { type AuthUserCredentials } from '../../../libs/core/src/lib/types/auth.types';



export class AuthProvider implements AuthBindings{

	constructor( private api:AdminClient ){}

	async login( credentials:AuthUserCredentials ){
		const response = await this.api.auth.login( credentials );

		if( response.access_token
			&& ( 'user' in response )
			&& response?.user
		){
			localStorage.setItem( 'auth.token', response.access_token );
			localStorage.setItem( 'auth.user', JSON.stringify( response.user ) );

			return {
				success: true,
				redirectTo: '/',
			};
		}


		return {
			success: false,
			error: {
				message: 'Login failed',
				name: 'Invalid email or password',
			},
		};

	}

	async logout(){
		console.info( 'logout' );
		localStorage.removeItem( 'auth.token' );
		localStorage.removeItem( 'auth.user' );

		return {
			success: true,
			redirectTo: '/login',
		};
	}

	async onError( error:any ){
		console.log( 'errrrrrrrr' );
		console.error( error );
		return { error };
	}

	async check( request:any ){
		let user = undefined;

		console.info( 'log che' );
		/*
		if( request ){
			const hasCookie = request.headers.get( 'Cookie' );
			if( hasCookie ){
				const parsedCookie = cookie.parse( request.headers.get( 'Cookie' ) );
				user = parsedCookie[COOKIE_NAME];
			}
		}else{
			const parsedCookie = Cookies.get( COOKIE_NAME );
			user = parsedCookie ? JSON.parse( parsedCookie ) : undefined;
		}
		*/

		const { pathname } = new URL( request.url );

		if( !user ){
			return {
				authenticated: false,
				error: {
					message: 'Check failed',
					name: 'Unauthenticated',
				},
				logout: true,
				redirectTo: `/login?to=${ pathname }`,
			};
		}

		return {
			authenticated: true,
		};
	}

	//	async getPermissions(){}

	async getIdentity(){
		const rawUser = localStorage.getItem( 'auth.user' );
		console.log( 'ident', rawUser );
		if( !rawUser )
			return null;

		return JSON.parse( rawUser );
	}
}
