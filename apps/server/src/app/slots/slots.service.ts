import { Injectable } from '@nestjs/common';
import { JsxTranslatedCrudService } from '../core/services/jsx-translated-crud.service';


@Injectable()
export class SlotsService extends JsxTranslatedCrudService{
	constructor(){
		super( {
			model: 'slot',
			allowedJoins: [],
			defaultJoins: [],
		} );
	}
}
