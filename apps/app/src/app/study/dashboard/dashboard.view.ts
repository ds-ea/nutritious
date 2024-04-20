import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import dayjs from 'dayjs';
import { finalize, Observable, ReplaySubject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { containsActionStep, containsOnlyContentSteps, minutesToTime, PreparedStudy, PublicStudy, SafeSlot } from '../../../../../../libs/core/src';
import { CoreService } from '../../core/core.service';
import { StudyService } from '../study.service';


type TimelineItem = {
	type:'marker' | 'slot' | 'action' | 'trail' | 'content' | 'boundary';
	time:number;
	timeLabel?:string;
} & DayAction;

type DayAction = {
	study?:PublicStudy;
	slot?:SafeSlot;
	title?:string;
	state?:'upcoming' | 'todo' | 'done' | 'repeatable' | 'missed';
	key?:SafeSlot['key'];
}


@Component( {
	selector: 'app-dashboard',
	template: `
		<ion-content class="content-centered">

			<div class="view-content" *ngIf="!busy && studies?.length; else nostudy">

				@if (false) {
					@for (study of studies; track study.study.id) {
						<mat-card>
							<mat-card-header>
								<mat-card-subtitle>{{ 'STUDY.CURRENT_STUDY_MSG' | translate }}</mat-card-subtitle>
								<mat-card-title>
									<h1>{{ study.study.name }}</h1>
								</mat-card-title>
							</mat-card-header>

						</mat-card>
					}
				}

				@if (timeline.length) {
					<mat-card>
						<mat-card-header>
							<mat-card-subtitle>{{ 'STUDY.DAY_SCHEDULE_LBL' | translate }}</mat-card-subtitle>
						</mat-card-header>

						<ul class="timeline">
							<li class="trail"></li>
							@for (item of timeline; track item.time) {
								<li [ngClass]="item.type">
									<span class="time">{{ item.timeLabel }}</span>
									<span class="bullet"></span>
									<span class="title" *ngIf="item.title">{{ item.title }}</span>

									@if (item.type === 'action' || item.type === 'content') {
										<span class="actions">
											@if (item.slot?.id) {
												<button mat-flat-button color="primary"
														[routerLink]="['slot', item.study!.id, item.slot!.id ]"
												>
													{{
														item.type === 'action' ? 'log' : item.type === 'content' ? 'read' : ''
													}}
												</button>
											}
										</span>
									}
								</li>
							}
							<li class="trail"></li>
						</ul>
					</mat-card>
				}


				<footer class="view-footer">
					@if (availableActions) {
						<ul class="available-actions">
							@for (action of availableActions; track action.slot) {
								<li>
									@if (action.slot?.id) {
										<button mat-flat-button color="accent"
												[routerLink]="['slot', action.study!.id,  action.slot!.id ]"
										>
											{{ action.title || action.key }}
										</button>
									}
								</li>
							}
						</ul>
					}
					<!--<a routerLink="/log/new"
					   mat-flat-button color="accent"
					>{{ 'STUDY.ENTER_DATA_BTN' | translate }}
					</a>-->
				</footer>
			</div>

			<ng-template #nostudy>
				<div class="callout mat-primary">{{ 'STUDY.NO_STUDY_ERR' | translate }}</div>
			</ng-template>

		</ion-content>
	`,
	styles: [],
	changeDetection: ChangeDetectionStrategy.OnPush,
} )
export class DashboardView implements OnInit, OnDestroy{
	private _destroyed$ = new ReplaySubject<boolean>( 1 );

	public busy = false;
	private loader!:HTMLIonLoadingElement;

	public studies:PreparedStudy[] | undefined;
	public slots:SafeSlot[] | undefined;

	public timeline:TimelineItem[] = [];
	public overdue:DayAction[] = [];
	public availableActions:DayAction[] = [];

	constructor(
		private core:CoreService,
		private studyService:StudyService,
		public loading:LoadingController,
		public router:Router,
		public cdr:ChangeDetectorRef,
	){

	}

	async ngOnInit(){
		this.loader = await this.loading.create( { spinner: 'crescent' } );

		this.core.account$
			.pipe( takeUntil( this._destroyed$ ) )
			.subscribe( account => {
				if( !account ){
					this.studies = undefined;
					this.slots = undefined;
				}

				this.cdr.markForCheck();

				// refresh studies when logged in
				if( account )
					this.refreshStudies().subscribe( () => {

					} );

			} );
	}

	public ngOnDestroy():void{
		this._destroyed$.next( true );
		this._destroyed$.unsubscribe();
	}

	public refreshStudies():Observable<PreparedStudy[]>{
		this.busy = true;
		this.loader.present();
		this.cdr.markForCheck();

		return this.studyService.refreshStudies()
			.pipe(
				tap( studies => {
					this.studies = studies;
					this.processSchedule();
				} ),
				finalize( () => {
					this.busy = false;
					this.cdr.markForCheck();
					this.loader.dismiss();
				} ),
			);

	}

	private processSchedule(){

		const allSlots:SafeSlot[] = [];
		const allDaySlots:SafeSlot[] = [];

		const overdue:DayAction[] = [];
		const allDayActions:DayAction[] = [];

		// items (and actions) on the current
		const timelineItems:TimelineItem[] = [];
		const availableActions:DayAction[] = [];

		const now = dayjs();
		const nowMinutes = ( now.hour() * 60 ) + now.minute();

		if( this.studies ){
			for( const study of this.studies ){
				if( !study.schedule?.slots?.length )
					continue;

				const dayOfWeek = now.day();
				const daySetup = study.schedule.schedule.daySetup.find( ds => ds.days.includes( dayOfWeek ) );

				const startOfDay = daySetup?.start || 6 * 60;
				const endOfDay = daySetup?.end || 23 * 60;

				timelineItems.push( {
					type: 'marker',
					time: startOfDay,
					timeLabel: minutesToTime( startOfDay ),
					title: 'Start of Day',
					study: study.study,
				} );
				timelineItems.push( {
					type: 'marker',
					time: endOfDay,
					timeLabel: minutesToTime( endOfDay ),
					title: 'End of Day',
					study: study.study,
				} );


				for( const slot of study.schedule.slots ){

					allSlots.push( slot );

					const isAction = containsActionStep( slot.steps );
					const isContent = containsOnlyContentSteps( slot.steps );

					if( slot.date ){
						// TODO: implement "on date" functionality
					}


					if( slot.availability?.allDay || slot.availability?.start == null ){
						allDaySlots.push( slot );

						if( isAction )
							allDayActions.push( {
								study: study.study,
								slot,
								state: 'todo',
								title: slot.name,
							} );

					}else{

						const startMinutes = startOfDay + Number( slot.availability.start );
						const endMinutes = ( slot.availability.duration ) ? startMinutes + slot.availability.duration : undefined;

						if( isAction ){
							timelineItems.push( {
								type: 'action',
								time: startMinutes,
								timeLabel: minutesToTime( startMinutes ),

								study: study.study,
								slot,
								state: 'todo',
								title: slot.name,
							} );

						}else if( isContent ){
							timelineItems.push( {
								type: 'content',
								time: startMinutes,
								timeLabel: minutesToTime( startMinutes ),
								study: study.study,
								slot,
							} );

						}else{
							timelineItems.push( {
								type: 'slot',
								time: startMinutes,
								timeLabel: minutesToTime( startMinutes ),
								title: slot.name || slot.key,
								study: study.study,
								slot,
							} );
						}

					}
				}
			}
		}

		if( allDayActions.length ){
			for( const action of allDayActions ){
				availableActions.push( action );
			}
		}


		if( timelineItems.length ){

			const endOfDayMinutes = ( 23 * 60 ) + 59;
			timelineItems.push( {
				type: 'boundary',
				time: 0,
				timeLabel: minutesToTime( 0 ),
			} );
			timelineItems.push( {
				type: 'boundary',
				time: endOfDayMinutes,
				timeLabel: minutesToTime( endOfDayMinutes ),
			} );
		}

		this.slots = allSlots;
		this.overdue = overdue;
		this.availableActions = availableActions;

		this.timeline = timelineItems.sort( ( a, b ) => a.time - b.time );

		this.cdr.markForCheck();
	}


}
