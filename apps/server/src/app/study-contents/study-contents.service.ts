import { Injectable } from '@nestjs/common';
import { PrismaCrudService } from 'nestjs-prisma-crud';


@Injectable()
export class StudyContentsService extends PrismaCrudService{
	constructor(){
		super( {
			model: 'studyContent',
			allowedJoins: [],
			defaultJoins: [],
		} );
	}
}
