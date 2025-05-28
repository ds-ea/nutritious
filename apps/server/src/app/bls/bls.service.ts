import { Injectable } from '@nestjs/common';
import type { BLS } from '@nutritious/core';
import { JsxTranslatedCrudService } from '../core/services/jsx-translated-crud.service';


@Injectable()
export class BlsService extends JsxTranslatedCrudService<BLS>{
	constructor(){
		super( {
			model: 'bls',
			allowedJoins: [],
			defaultJoins: [],
		} );
	}
}
