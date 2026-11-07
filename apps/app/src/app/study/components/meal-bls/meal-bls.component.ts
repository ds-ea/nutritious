import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSelectionListChange } from '@angular/material/list';
import { ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { addMinutes, formatISO } from 'date-fns';
import { Dayjs } from 'dayjs';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BLSAttendanceOption, BLSMealItem, BLSMealType, MealBLSResponseData, SafeStudyForm } from '../../../../../../../libs/core/src';
import { CoreService } from '../../../core/core.service';
import { StepProgress } from '../../slot/steps/abstract-step.component';


export type MealBLSSubmitResult = {
	data:MealBLSResponseData,
};



@Component( {
    selector: 'meal-bls',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
		<form [formGroup]="mealForm" (ngSubmit)="submit" autocomplete="off">
			<mat-accordion class="accordion-desc-right">

				<mat-expansion-panel [expanded]="formStep === 0" (opened)="showControl(0)" hideToggle>
					<mat-expansion-panel-header>
						<mat-panel-title>{{ 'LOG.MEAL.MEAL_LBL' | translate }}</mat-panel-title>
						<mat-panel-description *ngIf="mealForm.get( 'meal' )?.value">
							{{
								!isKnownMealType(mealForm.get('meal')?.value) ? (mealForm.get('meal')?.value | titlecase) : (('ENUM.MEAL_TYPE.' + mealForm.get('meal')?.value) | uppercase | translate)
							}}
						</mat-panel-description>
					</mat-expansion-panel-header>
					@if (mealSelection !== 'slot') {
						<mat-selection-list [multiple]="false" (selectionChange)="selectMeal($event)">
							<mat-list-option *ngFor="let mealType of mealTypes" [value]="mealType" [selected]="mealType === mealForm.get( 'meal' )?.value">
								{{ !isKnownMealType(mealType) ? (mealType | titlecase) : (('ENUM.MEAL_TYPE.' + mealType) | uppercase | translate) }}
							</mat-list-option>
						</mat-selection-list>
					}
				</mat-expansion-panel>

				<mat-expansion-panel [expanded]="formStep === 1" (opened)="showControl(1)" hideToggle>
					<mat-expansion-panel-header>
						<mat-panel-title>{{ 'LOG.MEAL.DATE_LBL' | translate }}</mat-panel-title>
						<mat-panel-description>{{ mealForm.get('date')?.value | dfnsParseIso | dfnsFormatRelative : now }}</mat-panel-description>
					</mat-expansion-panel-header>

					@if (dateSelection === 'locked') {

					} @else {
						<ion-datetime formControlName="date"
									  [max]="maxDate"
									  [locale]="core.currentLocale"
									  [presentation]="
										    dateSelection === 'date' ? 'date'
										  : dateSelection === 'time' ? 'time'
										  : 'date-time'
										 "
						>
							<span slot="time-label">{{ 'STUDY.LBL_TIME' | translate }}</span>
						</ion-datetime>
					}

					<div class="step-actions">
						<a mat-flat-button color="accent" (click)="nextControl()">{{ 'GENERIC.CONFIRM_BTN' | translate }}</a>
					</div>
				</mat-expansion-panel>

				<mat-expansion-panel [expanded]="formStep === 2" (opened)="showControl(2)" hideToggle>
					<mat-expansion-panel-header>
						<mat-panel-title>{{ 'LOG.MEAL.ATTEND_LBL' | translate }}</mat-panel-title>
						<mat-panel-description *ngIf="selectedAttendance">{{ ('ENUM.MEAL_ATTEND.' + selectedAttendance[0]) | uppercase | translate }}</mat-panel-description>
					</mat-expansion-panel-header>
					<mat-selection-list [multiple]="false" (selectionChange)="selectAttendance($event)">
						<mat-list-option *ngFor="let attendOption of attendanceOptions" [value]="attendOption" [selected]="attendOption[1] === mealForm.get( 'attend' )?.value">
							{{ ('ENUM.MEAL_ATTEND.' + attendOption[0]) | uppercase | translate }}
						</mat-list-option>
					</mat-selection-list>
				</mat-expansion-panel>

				<mat-expansion-panel
					[expanded]="formStep === 3" (opened)="showControl(3)" hideToggle
					class="log-meal-food-panel"
				>
					<mat-expansion-panel-header>
						<mat-panel-title>{{ 'LOG.MEAL.FOOD_LBL' | translate }}</mat-panel-title>
						<mat-panel-description></mat-panel-description>
					</mat-expansion-panel-header>
					<app-food-list [(mealItems)]="mealItems" [focusSearch]="focusSearch"></app-food-list>
				</mat-expansion-panel>

			</mat-accordion>

			<!--<footer class="log-footer">
				<button mat-flat-button color="primary" [disabled]="mealLogForm.invalid || !mealItems.length"
						type="submit"
				>{{ 'GENERIC.CONTINUE_BTN' | translate }}
				</button>
			</footer>-->
		</form>

	`,
    standalone: false
} )
export class MealBlsComponent implements OnInit{


	private _destroyed$ = new ReplaySubject<boolean>( 1 );

	@Input()
	form:SafeStudyForm | undefined;

	@Input()
	data?:MealBLSResponseData;

	@Input()
	triggerValidation?:EventEmitter<boolean>;

	@Output()
	state = new EventEmitter<StepProgress>();

	@Output( 'submit' )
	_submit = new EventEmitter<MealBLSSubmitResult>();

	@Input()
	meal:string | undefined;

	@Input()
	mealSelection:string | undefined;

	@Input()
	dateSelection:string | undefined;

	@Input()
	entryDate?:Dayjs;


	public formStep = 0;

	public now = new Date();
	public maxDate = formatISO( addMinutes( new Date(), 20 ) );

	public knownMealTypes:string[] = Object.values( BLSMealType );
	public mealTypes:( BLSMealType | string )[] = Object.values( BLSMealType );
	public attendanceOptions = Object.entries( BLSAttendanceOption );

	public mealForm = new UntypedFormGroup( {
		date: new UntypedFormControl( '', Validators.required ),
		meal: new UntypedFormControl( '', Validators.required ),
		attend: new UntypedFormControl( '', Validators.required ),
	} );

	public mealItems:BLSMealItem[] = [];

	public focusSearch = new Subject<any>();

	public selectedAttendance:[ string, number ] | undefined;


	constructor(
		public core:CoreService,
		public translate:TranslateService,
		public toastController:ToastController,
		private cdr:ChangeDetectorRef,
	){ }



	ngOnInit():void{

		const allowMealTypeFromSlotKey = this.mealSelection?.length ? [ 'allow', 'slot' ].includes( this.mealSelection ) : false;

		if( this.meal && allowMealTypeFromSlotKey )
			if( !this.mealTypes.includes( this.meal ) )
				this.mealTypes.push( this.meal );

		this.mealForm.patchValue( {
			date: this.entryDate?.toISOString() || formatISO( new Date() ),
			meal: this.meal && allowMealTypeFromSlotKey ? this.meal : '',
			attend: undefined,
		} );

		if( this.mealSelection === 'slot' )
			this.formStep = 1;

		if( this.dateSelection === 'locked' && this.formStep === 1 )
			this.formStep = 2;

		if( this.dateSelection ){
			if( this.dateSelection === 'time' ){

			}
		}



		this.triggerValidation
			?.pipe( takeUntil( this._destroyed$ ) )
			.subscribe( () => {
				const allValid = this.validate();
				if( allValid )
					this.submit();
			} );

	}

	public showControl( index:number ){
		this.formStep = index;
		if( this.formStep === 3 ){
			this.focusSearch.next( true );
		}
	}

	public nextControl(){
		this.formStep += 1;

		if( this.formStep === 1 && this.dateSelection === 'locked' )
			this.formStep += 1;

	}

	public selectMeal( change:MatSelectionListChange ){
		this.mealForm.patchValue( { meal: change.options[0]?.value } );
		this.nextControl();
	}

	public selectAttendance( change:MatSelectionListChange ){
		this.selectedAttendance = change.options[0]?.value;
		if( !this.selectedAttendance )
			return;

		this.mealForm.patchValue( { attend: this.selectedAttendance[1] } );
		this.nextControl();
	}

	private validate(){
		if( !this.mealForm?.controls )
			return;

		for( const [ key, ctrl ] of Object.entries( this.mealForm?.controls ) ){
			ctrl.markAllAsTouched();
			ctrl.updateValueAndValidity( {} );
		}

		this.cdr.markForCheck();

		if( !this.mealItems.length )
			return;


		return true;
	}


	public submit(){
		if( !this.validate() )
			return;


		this._submit.next( {
			data: {
				meal: this.mealForm.value,
				items: this.mealItems,
			},
		} );
	}

	public isKnownMealType( mealType:BLSMealType | string ){
		return this.knownMealTypes.includes( mealType );
	}
}
