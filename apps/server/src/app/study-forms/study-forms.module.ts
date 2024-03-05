import { Module } from '@nestjs/common';
import { StudyFormsController } from './study-forms.controller';
import { StudyFormsService } from './study-forms.service';


@Module( {
	controllers: [ StudyFormsController ],
	providers: [ StudyFormsService ],
} )
export class StudyFormsModule{}
