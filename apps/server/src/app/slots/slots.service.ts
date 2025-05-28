import { Injectable } from '@nestjs/common';
import type { Slot } from '@nutritious/core';
import { JsxTranslatedCrudService } from '../core/services/jsx-translated-crud.service';


@Injectable()
export class SlotsService extends JsxTranslatedCrudService<Slot>{
	constructor(){
		super( {
			model: 'slot',
			allowedJoins: [],
			defaultJoins: [],
		} );
	}
}
