import { NgModule } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatAccordion, MatExpansionModule, MatExpansionPanel, MatExpansionPanelHeader } from '@angular/material/expansion';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { RouterModule, Routes } from '@angular/router';
import { DateFnsModule } from 'ngx-date-fns';
import { MarkdownComponent } from 'ngx-markdown';
import { SharedModule } from '../core/shared.module';
import { BinaryInput } from './components/form/inputs/binary.input';
import { ChoicesInput } from './components/form/inputs/choices.input';
import { NumberInput } from './components/form/inputs/number.input';
import { RatingInput } from './components/form/inputs/rating.input';
import { SliderInput } from './components/form/inputs/slider.input';
import { TextInput } from './components/form/inputs/text.input';
import { StudyFormComponent } from './components/form/study-form.component';
import { FoodListMealItemEditorComponent } from './components/meal-bls/food/food-list-meal-item-editor.component';
import { FoodListComponent } from './components/meal-bls/food/food-list.component';
import { FoodPickerComponent } from './components/meal-bls/food/food-picker.component';
import { MealBlsComponent } from './components/meal-bls/meal-bls.component';
import { DashboardView } from './dashboard/dashboard.view';
import { SlotView } from './slot/slot.view';
import { StepContentComponent } from './slot/steps/step-content.component';
import { StepFormComponent } from './slot/steps/step-form.component';
import { StepMealBlsComponent } from './slot/steps/step-meal-bls.component';
import { StudyService } from './study.service';


const routes:Routes = [
	{
		path: 'study',

		children: [
			{
				path: '', pathMatch: 'full',
				component: DashboardView,
			},
			{
				path: 'slot/:studyId/:slotId',
				component: SlotView,
			},
		],
	},
];


@NgModule( {
	declarations: [
		DashboardView,
		SlotView,

		StepContentComponent,
		StepFormComponent,
		StepMealBlsComponent,

		FoodListComponent,
		FoodListMealItemEditorComponent,
		FoodPickerComponent,
		MealBlsComponent,

		TextInput,
		NumberInput,
		BinaryInput,
		SliderInput,
		ChoicesInput,
		RatingInput,
		StudyFormComponent,

	],
	imports: [
		SharedModule,
		RouterModule.forChild( routes ),
		MarkdownComponent,
		MatExpansionPanelHeader,
		MatExpansionPanel,
		MatAccordion,

		DateFnsModule,

		MatExpansionModule,
		MatSliderModule,
		MatButtonToggleModule,
		MatCheckboxModule,
		MatRadioModule,
		MatSelectModule,
		MatSlideToggleModule,
	],
	exports: [
		DashboardView,
	],
	providers: [
		StudyService,

	],
} )
export class StudyModule{}
