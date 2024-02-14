import { NgModule } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { DateFnsModule } from 'ngx-date-fns';
import { SharedModule } from '../core/shared.module';

import { LogRoutingModule } from './log-routing.module';
import { LogView } from './log.view';
import { FoodListMealItemEditorComponent } from './meal/food/food-list-meal-item-editor.component';
import { FoodListComponent } from './meal/food/food-list.component';
import { FoodPickerComponent } from './meal/food/food-picker.component';
import { LogMealComponent } from './meal/log-meal.component';
import { QuestionSliderComponent } from './questions/components/question-slider.component';
import { LogQuestionsComponent } from './questions/log-questions.component';
import { SummaryComponent } from './summary/summary.component';


@NgModule( {
	declarations: [
		LogView,
		SummaryComponent,

		LogMealComponent,
		FoodPickerComponent,
		FoodListComponent,
		FoodListMealItemEditorComponent,

		LogQuestionsComponent,
		QuestionSliderComponent,
	],
	imports: [
		SharedModule,
		LogRoutingModule,
		DateFnsModule,

		MatExpansionModule,
		MatSliderModule,
		MatButtonToggleModule,
		MatCheckboxModule,
		MatRadioModule,
		MatSelectModule,
		MatSlideToggleModule,
	],
	exports: [],

} )
export class LogModule{}
