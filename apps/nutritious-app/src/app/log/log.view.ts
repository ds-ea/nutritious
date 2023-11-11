import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { ReplaySubject } from 'rxjs';
import { last, takeUntil } from 'rxjs/operators';
import { LogEntry } from '../../interfaces/log.interface';
import { StudyDTO, StudyStepType } from '../../interfaces/study.interface';
import { StudyService } from '../study/study.service';


@Component( {
	            selector: 'app-questionnaire',
	            template: `
					<ng-container *ngIf="study">
						<ion-content class="content-centered" [ngSwitch]="step">
				
							<log-meal *ngSwitchCase="StudyStepType.Food"
									  [log]="log"
									  (done)="stepDone()"
							></log-meal>
				
							<log-questions *ngSwitchCase="StudyStepType.Catalog"
										   [log]="log"
										   [catalog]="study.catalog"
										   (done)="stepDone()"></log-questions>
				
							<log-summary *ngSwitchCase="'summary'"></log-summary>
			
						</ion-content>
					</ng-container>
	            `,
	            styles: [],
	            changeDetection: ChangeDetectionStrategy.OnPush,
            } )
export class LogView implements OnInit, OnDestroy{
	private _destroyed$ = new ReplaySubject<boolean>( 1 );
	
	public StudyStepType = StudyStepType;
	
	public logDate:Date;
	
	public busy = false;
	private loader!:HTMLIonLoadingElement;
	
	public study:StudyDTO | undefined;
	
	public steps:StudyStepType[] | undefined;
	public stepNum:number = -1;
	public step:StudyStepType | 'summary' | undefined;
	
	//	@Input() study:StudyDTO|undefined;
	
	public log:LogEntry;
	public submitted?:LogEntry;
	
	constructor(
		private studyService:StudyService,
		public loading:LoadingController,
		public router:Router,
		public cdr:ChangeDetectorRef,
	){
		
		this.logDate = new Date();
		this.log = {
			date: this.logDate.toISOString(),
		};
		
	}
	
	async ngOnInit(){
		this.loader = await this.loading.create( { spinner: 'crescent' } );
		this.loadStudy();
	}
	
	
	public ngOnDestroy():void{
		this._destroyed$.next( true );
		this._destroyed$.unsubscribe();
	}
	
	public async loadStudy(){
		await this.loader.present();
		this.studyService.getStudy()
			.pipe( takeUntil( this._destroyed$ ), last() )
			.subscribe( study => {
				this._applyStudy( study );
				this.loader.dismiss();
			} );
	}
	
	protected _applyStudy( study:StudyDTO ){
		let steps:StudyStepType[] = study.study.steps!;
		if( !steps ){
			steps = study.catalog?.groups?.[ 0 ][ 'questions-first' ]
			        ? [ StudyStepType.Catalog, StudyStepType.Food ]
			        : [ StudyStepType.Food, StudyStepType.Catalog ]
			;
		}
		
		this.steps = steps;
		this.study = study;
		this.cdr.markForCheck();
		this.nextStep();
	}
	
	public stepDone(){
		this.busy = true;
		this.cdr.markForCheck();
		
		this.studyService.submitLog( this.log )
			.subscribe(
				{
					next: logged => {
						this.busy = false;
						
						// keeping track of what was submitted and what we still need to do
						this.log = logged.pending;
						this.submitted = Object.assign( this.submitted || {}, logged.submitted );
						this.cdr.markForCheck();
					},
					complete: () => {
						this.nextStep();
					},
				} );
		
	}
	
	public nextStep( dir = 1 ){
		const nextStepNum = this.stepNum + dir;
		
		if( nextStepNum >= ( this.steps?.length || 0 ) ){
			this.step = 'summary';
			return;
		}
		
		
		if( !this.steps?.[ nextStepNum ] ){
			console.warn( 'step missing!', nextStepNum, this.steps );
			return;
		}
		
		this.stepNum = nextStepNum;
		this.step = this.steps[ this.stepNum ];
		this.cdr.markForCheck();
		
	}
	
}
