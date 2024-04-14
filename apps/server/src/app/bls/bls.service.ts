import { Injectable } from '@nestjs/common';
import { JsxTranslatedCrudService } from '../core/services/jsx-translated-crud.service';


@Injectable()
export class BlsService extends JsxTranslatedCrudService{
	constructor(){
		super( {
			model: 'bls',
			allowedJoins: [],
			defaultJoins: [],
		} );
	}
}
