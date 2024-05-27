import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, Type } from '@angular/core';
import { AbstractControl, FormControl, FormControlOptions, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { ReplaySubject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { FormContent, FormInputConfigChoices, FormInputType, FormQuestion, FormResponseData, FormSetup, MatchedSlot, SafeStudyForm } from '../../../../../../../libs/core/src';
import { StepProgress, StepProgressState } from '../../slot/steps/abstract-step.component';
import { AbstractInput } from './inputs/abstract-input';
import { BinaryInput } from './inputs/binary.input';
import { ChoicesInput } from './inputs/choices.input';
import { NumberInput } from './inputs/number.input';
import { RatingInput } from './inputs/rating.input';
import { SliderInput } from './inputs/slider.input';
import { TextInput } from './inputs/text.input';


export type StudyFormSubmitResult = {
	data:FormResponseData,
	skippedOptionals:boolean
} | { error:string };


function emptyValue( control:AbstractControl ):boolean | undefined{
	if( !control )
		return undefined;

	if( control.value === null || control.value === undefined ){
		return true;
	}

	if( typeof control.value === 'string' ){
		return control.value.trim() === '';
	}

	if( Array.isArray( control.value ) ){
		return control.value.length === 0;
	}

	return false;
}


@Component( {
	selector: 'study-form',
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [
		//		{ provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'outline' } },
	],
	template: `
		<mat-card *ngIf="form?.setup">
			<mat-card-content>
				@if (form?.intro?.length) {
					<div class="intro">
						<markdown [data]="form?.intro || ''"></markdown>
					</div>
				}

				<section class="study-form" *ngIf="formGroup">
					<form [formGroup]="formGroup" (ngSubmit)="submit">

						@for (item of items; track item) {

							@if (item.type === 'content') {
								<div class="content">

									@if (item.content['plain']) {
										<markdown [data]="item.content['plain'].data || ''"></markdown>
									} @else if (item.content['md']) {
										<markdown [data]="item.content['md'].data || ''"></markdown>
									}
								</div>

							} @else if (item.type === 'question') {
								<div class="question" [ngClass]="[item._ctrl?.valid ? 'valid':'invalid', item._ctrl?.touched ? 'touched': '' ]">

									<label [id]="'inlbl-'+item.key" [for]="'in-'+item.key">{{ item.heading }}</label>

									<div *ngIf="item.description" class="description">{{ item.description }}</div>

									<ng-template *ngComponentOutlet="
												inputComponents[ item.input ] || TextInput;
												inputs: {
													item,
													formGroup,
													refs
													}
											" />

									<!--<mat-error *ngIf="!formGroup.controls[item.key].valid">{{ formGroup.controls[item.key].errors|json }}</mat-error>-->

								</div>
							}

						}
					</form>
				</section>

			</mat-card-content>
		</mat-card>
	`,
} )

export class StudyFormComponent implements OnInit, OnDestroy, OnChanges{
	private _destroyed$ = new ReplaySubject<boolean>( 1 );
	protected readonly TextInput = TextInput;

	@Input()
	form:SafeStudyForm | undefined;

	@Input()
	data?:FormResponseData;

	@Input()
	refs?:MatchedSlot['refs'];

	@Input()
	triggerValidation?:EventEmitter<boolean>;

	@Output()
	state = new EventEmitter<StepProgress>();

	@Output( 'submit' )
	_submit = new EventEmitter<StudyFormSubmitResult>();

	formSetup:FormSetup | undefined;
	formGroup:FormGroup | undefined;
	items:( FormContent | ( FormQuestion & { _ctrl?:AbstractControl } ) )[] | undefined;

	skippedOptionals = false;
	ignoreOptionalResponses = false;

	public inputComponents:Record<FormInputType, Type<AbstractInput> | undefined> = {
		[FormInputType.Text]: TextInput,
		[FormInputType.Slider]: SliderInput,
		[FormInputType.Number]: NumberInput,
		[FormInputType.Choices]: ChoicesInput,
		[FormInputType.Binary]: BinaryInput,
		[FormInputType.Rating]: RatingInput,
	};

	constructor(
		private cdr:ChangeDetectorRef,
		private alertController:AlertController,
		private translate:TranslateService,
	){ }

	ngOnInit(){
		this.triggerValidation
			?.pipe( takeUntil( this._destroyed$ ) )
			.subscribe( () => {
				const allValid = this.validateForm();
				if( allValid )
					this.submit();
			} );
	}

	public ngOnDestroy():void{
		this._destroyed$.next( true );
		this._destroyed$.unsubscribe();
	}


	public ngOnChanges( changes:SimpleChanges ):void{
		if( 'form' in changes ){
			this.applyForm( changes['form'].currentValue );
		}
	}

	_validateOptional( control:AbstractControl ):ValidationErrors | null{
		if( !emptyValue( control ) )
			return null;

		if( this.ignoreOptionalResponses )
			return null;

		return { should: 'FORM.QUESTION.SHOULD_HAVE_VALUE' };
	};

	private applyForm( form:SafeStudyForm ){
		this.formSetup = form?.setup;

		if( !this.formSetup ){
			this.state.next( { state: 'error' } );
			this._submit.next( { error: 'invalid form setup' } );
			return;
		}


		const questions = form.setup.items.filter( i => i.type === 'question' ) as FormQuestion[];

		const controls:Record<string, AbstractControl> = {};
		for( const question of questions ){

			const validators:FormControlOptions['validators'] = [];
			if( question.required === 'must' )
				validators.push( Validators.required );
			else if( question.required === 'should' )
				validators.push( this._validateOptional.bind( this ) );


			const arrayBehavior:'array' | 'boolKeys' = 'array';
			const valueIsArray = question.input === 'choices';

			if( valueIsArray && ( <FormInputConfigChoices> question.config )?.limit != 1 ){
				const groupOptions = ( <FormInputConfigChoices> question.config )?.options || [];
				const groupValues = this.data?.answers?.[question.key] ?? [];

				if( arrayBehavior === 'array' ){
					controls[question.key] = new FormControl(
						groupValues,
						{ validators },
					);

				}else{
					const groupControls:Record<string, AbstractControl> = {};
					for( const opt of groupOptions )
						groupControls[opt.value] = new FormControl();

					controls[question.key] = new FormGroup(
						groupControls,
						{ validators },
					);
				}

			}else{
				controls[question.key] = new FormControl(
					this.data?.answers?.[question.key] ?? '',
					{ validators },
				);
			}


		}

		this.formGroup = new FormGroup( controls );
		this.formGroup.statusChanges
			.pipe(
				takeUntil( this._destroyed$ ),
				debounceTime( 50 ),
			)
			.subscribe( status => {
				this.updateState();
			} );

		this.formGroup.valueChanges
			.pipe(
				takeUntil( this._destroyed$ ),
				debounceTime( 50 ),
			)
			.subscribe( data => {

			} );


		// just for easier access to the form control
		this.items = this.formSetup?.items.map( item => ( {
			_ctrl: item.type === 'question' ? this.formGroup?.controls[item.key] : undefined,
			...item,
		} ) );

	}

	private updateState(){
		let state:StepProgressState = 'pending';

		if( !this.formGroup )
			return this.state.next( { state } );

		if( this.formGroup.touched )
			state = 'incomplete';

		if( this.formGroup.status === 'VALID' ){
			state = this.skippedOptionals ? 'done-with-skips' : 'done';

		}else{
			state = 'error';
		}

		this.state.next( { state } );

	}


	private processOptionals():boolean | undefined{
		if( !this.formGroup?.controls || !this.items )
			return;


		// check whether we only have invalid fields which could be skipped
		let hasInvalidOthers = false;
		let hasInvalidOptionals = false;

		for( const item of this.items ){
			if( item.type === 'content' )
				continue;

			if( item.required === 'ignore' )
				continue;

			if( item.required === 'should' && emptyValue( item._ctrl! ) )
				hasInvalidOptionals = true;

			else if( !item._ctrl?.valid )
				hasInvalidOthers = true;
		}

		this.skippedOptionals = hasInvalidOptionals && !hasInvalidOthers;

		if( this.skippedOptionals && !this.ignoreOptionalResponses ){
			this.alertController.create( {
				message: this.translate.instant( 'FORM.MSG_CONFIRM_SKIP_OPTIONALS' ),
				cssClass: 'center-buttons',
				buttons: [
					{ text: this.translate.instant( 'FORM.BTN_CONTINUE_EDIT' ), role: 'cancel' },
					{ text: this.translate.instant( 'FORM.BTN_SKIP_OPTIONALS' ), cssClass: 'warn' },
				],
			} ).then( alert => {
				alert.onDidDismiss().then( result => {
					if( result.role === 'cancel' )
						return;

					this.ignoreOptionalResponses = true;
					const allValid = this.validateForm();
					if( allValid )
						this.submit();

				} );
				alert.present();
			} );
			return;
		}

		return true;
	}

	private validateForm(){
		if( !this.formGroup?.controls || !this.items )
			return;

		if( !this.processOptionals() )
			return;


		for( const [ key, ctrl ] of Object.entries( this.formGroup?.controls ) ){
			ctrl.markAllAsTouched();
			//				ctrl.markAsDirty();
			ctrl.updateValueAndValidity( {} );
		}

		this.cdr.markForCheck();

		return true;
	}


	public submit(){
		if( this.formGroup?.invalid )
			return;

		this._submit.next( {
			data: { answers: this.formGroup?.value },
			skippedOptionals: this.skippedOptionals,
		} );
	}

}

