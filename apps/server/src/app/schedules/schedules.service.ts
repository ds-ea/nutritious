import { Injectable } from '@nestjs/common';
import { PrismaCrudService } from 'nestjs-prisma-crud';


@Injectable()
export class SchedulesService extends PrismaCrudService{
	constructor(){
		super( {
			model: 'schedule',
			allowedJoins: [],
			defaultJoins: [],
		} );
	}
}
