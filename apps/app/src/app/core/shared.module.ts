import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { DateFnsModule } from 'ngx-date-fns';



@NgModule( {
	declarations: [],
	imports: [
		TranslateModule.forChild(),
	],
	exports: [
		CommonModule,
		TranslateModule,
		DateFnsModule,

		FormsModule,
		ReactiveFormsModule,
		ScrollingModule,

		IonicModule,

		MatButtonModule,
		MatCardModule,
		MatFormFieldModule,
		MatIconModule,
		MatInputModule,
		MatListModule,
	],
	providers: [
		//      ApiService,
		//      CoreService
	],
} )
export class SharedModule{}
