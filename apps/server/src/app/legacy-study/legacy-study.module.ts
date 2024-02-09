import { Module } from '@nestjs/common';
import { CoreModule } from '../core/core.module';
import { LegacyStudyController } from './legacy-study.controller';
import { LegacyStudyService } from './legacy-study.service';


@Module( {
	imports: [ CoreModule ],
	controllers: [ LegacyStudyController ],
	providers: [ LegacyStudyService ],
} )
export class LegacyStudyModule{}
