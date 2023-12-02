import { NgModule } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';
import { MatLegacySliderModule as MatSliderModule } from '@angular/material/legacy-slider';
import { DateFnsModule } from 'ngx-date-fns';
import { SharedModule } from '../core/shared.module';

import { LogRoutingModule } from './log-routing.module';
import { LogView } from './log.view';
import { LogMealComponent } from './meal/log-meal.component';
import { LogQuestionsComponent } from './questions/log-questions.component';
import { SummaryComponent } from './summary/summary.component';
import { FoodPickerComponent } from './meal/food/food-picker.component';
import { FoodListComponent } from './meal/food/food-list.component';
import { FoodListMealItemEditorComponent } from './meal/food/food-list-meal-item-editor.component';
import { QuestionSliderComponent } from './questions/components/question-slider.component';


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
