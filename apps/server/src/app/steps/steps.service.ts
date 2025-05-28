import { Injectable } from '@nestjs/common';

import type { Step } from '@nutritious/core';
import { JsxTranslatedCrudService } from '../core/services/jsx-translated-crud.service';


@Injectable()
export class StepsService extends JsxTranslatedCrudService<Step>{
	constructor(){
		super( {
			model: 'step',
			allowedJoins: [],
			defaultJoins: [],
		} );
	}
}
