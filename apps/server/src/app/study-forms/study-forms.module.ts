import { Module } from '@nestjs/common';
import { FormInputPresetsController } from './form-input-presets/form-input-presets.controller';
import { FormInputPresetsService } from './form-input-presets/form-input-presets.service';
import { StudyFormsController } from './study-forms.controller';
import { StudyFormsService } from './study-forms.service';


@Module( {
	controllers: [ StudyFormsController, FormInputPresetsController ],
	providers: [ StudyFormsService, FormInputPresetsService ],
} )
export class StudyFormsModule{}
