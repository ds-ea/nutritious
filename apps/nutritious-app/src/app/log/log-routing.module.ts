import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LogView } from './log.view';
import { SummaryComponent } from './summary/summary.component';


const routes:Routes = [
	{ path: 'new', component: LogView },
	{ path: 'summary', component: SummaryComponent },
];

@NgModule( {
	           imports: [ RouterModule.forChild( routes ) ],
	           exports: [ RouterModule ],
           } )
export class LogRoutingModule{}
