import { Injectable } from '@nestjs/common';
import { PrismaCrudService } from 'nestjs-prisma-crud';


@Injectable()
export class SlotsService extends PrismaCrudService{
	constructor(){
		super( {
			model: 'slot',
			allowedJoins: [],
			defaultJoins: [],
		} );
	}
}
