import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import dayjs from 'dayjs';

import relativeTime from 'dayjs/plugin/relativeTime';
import { finalize, ReplaySubject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { containsActionStep, containsOnlyContentSteps, humanReadableDays, minutesToTime, PreparedStudy, PublicStudy, ResponseLog, ResponseLogState, SafeSlot } from '../../../../../../libs/core/src';
import { CoreService } from '../../core/core.service';
import { StudyService } from '../study.service';


dayjs.extend( relativeTime );

type TimelineItem = {
	type:'marker' | 'slot' | 'action' | 'trail' | 'content' | 'boundary' | 'now';
	time:number;
	timeLabel?:string;
} & DayAction;

type DayAction = {
	study?:PublicStudy;
	slot?:SafeSlot;
	title?:string;
	state?:'upcoming' | 'todo' | 'done' | 'repeatable' | 'missed' | 'passed' | 'unavailable';
	available?:boolean;
	hint?:string;
	key?:SafeSlot['key'];

	doneCount?:number;
}


@Component( {
	selector: 'app-dashboard',
	template: `
		<ion-content class="content-centered">
			<div style="position: absolute; width: 500px; top: 20%;">
				hour
				<mat-slider style="width: 100%"
							[max]="23"
							[min]="0"
							[step]="1"
							[showTickMarks]="true"
							[discrete]="true"
				>
					<input matSliderThumb [(ngModel)]="fakeHours" #slider (valueChange)="processSchedule()" />
				</mat-slider>
				day
				<mat-slider style="width: 100%"
							[max]="6"
							[min]="0"
							[step]="1"
							[showTickMarks]="true"
							[discrete]="true"
				>
					<input matSliderThumb [(ngModel)]="fakeDay" #slider (valueChange)="processSchedule()" />
				</mat-slider>
			</div>

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
							<mat-card-subtitle>{{ 'STUDY.DAY_SCHEDULE_LBL' | translate }} {{ nowDate }}</mat-card-subtitle>
						</mat-card-header>

						<ul class="timeline">
							<li class="trail"></li>
							@for (item of timeline; track item.time) {
								<li [ngClass]="[item.type, 'state-'+item.state]" [title]="item.hint||''">
									<span class="time">{{ item.timeLabel }}</span>
									<span class="bullet"></span>
									<span class="title" *ngIf="item.title">{{ item.title }}</span>

									@if (item.doneCount) {
										<span class="states">
											@for (num of [].constructor(item.doneCount); track num) {
												<span class="done">✓</span>
											}
										</span>
									}

									@if (item.type === 'action' || item.type === 'content') {
										<span class="actions">
											@if (item.slot?.id) {
												<button mat-flat-button color="primary"
														[routerLink]="['slot', item.study!.id, item.slot!.id ]"
														[disabled]="!item.available"
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
								<li [title]="action.hint||''">
									@if (action.slot?.id) {
										<button mat-flat-button color="accent"
												[routerLink]="['slot', action.study!.id,  action.slot!.id ]"
												[disabled]="!action.available"
										>
											{{ action.title || action.key }}
										</button>
									}

									@if (action.doneCount) {
										<div class="states">
											@for (num of [].constructor(action.doneCount); track num) {
												<span class="done">✓</span>
											}
										</div>
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

	public logs:Record<PublicStudy['id'], ResponseLog | undefined> | undefined;
	public studies:PreparedStudy[] | undefined;
	public slots:SafeSlot[] | undefined;

	public timeline:TimelineItem[] = [];
	public overdue:DayAction[] = [];
	public availableActions:DayAction[] = [];

	public fakeHours = dayjs().hour();
	public fakeDay = dayjs().day();

	public nowDate:string = '';

	constructor(
		private readonly core:CoreService,
		private readonly studyService:StudyService,
		public readonly loading:LoadingController,
		public readonly router:Router,
		public readonly cdr:ChangeDetectorRef,
		public readonly translate:TranslateService,
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

	public refreshStudies(){
		this.busy = true;
		this.loader.present();
		this.cdr.markForCheck();

		return this.studyService.refreshStudies()
			.pipe(
				tap( data => {
					this.studies = data.map( ( { study } ) => study );
					this.logs = data.reduce( (
							map,
							{ study, log },
						) => {
							map[study.study.id] = log;
							return map;
						},
						{} as NonNullable<DashboardView['logs']>,
					);

					this.processSchedule();
				} ),
				finalize( () => {
					this.busy = false;
					this.cdr.markForCheck();
					this.loader.dismiss();
				} ),
			);

	}

	public processSchedule(){

		const allSlots:SafeSlot[] = [];
		const allDaySlots:SafeSlot[] = [];

		const overdue:DayAction[] = [];
		const allDayActions:DayAction[] = [];

		// items (and actions) on the current
		const timelineItems:TimelineItem[] = [];
		const availableActions:DayAction[] = [];

		let now = dayjs();
		const realDate = now.format( 'YYYY-MM-DD' );

		if( this.fakeHours != null )
			now = now.set( 'hours', this.fakeHours );
		if( this.fakeDay != null )
			now = now.set( 'day', this.fakeDay );

		const nowDay = now.day();
		const nowDate = now.format( 'YYYY-MM-DD' );
		const nowMinutes = ( now.hour() * 60 ) + now.minute();

		this.nowDate = realDate === nowDate ? 'today' : now.fromNow();

		if( this.studies ){
			for( const study of this.studies ){
				if( !study.schedule?.slots?.length )
					continue;

				const dayOfWeek = now.day();
				const daySetup = study.schedule.schedule.daySetup.find( ds => ds.days.includes( dayOfWeek ) );

				const startOfDay = daySetup?.start || 6 * 60;
				const endOfDay = daySetup?.end || 23 * 60;
				const endOfEntry = endOfDay + ( daySetup?.grace ?? 0 );

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
					const { availability, constraints } = slot;


					if( slot.date ){
						// TODO: implement "on date" functionality
					}

					allSlots.push( slot );

					const isAction = containsActionStep( slot.steps );
					const isContent = containsOnlyContentSteps( slot.steps );

					const slotLogs = this.logs?.[study.study.id]?.entries.filter( resp => resp.slot === slot.id );
					const slotLogsDay = slotLogs?.filter( resp => resp.forDay === nowDate );
					const doneResponses = slotLogsDay?.filter( resp => resp.state === ResponseLogState.Done || resp.state === ResponseLogState.Local );

					const doneCount = doneResponses?.length ? doneResponses.length / ( slot.steps?.length || 1 ) : 0;

					const action:DayAction = {
						study: study.study,
						slot,
						title: slot.name || slot.key,
						state: 'todo',
						available: true,
						doneCount,
					};

					// slot constraints processing
					if( constraints ){
						if( action.available &&
							constraints.min != null && doneCount < constraints.min && doneCount > 0
						){
							action.state = 'todo';
						}

						if( action.available &&
							constraints.max != null && doneCount >= constraints.max
						){
							action.available = false;
							action.state = 'done';
						}
					}


					// slot availability processing in relation to days
					if( availability ){
						if( action.available &&
							availability.days?.length && !availability.days.includes( nowDay )
						){
							action.available = false;
							action.state = 'unavailable';
							action.hint = this.translate.instant( 'STUDY.HINT_SLOT_DAY_AVAILABILITY', { DAYS: humanReadableDays( availability.days, this.translate )?.join( ', ' ) } );
						}
					}



					if( availability?.allDay || availability?.start == null ){
						////////////////////////
						// ALL DAY
						allDaySlots.push( slot );

						if( isAction )
							allDayActions.push( action );

					}else{
						////////////////////////
						// slot
						const startMinutes = startOfDay + Number( availability.start );
						const endMinutes = ( availability.duration ) ? startMinutes + availability.duration : undefined;

						const item:TimelineItem = {
							...action,
							type: 'slot',
							time: startMinutes,
							timeLabel: minutesToTime( startMinutes ),
						};


						// can start all day if grace is null, otherwise starttime is exact ( adjusted by grace time), but can not be earlier than start of day
						const availableFrom = availability.graceStart == null ? undefined : Math.max( startOfDay, startMinutes - ( availability.graceStart ?? 0 ) );
						const availableUntil = availability.graceEnd == null ? endOfEntry : Math.max( startOfDay, ( endMinutes ?? startMinutes ) + ( availability.graceEnd ?? 0 ) );

						// slot availability processing in regard to time (only done when no other factors disabled it already)
						if( item.available ){
							if( availableFrom && nowMinutes < availableFrom ){
								item.available = false;
								item.state = 'upcoming';
								item.hint = this.translate.instant( 'STUDY.HINT_SLOT_UPCOMING', { TIME: minutesToTime( availableFrom ) } );
							}

							if( item.available && nowMinutes > availableUntil ){
								item.available = false;
								item.state = 'passed';
								item.hint = this.translate.instant( 'STUDY.HINT_SLOT_PASSED', { TIME: minutesToTime( availableUntil ) } );
							}
						}

						if( isAction ){
							item.type = 'action';
							item.title = slot.name;

						}else if( isContent ){
							item.type = 'content';
						}


						timelineItems.push( item );

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

		timelineItems.push( { type: 'now', time: nowMinutes } );

		this.timeline = timelineItems.sort( ( a, b ) => a.time - b.time );

		this.cdr.markForCheck();
	}


}
