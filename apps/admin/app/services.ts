import { AdminClient } from '@nutritious/api-client';
import { AuthBindings } from '@refinedev/core';
import dataProvider from '@refinedev/nestjsx-crud';
import type { AuthUserCredentials } from '../../../libs/core/src/lib/types/auth.types';


const API_URL = 'http://localhost:7880';
const apiClient = new AdminClient( { url: API_URL } );

const clearAuth = () => {
	localStorage.removeItem( 'auth.token' );
	localStorage.removeItem( 'auth.user' );
	apiClient.setAuth( null, null );
};


/*apiClient.axios.interceptors.response.use( ( response:AxiosResponse ) => response,
	( error:AxiosError ) => {
		if( error.response?.status === 401 && error.config?.url !== 'auth/login' ){
			//			clearAuth();
			//			document.location.href = '/login';
		}

		return error;
	},
);*/

const restDataProvider = dataProvider( API_URL, apiClient.axios );


const authProvider:AuthBindings = {

	login: async ( credentials:AuthUserCredentials ) => {
		const response = await apiClient.auth.login( credentials );

		console.log( 'sdf', response );
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
		console.info( 'logout' );
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
		console.log( 'check' );
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

	getPermissions: async () => {},

	getIdentity: async () => {
		const rawUser = localStorage.getItem( 'auth.user' );
		console.log( 'ident', rawUser );
		if( !rawUser )
			return null;

		return JSON.parse( rawUser );
	},
};



export { apiClient, authProvider, restDataProvider };
