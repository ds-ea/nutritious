import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { App } from '@capacitor/app';
import { ActionSheetController, LoadingController, ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import dayjs, { Dayjs } from 'dayjs';

import relativeTime from 'dayjs/plugin/relativeTime';
import { EMPTY, filter, finalize, interval, ReplaySubject, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { containsActionStep, containsOnlyContentSteps, humanReadableDays, minutesToTime, PreparedSchedule, PreparedStudy, PublicStudy, ResponseLog, ResponseLogEntry, ResponseLogState, SafeSlot } from '../../../../../../libs/core/src';
import { CoreService } from '../../core/core.service';
import { StudyService } from '../study.service';
import { DaySelectorComponentComponent } from './day-selector.component';


dayjs.extend( relativeTime );

enum ActionState{
	// will be available in the future
	Upcoming = 'upcoming',
	// currently available
	Todo = 'todo',
	// done, can NOT be repeated
	Done = 'done',
	// done, but can be repeated
	Repeatable = 'repeatable',
	// was to be done, but wasn't, and is not available anymore
	Missed = 'missed',
	// obligatory task that was not done when expected, but is still available
	Overdue = 'overdue',
	// optional task that's past its time, but still available
	Unfulfilled = 'unfulfilled',
	// simply unavailable for whatever reason
	Unavailable = 'unavailable',
}

type ActionStates = `${ ActionState }`;


type TimelineItem = {
	type:'marker' | 'slot' | 'action' | 'trail' | 'content' | 'boundary' | 'now';
	time:number;
	timeLabel?:string;
} & DayAction;

type DayAction = {
	study?:PublicStudy;
	slot?:SafeSlot;
	title?:string;
	state?:ActionStates;
	available?:boolean;
	hint?:string;
	key?:SafeSlot['key'];

	doneCount?:number;
}

type ScheduleActions = {
	overdue:DayAction[],
	unfulfilled:DayAction[],
	missed:DayAction[],
	upcoming:DayAction[],
	available:DayAction[]

	allDay:DayAction[],
	allDayContent:DayAction[],
	actions:DayAction[],
	timeline:TimelineItem[],

	slots:SafeSlot[],

	emptySchedule:boolean;
}


@Component( {
	selector: 'app-dashboard',
	template: `
		<ion-content class="content-centered">

			@if (dateDebug) {
				<div style="position: absolute; width: 500px; top: 60px;">
					hour
					<mat-slider style="width: 100%"
								[max]="23"
								[min]="0"
								[step]="1"
								[showTickMarks]="true"
								[discrete]="true"
					>
						<input matSliderThumb [(ngModel)]="fakeHours" #slider (valueChange)="processStudies()" />
					</mat-slider>
					day
					<mat-slider style="width: 100%"
								[max]="6"
								[min]="0"
								[step]="1"
								[showTickMarks]="true"
								[discrete]="true"
					>
						<input matSliderThumb [(ngModel)]="fakeDay" #slider (valueChange)="processStudies()" />
					</mat-slider>
					view offset
					<mat-slider style="width: 100%"
								[max]="0"
								[min]="-7"
								[step]="1"
								[showTickMarks]="true"
								[discrete]="true"
					>
						<input matSliderThumb [(ngModel)]="viewDayOffset" #slider (valueChange)="processStudies()" />
					</mat-slider>
				</div>
			}

			<div class="view-content" *ngIf="!busy && studies?.length; else nostudy">

				<div class="dashboard-container">


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

					@if (overdueActions.length) {
						<mat-card class="overdue">
							<mat-card-header>
								<mat-card-subtitle>{{ 'STUDY.OVERDUE_LBL' | translate }}</mat-card-subtitle>
							</mat-card-header>

							<ul class="overdue-actions">
								@for (overdue of overdueActions; track overdue.date) {
									<li>
										<span class="date">{{ overdue.date | date: 'EEEE MMM d.' }}</span>
										<ul class="overdue-actions">
											@for (action of overdue.actions; track action) {
												<li [title]="action.hint||''">
													@if (action.slot?.id) {
														<button mat-flat-button color="accent"
																[disabled]="!action.available"
																(click)="openAction(action)"
														>
															{{ action.title || action.key }}
														</button>
													}
												</li>
											}
										</ul>
									</li>
								}
							</ul>
						</mat-card>
					}

					<div>

						@if (!emptySchedule) {
							<mat-card class="schedule">
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
													@if (item.doneCount > 3) {
														<span class="done">
															✓
															<small>×</small>
															{{ item.doneCount }}
														</span>
													} @else {
														@for (num of [].constructor(item.doneCount); track num) {
															<span class="done">✓</span>
														}
													}
												</span>
											}

											@if (item.type === 'action' || item.type === 'content') {
												<span class="actions">
													@if (item.slot?.id) {
														<button mat-flat-button color="primary"
																[disabled]="!item.available"
																(click)="openAction(item)"
														>
															<!--[routerLink]="['slot', item.study!.id, item.slot!.id ]"-->
															{{
																(item.type === 'action' ? 'SCHEDULE.BTN_OPEN_ACTION' : item.type === 'content' ? 'SCHEDULE.BTN_OPEN_CONTENT' : '')
																	| translate
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

						@if (emptySchedule && !allDayActions.length && !allDayContent.length) {
							<mat-card>
								<mat-card-content>
									{{ 'STUDY.NOTHING_TO_DO'|translate }}
								</mat-card-content>
							</mat-card>
						}

						<footer class="view-footer">
							@if (allDayActions) {
								<ul class="available-actions">
									@for (action of allDayActions; track action.slot) {
										<li [title]="action.hint||''">
											@if (action.slot?.id) {
												<button mat-flat-button color="accent"
														[disabled]="!action.available"
														(click)="openAction(action)"
												>
													<!--[routerLink]="['slot', action.study!.id,  action.slot!.id ]"-->
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
							@if (allDayContent) {
								<ul class="available-content">
									@for (action of allDayContent; track action.slot) {
										<li [title]="action.hint||''">
											@if (action.slot?.id) {
												<button mat-flat-button color="default"
														[disabled]="!action.available"
														(click)="openContent(action)"
												>
													<!--[routerLink]="['slot', action.study!.id,  action.slot!.id ]"-->
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
				</div>


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

	public timeline:TimelineItem[] = [];
	public allDayActions:DayAction[] = [];
	public allDayContent:DayAction[] = [];
	public overdueActions:{ date:Date, actions:DayAction[] }[] = [];
	public available:{ [slotId:string]:{ action:DayAction, days:string[] } } = {};
	public emptySchedule:boolean | undefined = undefined;

	public fakeHours = dayjs().hour();
	public fakeDay = dayjs().day();
	public viewDayOffset = 0;

	public nowDate:string = '';
	public viewDate:string = '';

	private _lastRefresh:Dayjs | undefined;
	public triggerRefresh$ = new Subject<boolean | undefined>();

	public dateDebug:boolean = false;

	// automated refresh timings (in minutes)
	public automaticRefreshRange = { min: 5, auto: 30 };

	constructor(
		private readonly core:CoreService,
		private readonly studyService:StudyService,
		public readonly loading:LoadingController,
		public readonly router:Router,
		public readonly route:ActivatedRoute,
		public readonly cdr:ChangeDetectorRef,
		public readonly translate:TranslateService,
		public readonly actionSheetCtrl:ActionSheetController,
		public readonly modalCtrl:ModalController,
	){
	}

	async ngOnInit(){

		this.loader = await this.loading.create( { spinner: 'crescent' } );

		this.core.account$
			.pipe( takeUntil( this._destroyed$ ) )
			.subscribe( account => {
				if( !account ){
					this.emptySchedule = undefined;
					this.studies = undefined;
					this.timeline = [];
					this.overdueActions = [];
					this.allDayActions = [];
					this.allDayContent = [];
					this.available = {};
				}

				this.cdr.markForCheck();

				// refresh studies when logged in
				if( account )
					this.refreshStudies()
						.subscribe( () => {

						} );
				else
					this.router.navigateByUrl( '/login' );

			} );

		this.route.url.subscribe( url => {
			if( !this.core.account )
				this.router.navigateByUrl( '/login' );
		} );


		this.studyService.newResponses$
			.pipe( takeUntil( this._destroyed$ ) )
			.subscribe( data => {
				this.refreshLogs( data.map( r => r.study ) );
			} );

		this.translate.onLangChange
			.subscribe( lang => this.processStudies() );


		// trigger optional refresh every 30 minutes
		interval( this.automaticRefreshRange.auto * 60 * 1000 )
			.pipe( takeUntil( this._destroyed$ ) )
			.subscribe( ( v ) => {
				this.triggerRefresh$.next( false );
			} );

		this.triggerRefresh$
			.pipe(
				takeUntil( this._destroyed$ ),
				filter( () => !!this.core.account && this.core.online$.value ),
			)
			.subscribe( ( ignoreAge ) => {
				if( ignoreAge
					|| !this._lastRefresh
					|| ( this._lastRefresh.diff() / 1000 > this.automaticRefreshRange.min * 60 )
				){
					this.refreshStudies()
						.subscribe( () => {

						} );
				}
			} );


		// force refresh when returning from outside the app
		App.addListener( 'resume', () => {
			this.triggerRefresh$.next( true );
		} );
	}

	public ngOnDestroy():void{
		this._destroyed$.next( true );
		this._destroyed$.unsubscribe();
	}

	public refreshStudies(){
		if( this.busy )
			return EMPTY;

		this.busy = true;
		this.loader.present();
		this.cdr.markForCheck();

		this._lastRefresh = dayjs();

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

					this.processStudies();
				} ),
				finalize( () => {
					this.busy = false;
					this.cdr.markForCheck();
					this.loader.dismiss();
				} ),
			);

	}

	public refreshLogs( onlyStudies?:PublicStudy['id'][] ){
		const studyIds = onlyStudies || this.studies?.map( data => data.study.id );

		if( studyIds?.length )
			this.studyService.refreshLogs( studyIds )
				.subscribe( logs => {
					if( !this.logs )
						this.logs = {};
					for( const log of logs )
						this.logs[log.study] = log;

					this.processStudies();
				} );

	}


	private static processSchedule(
		study:PublicStudy,
		preparedSchedule:PreparedSchedule,
		day:dayjs.Dayjs,
		now = dayjs(),
		log?:ResponseLog,
		translate?:TranslateService,
	):ScheduleActions{

		const nowDate = now.format( 'YYYY-MM-DD' );
		const nowMinutes = ( now.hour() * 60 ) + now.minute();
		const nowUnix = now.unix();

		const date = day.format( 'YYYY-MM-DD' );
		const dayOfWeek = day.day();
		const isToday = nowDate === date;


		const { schedule, slots } = preparedSchedule;
		let emptySchedule = true;

		const daySetup = schedule.daySetup.find( ds => ds.days.includes( dayOfWeek ) );

		const overdue:DayAction[] = [];
		const missed:DayAction[] = [];
		const unfulfilled:DayAction[] = [];
		const upcoming:DayAction[] = [];
		const available:DayAction[] = [];
		const actions:DayAction[] = [];
		const timeline:TimelineItem[] = [];

		const allDaySlots:SafeSlot[] = [];
		const allDayActions:DayAction[] = [];
		const allDayContent:DayAction[] = [];


		const dayUnix = day.unix() - ( nowMinutes * 60 );

		const startOfDay = daySetup?.start || 0;
		const endOfDay = daySetup?.end ? daySetup?.end + ( startOfDay > daySetup.end ? 24 * 60 : 0 ) : 24 * 60;
		const endOfEntryMinutes = endOfDay + ( daySetup?.grace ?? 0 );

		const startOfDayUnix = dayUnix + ( startOfDay * 60 );
		const endOfDayUnix = dayUnix + ( endOfDay * 60 );
		const endOfEntryUnix = dayUnix + ( endOfEntryMinutes * 60 );

		const dayEntryAvailable = endOfEntryUnix > nowUnix;


		for( const slot of slots ){
			const { availability, constraints } = slot;

			if( slot.steps?.length )
				emptySchedule = false;

			if( slot.date ){
				// TODO: implement "on date" functionality
			}


			const isAction = containsActionStep( slot.steps );
			const isContent = containsOnlyContentSteps( slot.steps );

			const slotLogs = log?.entries.filter( resp => resp.slot === slot.id );
			const slotLogsDay = slotLogs?.filter( resp => resp.forDay === nowDate );

			const countedSlotResponses:ResponseLogEntry['suid'][] = [];
			const doneResponses = slotLogsDay?.filter( resp => {
				if( countedSlotResponses.indexOf( resp.suid ) !== -1 )
					return false;
				countedSlotResponses.push( resp.suid );
				return resp.state === ResponseLogState.Done || resp.state === ResponseLogState.Pending || resp.state === ResponseLogState.Local;
			} );

			const doneCount = doneResponses?.length ?? 0;

			const action:DayAction = {
				study,
				slot,
				title: slot.name || slot.key,
				state: 'todo',
				available: dayEntryAvailable,
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
					availability.days?.length && !availability.days.includes( dayOfWeek )
				){
					action.available = false;
					action.state = 'unavailable';
					action.hint = translate?.instant( 'STUDY.HINT_SLOT_DAY_AVAILABILITY', { DAYS: humanReadableDays( availability.days, translate )?.join( ', ' ) } );
				}
			}


			if( availability?.allDay || availability?.start == null ){
				////////////////////////
				// ALL DAY
				allDaySlots.push( slot );

				if( isAction || isContent ){
					if( isAction )
						allDayActions.push( action );
					else if( isContent )
						allDayContent.push( action );

					if( action.available ){
						available.push( action );

						if( slot.constraints?.obligatory && date !== nowDate ){
							action.state = 'overdue';
							action.hint = translate?.instant( 'STUDY.HINT_SLOT_OVERDUE' );
							overdue.push( action );
						}
					}
				}

			}else{
				////////////////////////
				// slot
				const startMinutes = startOfDay + Number( availability.start );
				const endMinutes = ( availability.duration ) ? startMinutes + availability.duration : undefined;
				const startUnix = startOfDayUnix + ( startMinutes * 60 );
				const endUnix = endMinutes ? startOfDayUnix + ( endMinutes * 60 ) : undefined;

				const item:TimelineItem = {
					...action,
					type: 'slot',
					time: startMinutes,
					timeLabel: minutesToTime( startMinutes ),
				};


				// can start all day if grace is null, otherwise starttime is exact ( adjusted by grace time), but can not be earlier than start of day
				const availableFrom = availability.graceStart == null ? undefined : Math.max( startOfDay, startMinutes - ( availability.graceStart ?? 0 ) );
				const availableFromUnix = availableFrom && ( dayUnix + ( availableFrom * 60 ) );
				const availableUntil = availability.graceEnd == null ? endOfEntryMinutes : Math.max( startOfDay, ( endMinutes ?? startMinutes ) + ( availability.graceEnd ?? 0 ) );
				const availableUntilUnix = dayUnix + ( availableUntil * 60 );


				// slot availability processing in regard to time (only done when no other factors disabled it already -
				// but day entry grace might be before the item's grace, so we need to check both)
				if( item.available || !dayEntryAvailable ){

					if( availableFromUnix && nowUnix < availableFromUnix ){
						item.available = false;
						item.state = 'upcoming';
						item.hint = translate?.instant( 'STUDY.HINT_SLOT_UPCOMING', { TIME: minutesToTime( availableFrom ) } );

						upcoming.push( item );
					}

					if( item.available && nowUnix > availableUntilUnix ){
						item.available = false;

						if( slot.constraints?.obligatory ){
							item.state = 'missed';
							item.hint = translate?.instant( 'STUDY.HINT_SLOT_MISSED', { TIME: minutesToTime( availableUntil ) } );

							missed.push( item );
						}else{
							item.state = 'unfulfilled';
							item.hint = translate?.instant( 'STUDY.HINT_SLOT_UNFULFILLED', { TIME: minutesToTime( availableUntil ) } );
							unfulfilled.push( item );
						}
					}
				}

				if( isAction ){
					item.type = 'action';
					item.title = slot.name;

				}else if( isContent ){
					item.type = 'content';
				}

				timeline.push( item );

				if( item.available ){
					available.push( item );

					if( slot.constraints?.obligatory && date !== nowDate ){
						item.state = 'overdue';
						item.hint = translate?.instant( 'STUDY.HINT_SLOT_OVERDUE' );
						overdue.push( item );
					}
				}

			}
		}

		timeline.push( {
			type: 'marker',
			time: startOfDay,
			timeLabel: minutesToTime( startOfDay ),
			title: translate?.instant( 'SCHEDULE.MARKER_START_OF_DAY' ) ?? 'Start of Day',
			study,
		} );

		timeline.push( {
			type: 'marker',
			time: endOfDay < startOfDay ? endOfDay + 24 * 60 : endOfDay,
			timeLabel: minutesToTime( endOfDay === 24 * 60 ? 23 * 60 + 59 : endOfDay ),
			title: translate?.instant( 'SCHEDULE.MARKER_END_OF_DAY' ) ?? 'End of Day',
			study,
		} );


		return { actions, allDay: allDayActions, allDayContent, missed, unfulfilled, available, timeline, overdue, upcoming, slots, emptySchedule };

	}


	public processStudies(){

		const overdueActions:DashboardView['overdueActions'] = [];
		const available:DashboardView['available'] = {};

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
		this.viewDate = this.nowDate;

		const daysToLookBack = 7;


		const consolidated:{
			overdue:{ day:string, actions:DayAction[] }[],
			days:{ [day:string]:ScheduleActions },
			today?:ScheduleActions,
			yesterday?:ScheduleActions
		} = {
			overdue: [],
			days: {},
		};


		this.emptySchedule = true;
		if( this.studies ){
			for( const study of this.studies ){
				if( !study.schedule?.slots?.length )
					continue;

				for( let dayOffset = daysToLookBack ; dayOffset >= 0 ; dayOffset-- ){
					const day = now.clone().subtract( dayOffset, 'day' );
					const dayDate = day.format( 'YYYY-MM-DD' );

					const processed = DashboardView.processSchedule( study.study, study.schedule, day, now, this.logs?.[study.study.id], this.translate );

					if( !processed.emptySchedule )
						this.emptySchedule = false;

					if( dayOffset === 0 )
						consolidated.today = processed;
					else if( dayOffset === 1 )
						consolidated.yesterday = processed;


					if( !consolidated.days[dayDate] )
						consolidated.days[dayDate] = processed;
					else
						for( const [ key, actions ] of Object.entries( processed ) )
							// TODO: properly merge timelines
							if( key === 'timeline' )
								consolidated.days[dayDate][key].push( ...actions as TimelineItem[] );
							else if( key === 'slots' )
								consolidated.days[dayDate][key].push( ...actions as SafeSlot[] );
							else
								consolidated.days[dayDate][key as Exclude<keyof ScheduleActions, 'timeline' | 'slots' | 'emptySchedule'>].push( ...actions as DayAction[] );


					if( processed.overdue?.length ){
						const overdue:DashboardView['overdueActions'][number] = {
							date: day.toDate(),
							actions: [],
						};
						for( const action of processed.overdue )
							if( action.slot )
								overdue.actions.push( action );

						if( overdue.actions.length )
							overdueActions.push( overdue );
					}

					if( processed.available?.length )
						for( const action of processed.available )
							if( action.slot ){
								const slotKey = action.slot.key || action.slot.id;
								if( !available[slotKey] )
									available[slotKey] = { action, days: [ dayDate ] };
								else
									available[slotKey].days.push( dayDate );
							}
				}

			}
		}

		const viewDate = now.clone().subtract( -this.viewDayOffset, 'day' ).format( 'YYYY-MM-DD' );
		const viewDay = consolidated.days[viewDate];
		this.nowDate = viewDate;

		// items (and actions) on the current
		const timelineItems:TimelineItem[] = viewDay?.timeline || [];
		if( timelineItems.length ){
			if( !timelineItems.find( item => item.time === 0 && item.type === 'marker' ) )
				timelineItems.push( {
					type: 'boundary',
					time: 0,
					timeLabel: minutesToTime( 0 ),
				} );

			const endOfDayMinutes = 24 * 60;
			if( !timelineItems.find( item => item.time === endOfDayMinutes && item.type === 'marker' ) )
				timelineItems.push( {
					type: 'boundary',
					time: endOfDayMinutes,
					timeLabel: minutesToTime( endOfDayMinutes === 24 * 60 ? 23 * 60 + 59 : endOfDayMinutes ),
				} );
		}

		this.overdueActions = overdueActions || [];
		this.available = available;
		this.allDayActions = viewDay?.allDay || [];
		this.allDayContent = viewDay?.allDayContent || [];

		if( viewDate === realDate )
			timelineItems.push( { type: 'now', time: nowMinutes } );

		this.timeline = timelineItems.sort( ( a, b ) => a.time - b.time );

		this.cdr.markForCheck();
	}

	public openContent( action:DayAction, date?:string ){
		this.router.navigate( [ 'study', 'slot', action.study!.id, action.slot!.id, date || 'now' ] );
	}

	public openAction( action:DayAction, date?:string ){
		if( !action?.slot )
			return;

		// check if unfulfilled or overdue tasks occupying the same slot are available - ask user which date for
		const slotKey = action.slot.key || action.slot.id;
		if( this.available[slotKey] && !date ){
			const availableDates = this.available[slotKey].days.map( date => dayjs( date ) );
			if( availableDates.length > 1 ){

				this.modalCtrl.create( {
					component: DaySelectorComponentComponent,
					componentProps: { availableDates },
					cssClass: 'centered',
				} ).then( modal => {
					modal.onDidDismiss()
						.then( ( { data } ) => {
							if( data?.day )
								this.openAction( action, data.day.format( 'YYYY-MM-DD' ) );
						} );

					modal.present();
				} );

				return;
			}
		}

		this.router.navigate( [ 'study', 'slot', action.study!.id, action.slot!.id, date || 'now' ] );
	}
}
