import { Injectable } from '@nestjs/common';
import { JsxTranslatedCrudService } from '../core/services/jsx-translated-crud.service';


@Injectable()
export class StepsService extends JsxTranslatedCrudService{
	constructor(){
		super( {
			model: 'step',
			allowedJoins: [],
			defaultJoins: [],
		} );
	}
}
