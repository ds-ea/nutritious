import { AdminClient } from '@nutritious/api-client';
import type { AuthUserCredentials } from '@nutritious/core';
import { AuthBindings } from '@refinedev/core';
import { apiClient } from './services';


export default function( api:AdminClient, clearAuth:() => void ):AuthBindings{
	return {

		login: async ( credentials:AuthUserCredentials ) => {
			const response = await apiClient.auth.login( credentials );

			if( response?.access_token
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

		},

		logout: async () => {
			clearAuth();

			return {
				success: true,
				redirectTo: '/login',
			};
		},

		onError: async ( error:any ) => {
			console.log( 'data provider error', error );

			if( error?.response?.status === 401 ){
				clearAuth();
				return {
					success: false,
					redirectTo: '/login',
					error: { name: 'Unauthorized', message: 'please log in again' },
				};
			}

			return { error };
		},

		check: async ( request:any ) => {
			const token = localStorage.getItem( 'auth.token' );

			const { pathname } = request ? new URL( request.url ) : { pathname: undefined };
			if( !token ){
				return {
					authenticated: false,
					error: {
						message: 'Check failed',
						name: 'Unauthenticated',
					},
					logout: true,
					redirectTo: `/login${ pathname ? '?to=' + pathname : '' }`,
				};
			}

			return {
				authenticated: true,
			};
		},

		getPermissions: async () => {
			console.log( 'get perms' );
		},

		getIdentity: async () => {
			const rawUser = localStorage.getItem( 'auth.user' );
			if( !rawUser )
				return null;

			return JSON.parse( rawUser );
		},
	};
};
