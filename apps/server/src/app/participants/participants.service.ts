import { Injectable } from '@nestjs/common';
import { PrismaCrudService } from 'nestjs-prisma-crud';


@Injectable()
export class ParticipantsService extends PrismaCrudService{
	constructor(){
		super( {
			model: 'participant',
			allowedJoins: [],
			defaultJoins: [],
		} );
	}
}
