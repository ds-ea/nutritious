import { Injectable } from '@nestjs/common';
import { JsxTranslatedCrudService } from '../core/services/jsx-translated-crud.service';


@Injectable()
export class ParticipantsService extends JsxTranslatedCrudService{
	constructor(){
		super( {
			model: 'participant',
			allowedJoins: [],
			defaultJoins: [],
		} );
	}
}
