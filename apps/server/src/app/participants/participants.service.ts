import { Injectable } from '@nestjs/common';
import type { Participant } from '@nutritious/core';
import { JsxTranslatedCrudService } from '../core/services/jsx-translated-crud.service';


@Injectable()
export class ParticipantsService extends JsxTranslatedCrudService<Participant>{
	constructor(){
		super( {
			model: 'participant',
			allowedJoins: [],
			defaultJoins: [],
		} );
	}
}
