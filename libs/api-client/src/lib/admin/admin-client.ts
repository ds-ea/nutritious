import { ApiClient } from '../api-client';
import { Auth } from '../shared/auth';


export class AdminClient extends ApiClient{
	auth = new Auth( this );
}
