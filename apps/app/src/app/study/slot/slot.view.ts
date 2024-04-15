import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, Type } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import dayjs from 'dayjs';
import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { containsOnlyContentSteps, MatchedSlot, PublicStudy, SafeSlot, SafeStep, StepResponse, StudyStepType } from '../../../../../../libs/core/src';
import { StudyService } from '../study.service';
import { AbstractStepComponent, StepCompleteEvent, StepProgress } from './steps/abstract-step.component';
import { StepContentComponent } from './steps/step-content.component';
import { StepFormComponent } from './steps/step-form.component';
import { StepMealBlsComponent } from './steps/step-meal-bls.component';


@Component( {
	selector: 'slot-view',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<ion-content class="content-centered">

			<div class="view-content">

				@if (state === 'steps' && currentStep) {

					<ng-container
						*ngComponentOutlet="
							currentStep.component;
							inputs: {
								slot: slot,
								step: currentStep.step,
								ref: currentStep.ref,
								data: currentResponse,
								progress: stepProgress,
								triggerComplete: stepTriggerComplete,
								onComplete: stepOnComplete
							}
						"
					/>

					<footer class="view-footer">
						<button mat-flat-button color="primary" (click)="completeStep()">
							{{ (isContentOnly && lastStep ? ('LOG.SUMMARY.GOTO_DASHBOARD_BTN_' + rndBtnNum) : 'GENERIC.CONTINUE_BTN') | translate }}
						</button>
					</footer>

				} @else {
					@if (error) {
						<p>error: {{ error.msg }}</p>
					}

					<footer class="view-footer">
						<button mat-flat-button color="primary" (click)="submit()">
							<!--{{ 'GENERIC.DONE_BTN' | translate }}-->
							{{ ('LOG.SUMMARY.GOTO_DASHBOARD_BTN_' + rndBtnNum) | translate }}
						</button>
					</footer>
				}

			</div>
		</ion-content>
	`,
} )

export class SlotView implements OnInit, OnDestroy{
	public StudyStepType = StudyStepType;
	private _destroyed$ = new ReplaySubject<boolean>( 1 );

	public busy = false;
	private loader!:HTMLIonLoadingElement;

	public rndBtnNum = Math.floor( Math.random() * ( 2 - 0 + 1 ) + 0 );

	public state:'steps' | 'done' | 'error' = 'steps';
	public error:{ msg:string } | undefined;

	public study:PublicStudy | undefined;

	public slot:MatchedSlot | undefined;
	public isContentOnly:boolean | undefined;

	public steps:SafeStep[] = [];
	public stepIndex:number = 0;
	public lastStep:boolean = false;
	public currentStep:{
		step:SafeStep;
		ref:unknown;
		component:Type<AbstractStepComponent>
	} | undefined;


	public responses:Record<string, StepResponse> = {};
	public currentResponse:Record<PropertyKey, unknown> | undefined = undefined;


	public stepProgress = new BehaviorSubject<StepProgress | undefined>( undefined );
	public stepOnComplete = new EventEmitter<StepCompleteEvent<unknown>>;
	public stepTriggerComplete = new EventEmitter<boolean>();

	static knownStepComponents:Record<StudyStepType, Type<AbstractStepComponent<any, any>>> = {
		[StudyStepType.Content]: StepContentComponent,
		[StudyStepType.Form]: StepFormComponent,
		[StudyStepType.BlsFood]: StepMealBlsComponent,
	};

	constructor(
		private route:ActivatedRoute,
		public loading:LoadingController,
		private router:Router,
		private cdr:ChangeDetectorRef,
		private studyService:StudyService,
	){ }

	ngOnInit(){
		this.route.paramMap.subscribe( params => {
			const studyId = params.get( 'studyId' );
			const slotId = params.get( 'slotId' );
			if( studyId && slotId )
				this.loadSlot( studyId, slotId );
		} );

		this.stepOnComplete
			.pipe( takeUntil( ( this._destroyed$ ) ) )
			.subscribe( this.onStepComplete.bind( this ) );
	}

	public ngOnDestroy():void{
		this._destroyed$.next( true );
		this._destroyed$.unsubscribe();
	}

	private async loadSlot( studyId:PublicStudy['id'], slotId:SafeSlot['id'] ){
		this.loader = await this.loading.create( { spinner: 'crescent' } );

		const study = this.studyService.studies?.find( s => s.study.id === studyId )?.study;
		if( !study ){
			this.state = 'error';
			this.error = { msg: 'NO_STUDY' };
			return;
		}

		this.study = study;
		this.slot = await this.studyService.getSlot( slotId );
		this.isContentOnly = containsOnlyContentSteps( this.slot?.prepared.steps );

		if( !this.slot?.prepared.steps ){
			this.state = 'error';
			this.error = { msg: 'NO_STEPS' };
			return;
		}

		this.error = undefined;

		// TODO: order steps by slot.stepOrder if set
		this.steps = this.slot.prepared.steps;

		this.showStep( 0 );
	}

	private showStep( stepNum:number ){
		if( !this.steps?.[stepNum] )
			return;

		this.stepIndex = stepNum;
		this.lastStep = stepNum >= this.steps.length - 1;

		const step = this.steps[this.stepIndex];
		const component:Type<AbstractStepComponent> = SlotView.knownStepComponents[step.type];
		const ref = step.ref ? this.slot?.refs[step.type]?.[step.ref] : undefined;

		this.currentStep = { step, component, ref };
		this.state = 'steps';

		this.cdr.markForCheck();
	}


	public completeStep(){
		this.stepTriggerComplete.next( true );
	}

	public onStepComplete( event:StepCompleteEvent<unknown> ):void{
		const step = event.stepId ? this.steps.find( s => s.id == event.stepId ) : undefined;
		if( !step ){
			// TODO: escalate
			console.error( 'slot step completed, but no matching step found: ', { event, knownSteps: this.steps } );
		}

		const now = dayjs().toISOString();

		this.responses[event.stepId] = {
			step: event.stepId,
			type: step?.type || 'unknown',

			slot: this.slot!.prepared.id,

			data: event.data,

			created: now,
			updated: now,
		};

		this.stepIndex++;

		if( this.stepIndex >= this.steps?.length ){
			if( this.isContentOnly ){
				this.submit();
				return;
			}

			this.state = 'done';
			this.cdr.markForCheck();
			return;
		}

		this.showStep( this.stepIndex );
	}



	public async submit(){

		const submittableResponses = Object.values( this.responses ).filter( r => r.data != null );

		if( !submittableResponses.length ){
			this.router.navigateByUrl( '/study' );
			return;
		}

		await this.loader.present();
		const responses = submittableResponses
			.map(
				response => ( { ...response, _study: this.study!.id } ),
			);

		this.studyService.submitResponses( { responses } )
			.pipe( takeUntil( this._destroyed$ ) )
			.subscribe( {
				complete: () => {
					this.loader.dismiss();
					this.router.navigateByUrl( '/study' );
				},
			} );



	}



}
