import { AuthLoginResponse, AuthUserCredentials } from '@nutritious/core';
import { ApiClientModule } from '../api-client';


export class Auth extends ApiClientModule{

	public async login( credentials:AuthUserCredentials ){
		const result = await this.client.post<AuthLoginResponse>( 'auth/login', credentials );

		if( result.data?.access_token )
			this.client.setAuth( result.data.access_token );

		return result.data;
	}

}
