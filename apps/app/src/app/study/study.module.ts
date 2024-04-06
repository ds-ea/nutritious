import { NgModule } from '@angular/core';
import { SharedModule } from '../core/shared.module';
import { DashboardView } from './dashboard/dashboard.view';
import { StudyService } from './study.service';


@NgModule( {
	declarations: [
		DashboardView,
	],
	imports: [
		SharedModule,
	],
	exports: [
		DashboardView,
	],
	providers: [
		StudyService,
	],
} )
export class StudyModule{}
