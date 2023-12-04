import { Module } from '@nestjs/common';
import { CoreModule } from '../core/core.module';
import { StudyController } from './study.controller';
import { StudyService } from './study.service';


@Module( {
	imports: [ CoreModule ],
	controllers: [ StudyController ],
	providers: [ StudyService ],
} )
export class StudyModule{}
