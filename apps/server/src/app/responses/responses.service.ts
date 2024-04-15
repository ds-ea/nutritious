import { Injectable } from '@nestjs/common';
import { StudyResponse } from '@nutritious/core';
import { JsxTranslatedCrudService } from '../core/services/jsx-translated-crud.service';


@Injectable()
export class ResponsesService extends JsxTranslatedCrudService<StudyResponse>{
	constructor(){
		super( {
			model: 'studyResponse',
			allowedJoins: [ 'member' ],
			defaultJoins: [ 'member' ],
		} );
	}
}
