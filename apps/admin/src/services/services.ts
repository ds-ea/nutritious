import { AdminClient } from '@nutritious/api-client';
import dataProvider from '@refinedev/nestjsx-crud';
import getAuthProvider from './auth-provider';


const API_URL = import.meta.env['VITE_API_URL'];
if( !API_URL?.length )
	throw new Error( 'API URL is missing' );

const apiClient = new AdminClient( { url: API_URL } );


let restored = false;
export const restoreAuth = () => {
	if( restored )
		return;

	restored = true;

	const token = localStorage.getItem( 'auth.token' );
	const refresh = localStorage.getItem( 'auth.refresh' );

	if( token )
		apiClient?.setAuth( token, refresh );

};

const clearAuth = () => {
	localStorage.removeItem( 'auth.token' );
	localStorage.removeItem( 'auth.refresh' );
	localStorage.removeItem( 'auth.user' );
	apiClient?.setAuth( null, null );
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

//restoreAuth();

const restDataProvider = dataProvider( API_URL, apiClient.axios );

const authProvider = getAuthProvider( apiClient, clearAuth );


export { apiClient, authProvider, restDataProvider };
