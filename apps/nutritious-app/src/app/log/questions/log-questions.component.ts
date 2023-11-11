import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, UntypedFormArray, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Preferences } from '@capacitor/preferences';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { format, isAfter, isBefore, parseISO, set as setFNS } from 'date-fns';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LogEntry } from '../../../interfaces/log.interface';
import { StudyCatalog, StudyCatalogQuestion, StudyCatalogQuestionConfigBinary, StudyCatalogQuestionConfigSlider, StudyCatalogQuestionGroup, StudyCatalogQuestionTranslatableKey, StudyCatalogQuestionType } from '../../../interfaces/study.interface';


@Component( {
	            selector: 'log-questions',
	            changeDetection: ChangeDetectionStrategy.OnPush,
	            template: `
					<ion-spinner *ngIf="busy"></ion-spinner>

					<form *ngIf="!busy"
						  autocomplete="off"
						  [formGroup]="questionsForm"
						  (ngSubmit)="confirmStep()"
					>
						<header class="log-header">
							<ion-note>{{'LOG.QUESTIONS.ANSWER_ALL_QUESTIONS_EXPLAIN' | translate}}</ion-note>
						</header>

						<div *ngIf="catalog">

							<section *ngFor="let group of activeGroups"
									 [formGroupName]="group.key"
							>

									<div *ngFor="let question of group.questions"
										 class="question"
									>
										<label class="question-text"
											   [attr.for]="'in_'+group.key+'_'+ question.key"
											   [class.invalid]="triedToSubmit && questionsForm.get([group.key,question.key])?.invalid"
											   [class.valid]="questionsForm.get([group.key,question.key])?.valid"
										>{{ translatedQuestion( question ) }}</label>

										<div class="control" [ngSwitch]="question.type">
											<ng-template [ngSwitchCase]="StudyCatalogQuestionType.Slider">
												<mat-slider
														[id]="group.key+'_'+question.key"
														[formControlName]="question.key"
														[min]="question.config.min"
														[max]="question.config.max"
												></mat-slider>
												<div class="slider-labels">
													<span class="min">{{ question.config[ 'minLabel' ] }}</span>
													<span class="max">{{ question.config[ 'maxLabel' ] }}</span>
												</div>
											</ng-template>

											<ng-template [ngSwitchCase]="StudyCatalogQuestionType.Binary">
												<mat-radio-group [formControlName]="question.key" class="binary-control">
													<mat-radio-button value="0" labelPosition="before" class="no">{{ question.config[ 'noLabel' ] }}</mat-radio-button>
													<mat-radio-button value="1" labelPosition="after" class="yes">{{ question.config[ 'yesLabel' ] }}</mat-radio-button>
												</mat-radio-group>
											</ng-template>

											<ng-template [ngSwitchCase]="StudyCatalogQuestionType.Text">
												<ng-container [ngSwitch]="question.config['type']">
													<mat-form-field>
														<textarea *ngSwitchCase="'text'"
																  matInput [formControlName]="question.key"></textarea>

														<input *ngSwitchDefault
															   matInput [formControlName]="question.key" />
													</mat-form-field>
												</ng-container>

												<ion-note class="explain" *ngIf="question.config['explain']">{{ question.config[ 'explain' ] }}</ion-note>
											</ng-template>

											<ng-template [ngSwitchCase]="StudyCatalogQuestionType.Choices">
												<div class="choices-control">
													<ng-container *ngIf="question.config['limit'] == 1 ; else multipleChoice">
														<mat-radio-group [formControlName]="question.key">
															<mat-radio-button *ngFor="let choice of question.choices"
																			  [value]="choice.value"
															>{{ choice.label }}</mat-radio-button>
														</mat-radio-group>
													</ng-container>

													<ng-template #multipleChoice>
														<div class="checkbox-group">
															<!--<mat-checkbox
																	[value]="choice.value"
																	*ngFor="let choice of question.choices ; let i = index"
																	[formArrayName]="question.key"

															>{{ choice.label }}</mat-checkbox>-->
															<ng-container *ngFor="let choice of question.choices ; let i = index"
																		  [formArrayName]="question.key"
															>
																<mat-checkbox
																		[value]="choice.value"
																		[formControlName]="i"
																>{{ choice.label }}</mat-checkbox>
															</ng-container>
														</div>
													</ng-template>
												</div>
											</ng-template>

											<ng-template ngSwitchDefault>
												<mat-form-field>
													<input matInput [formControlName]="question.key" />
												</mat-form-field>
											</ng-template>

										</div>

									</div>

							</section>

						</div>

						<footer class="log-footer">
							<button mat-flat-button
									type="submit"
									[color]="questionsForm.valid ? 'primary' : 'warn'"
									[class.mat-button-disabled]="questionsForm.invalid"
							>{{'GENERIC.CONTINUE_BTN' | translate}}</button>
						</footer>
					</form>
	            `,
            } )
export class LogQuestionsComponent implements OnInit, OnDestroy{
	public StudyCatalogQuestionType = StudyCatalogQuestionType;

	public startOfDayHours = 4;

	private _destroyed$ = new ReplaySubject<boolean>( 1 );

	public busy = false;
	private loader!:HTMLIonLoadingElement;
	public langKey:string;

	public questionsForm = new UntypedFormGroup( {} );
	public triedToSubmit = false;

	@Input() catalog:StudyCatalog | undefined;
	public activeGroups:StudyCatalogQuestionGroup[] = [];


	@Input() log:LogEntry | undefined;
	@Output() done = new EventEmitter<LogEntry|undefined>();



	constructor(
		public translate:TranslateService,
		public loading:LoadingController,
		public toastController:ToastController,
		public alertController:AlertController,
		public cdr:ChangeDetectorRef,
	){
		this.langKey = this.translate.currentLang;
		this.translate.onLangChange.pipe( takeUntil( this._destroyed$ ) )
			.subscribe( change => this.langKey = change.lang );
	}

	public ngOnDestroy():void{
		this._destroyed$.next( true );
		this._destroyed$.unsubscribe();
	}

	async ngOnInit(){
		this.loader = await this.loading.create( { spinner: 'crescent' } );
		this.prepCatalog();
	}


	public async prepCatalog(){
		this.busy = true;
		this.cdr.markForCheck();
		//		await this.loader.present();

		const now = new Date();
		const todayDate = format( now, 'yyyy-MM-dd' );
		const todayTime = +format( now, 'Hmm' );
		const stillYesterday = setFNS( now, { hours: this.startOfDayHours } );

		const previousAnswerMeta = await Preferences.get( { key: 'questions-last-answer' } );
		const previousAnswer:any = ( previousAnswerMeta?.value ? JSON.parse( previousAnswerMeta.value ) : undefined );
		const previousAnswerDate:Date | undefined = previousAnswer?.date ? parseISO( previousAnswer.date ) : undefined;

		const answeredDate:string | undefined = previousAnswerDate ? format( previousAnswerDate, 'yyyy-MM-dd' ) : undefined;
		const answeredTime:number | undefined = previousAnswerDate ? +format( previousAnswerDate, 'Hmm' ) : undefined;
		const answeredToday = answeredDate === todayDate;

		let questionCount = 0;

		if( this.catalog?.groups?.length )
			for( const [ groupNum, group ] of Object.entries( this.catalog.groups ) ){
				group.key = group.key || 'group-' + groupNum;

				if( group[ 'askafter-enabled' ] && group[ 'askafter-time' ]?.length === 5 ){
					const [ hours, minutes ] = group[ 'askafter-time' ].split( ':' );
					const askAfter = setFNS( now, { hours: +hours, minutes: +minutes } );
					const askAfterTime = +format( askAfter, 'Hmm' );

					if( isBefore( now, askAfter ) && isAfter( now, stillYesterday ) ) // skip groups which we're not supposed to ask yet
						continue;

					if( answeredToday && answeredTime && answeredTime >= askAfterTime ) // skip groups which were asked already (today)
						continue;
				}

				const formGroup = new UntypedFormGroup( {} );
				this.questionsForm.addControl( group.key, formGroup );

				this.activeGroups.push( group );
				for( const q of group.questions ){
					questionCount++;

					let defaultValue = undefined;
					let control:any;
					let validators = [ Validators.required ];

					if( q.type === StudyCatalogQuestionType.Slider ){
						q.config = <StudyCatalogQuestionConfigSlider> {
							step: 1,
							min: 1,
							max: 5,
							minLabel: this.translate.instant( 'LOG.QUESTIONS.SLIDER.MIN_LBL' ),
							maxLabel: this.translate.instant( 'LOG.QUESTIONS.SLIDER.MAX_LBL' ),
							...q.config || {},
						};

						//						defaultValue = Math.round( (q.config.max - q.config.min + q.config.step) / 2)

					}else if( q.type === StudyCatalogQuestionType.Binary ){
						q.config = <StudyCatalogQuestionConfigBinary> {
							noLabel: this.translate.instant( 'LOG.QUESTIONS.BINARY.NO_LBL' ),
							yesLabel: this.translate.instant( 'LOG.QUESTIONS.BINARY.YES_LBL' ),
							...q.config || {},
						};


					}else if( q.type === StudyCatalogQuestionType.Choices ){
						// the current api sometimes makes this happen
						if( !Array.isArray( q.choices ) && typeof q.choices === 'object' )
							q.choices = Object.values( q.choices );

						if( !q.choices?.length )
							continue;

						if( q.config?.limit != 1 ){
							let arrayCtrl = new UntypedFormArray( [], [ LogQuestionsComponent.notEmptyGroupValidator(  Math.max(q.config?.limit , 1) ) ] );
							//@ts-ignore
							for( const choice of q.choices )
								arrayCtrl.push( new UntypedFormControl() );

							control = arrayCtrl;
						}else{
						}
					}

					if( !control ){
						control = new UntypedFormControl( defaultValue, validators );
					}

					formGroup.addControl( q.key, control );
				}

			}

		await this.loader.dismiss();
		if( !questionCount ){
			this.done.next( this.log );
			return;
		}

		this.busy = false;
		this.cdr.markForCheck();
	}

	public async confirmStep(){
		this.triedToSubmit = true;

		if( !this.questionsForm.valid ){
			const alert = await this.alertController.create( {
				                                                 message: this.translate.instant( 'LOG.QUESTIONS.MISSING_ANSWERS_CONFIRM' ),
				                                                 cssClass: 'center-buttons',
				                                                 buttons: [
					                                                 { text: this.translate.instant( 'LOG.QUESTIONS.PROVIDE_MISSING_BTN' ), role: 'cancel' },
					                                                 { text: this.translate.instant( 'LOG.QUESTIONS.IGNORE_MISSING_BTN' ), cssClass: 'danger' },
				                                                 ],
			                                                 } );

			await alert.present();
			const { role } = await alert.onDidDismiss();
			if( role === 'cancel' )
				return;
		}

		let answers = this.questionsForm.getRawValue();


		// transform multiple choice stuff
		let groupNum = -1;
		for( const group of this.activeGroups ){
			groupNum++;
			const groupValues = answers[ group.key! || 'group-' + groupNum ];

			for( const question of group.questions ){
				if( question.type === StudyCatalogQuestionType.Choices && question.config?.limit != 1 ){
					if( !question.choices?.length )
						continue;

					const qValues = groupValues[ question.key ];
					if( !qValues?.length )
						continue;

					const choices = question.choices;

					let actualValues = [];
					for( const [ num, state ] of Object.entries( qValues ) ){
						if( state ){
							//@ts-ignore
							actualValues.push( choices[ num ].value );
						}
					}

					groupValues[ question.key ] = actualValues;
				}
			}
		}

		this.log!.answers = answers;

		this.done.next( this.log );
	}

	public translatedQuestion( question:StudyCatalogQuestion, key:StudyCatalogQuestionTranslatableKey = 'question' ):string{
		return question.translated?.[ this.langKey ]?.[ key ] || question[ key ];
	}



	private static notEmptyGroupValidator( minRequired = 1 ):ValidatorFn{
		//@ts-ignore
		return function validate( formGroup:UntypedFormGroup ){
			let checked = 0;

			Object.keys( formGroup.controls ).forEach( key => {
				const control = formGroup.controls[ key ];
				if( control.value === true )
					checked++;
			} );

			if( checked < minRequired )
				return { requireCheckboxToBeChecked: true };

			return null;
		};
	}
}
