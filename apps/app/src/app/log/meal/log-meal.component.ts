import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSelectionListChange } from '@angular/material/list';
import { ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { addMinutes, formatISO, parseISO } from 'date-fns';
import { Subject } from 'rxjs';
import { AttendanceOption, LogEntry, MealItem, MealType } from '../../../interfaces/log.interface';
import { CoreService } from '../../core/core.service';


@Component( {
	selector: 'log-meal',
	template: `
					<form [formGroup]="mealLogForm" (ngSubmit)="confirmStep()" autocomplete="off">
						<mat-accordion class="accordion-desc-right">

							<mat-expansion-panel [expanded]="formStep === 0" (opened)="showControl(0)" hideToggle>
								<mat-expansion-panel-header>
									<mat-panel-title>{{'LOG.MEAL.DATE_LBL' | translate}}</mat-panel-title>
									<mat-panel-description>{{ mealLogForm.get( 'date' )?.value | dfnsParseIso | dfnsFormatRelativePure : now }}</mat-panel-description>
								</mat-expansion-panel-header>
								<ion-datetime formControlName="date"
											  [max]="maxDate"
											  [locale]="core.currentLocale"
								></ion-datetime>

								<div class="step-actions">
									<button mat-flat-button color="accent" (click)="nextControl()">{{'GENERIC.CONFIRM_BTN' | translate}}</button>
								</div>
							</mat-expansion-panel>

							<mat-expansion-panel [expanded]="formStep === 1" (opened)="showControl(1)" hideToggle>
								<mat-expansion-panel-header>
									<mat-panel-title>{{'LOG.MEAL.MEAL_LBL' | translate}}</mat-panel-title>
									<mat-panel-description *ngIf="mealLogForm.get( 'meal' )?.value">{{( 'ENUM.MEAL_TYPE.' + mealLogForm.get( 'meal' )?.value ) | uppercase | translate}}</mat-panel-description>
								</mat-expansion-panel-header>
								<mat-selection-list [multiple]="false" (selectionChange)="selectMeal($event)">
									<mat-list-option *ngFor="let mealType of mealTypes" [value]="mealType" [selected]="mealType === mealLogForm.get( 'meal' )?.value">
										{{( 'ENUM.MEAL_TYPE.' + mealType ) | uppercase | translate}}
									</mat-list-option>
								</mat-selection-list>
							</mat-expansion-panel>

							<mat-expansion-panel [expanded]="formStep === 2" (opened)="showControl(2)" hideToggle>
								<mat-expansion-panel-header>
									<mat-panel-title>{{'LOG.MEAL.ATTEND_LBL' | translate}}</mat-panel-title>
									<mat-panel-description *ngIf="selectedAttendance">{{( 'ENUM.MEAL_ATTEND.' + selectedAttendance[ 0 ] ) | uppercase | translate}}</mat-panel-description>
								</mat-expansion-panel-header>
								<mat-selection-list [multiple]="false" (selectionChange)="selectAttendance($event)">
									<mat-list-option *ngFor="let attendOption of attendanceOptions" [value]="attendOption" [selected]="attendOption[1] === mealLogForm.get( 'attend' )?.value">
										{{( 'ENUM.MEAL_ATTEND.' + attendOption[ 0 ] ) | uppercase | translate}}
									</mat-list-option>
								</mat-selection-list>
							</mat-expansion-panel>

							<mat-expansion-panel
									[expanded]="formStep === 3" (opened)="showControl(3)" hideToggle
									class="log-meal-food-panel"
							>
								<mat-expansion-panel-header>
									<mat-panel-title>{{'LOG.MEAL.FOOD_LBL' | translate}}</mat-panel-title>
									<mat-panel-description></mat-panel-description>
								</mat-expansion-panel-header>
								<app-food-list [(mealItems)]="mealItems" [focusSearch]="focusSearch"></app-food-list>
							</mat-expansion-panel>

						</mat-accordion>

						<footer class="log-footer">
							<button mat-flat-button color="primary" [disabled]="mealLogForm.invalid || !mealItems.length"
									type="submit"
							>{{'GENERIC.CONTINUE_BTN' | translate}}</button>
						</footer>
					</form>

	            `,
	styles: [],
	changeDetection: ChangeDetectionStrategy.OnPush,
} )
export class LogMealComponent implements OnInit{
	public formStep = 0;

	public now = new Date();
	public maxDate = formatISO( addMinutes( new Date(), 20 ) );

	public mealTypes = Object.values( MealType );
	public attendanceOptions = Object.entries( AttendanceOption );

	public mealLogForm = new UntypedFormGroup( {
		date: new UntypedFormControl( '', Validators.required ),
		meal: new UntypedFormControl( '', Validators.required ),
		attend: new UntypedFormControl( '', Validators.required ),
	} );

	public mealItems:MealItem[] = [];

	public focusSearch = new Subject<any>();


	@Input() log:LogEntry | undefined;
	@Output() done = new EventEmitter<LogEntry | undefined>();

	constructor(
		public core:CoreService,
		public translate:TranslateService,
		public toastController:ToastController,
	){ }

	public selectedAttendance:[ string, number ] | undefined;


	ngOnInit():void{
		const now = new Date();
		this.mealLogForm.patchValue( {
			date: formatISO( now ),
			meal: '',
			attend: undefined,
		} );
	}

	public confirmStep(){
		if( this.mealLogForm.invalid )
			return;

		if( !this.mealItems?.length )
			return;

		this.log!.meal = this.mealLogForm.getRawValue() as LogEntry['meal'];

		const maxDate = addMinutes( new Date(), 20 );
		if( parseISO( this.log!.meal!.date ) > maxDate ){
			this.toastController.create( {
				color: 'danger',
				message: this.translate.instant( 'LOG.MEAL.FUTURE_DATE_ERROR' ),
				duration: 3000,
			} ).then( toast => toast.present() );
			return;
		}

		this.log!.food = this.mealItems;

		this.done.next( this.log );
	}



	public showControl( index:number ){
		this.formStep = index;
		if( this.formStep === 3 ){
			this.focusSearch.next( true );
		}
	}

	public nextControl(){
		this.formStep += 1;
	}

	public selectMeal( change:MatSelectionListChange ){
		this.mealLogForm.patchValue( { meal: change.options[0]?.value } );
		this.nextControl();
	}

	public selectAttendance( change:MatSelectionListChange ){
		this.selectedAttendance = change.options[0]?.value;
		if( !this.selectedAttendance )
			return;

		this.mealLogForm.patchValue( { attend: this.selectedAttendance[1] } );
		this.nextControl();
	}

}
