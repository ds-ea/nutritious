import { NgModule } from '@angular/core';
import { SharedModule } from '../core/shared.module';

import { StudyRoutingModule } from './study-routing.module';
import { DashboardView } from './dashboard/dashboard.view';
import { StudyService } from './study.service';


@NgModule( {
	           declarations: [
		           DashboardView,
	           ],
	           imports: [
		           SharedModule,
		           StudyRoutingModule,
	           ],
	           providers: [
		           StudyService,
	           ],
           } )
export class StudyModule{}
