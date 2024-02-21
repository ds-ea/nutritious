import { Injectable } from '@nestjs/common';
import { PrismaCrudService } from 'nestjs-prisma-crud';


@Injectable()
export class StepsService extends PrismaCrudService{
	constructor(){
		super( {
			model: 'step',
			allowedJoins: [],
			defaultJoins: [],
		} );
	}
}
