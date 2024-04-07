import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import dayjs from 'dayjs';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { minutesToTime, PreparedStudy, SafeSlot, StudyStepType, StudyStepTypes } from '../../../../../../libs/core/src';
import { StudyService } from '../study.service';


type TimelineItem = {
	type:'marker' | 'slot' | 'action' | 'trail' | 'content' | 'boundary';
	time:number;
	timeLabel?:string;
} & DayAction;

type DayAction = {
	slot?:SafeSlot;
	title?:string;
	state?:'upcoming' | 'todo' | 'done' | 'repeatable' | 'missed';
	key?:SafeSlot['key'];
}

const actionStepTypes:StudyStepTypes[] = [
	StudyStepType.BlsFood,
	StudyStepType.Form,
];
const contentStepTypes:StudyStepTypes[] = [
	StudyStepType.Content,
];

@Component( {
	selector: 'app-dashboard',
	template: `
		<ion-content class="content-centered">

			<div class="view-content" *ngIf="!busy && studies?.length; else nostudy">

				@if (false) {
					@for (study of studies; track study.study.id) {
						<mat-card>
							<mat-card-subtitle>{{ 'STUDY.CURRENT_STUDY_MSG' | translate }}</mat-card-subtitle>
							<mat-card-title>
								<h1>{{ study.study.name }}</h1>
							</mat-card-title>

						</mat-card>
					}
				}

				@if (timeline.length) {
					<mat-card>
						<mat-card-subtitle>{{ 'STUDY.DAY_SCHEDULE_LBL' | translate }}</mat-card-subtitle>

						<ul class="timeline">
							<li class="trail"></li>
							@for (item of timeline; track item.time) {
								<li [ngClass]="item.type">
									<span class="time">{{ item.timeLabel }}</span>
									<span class="head"></span>
									<span class="title">{{ item.title }}</span>

									@if (item.type === 'action' || item.type === 'content') {
										<span class="actions">
											<button mat-flat-button color="primary">
												{{
													item.type === 'action' ? 'log' : item.type === 'content' ? 'read' : ''
												}}
											</button>
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
									<button mat-flat-button color="accent">
										{{ action.title || action.key }}
									</button>
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
export class DashboardView implements OnInit{
	public busy = false;
	private loader!:HTMLIonLoadingElement;

	public studies:PreparedStudy[] | undefined;
	public slots:SafeSlot[] | undefined;

	public timeline:TimelineItem[] = [];
	public overdue:DayAction[] = [];
	public availableActions:DayAction[] = [];

	constructor(
		private studyService:StudyService,
		public loading:LoadingController,
		public router:Router,
		public cdr:ChangeDetectorRef,
	){

	}

	async ngOnInit(){
		this.loader = await this.loading.create( { spinner: 'crescent' } );
		this.refreshStudy()
			.subscribe( () => {
				// check if can add new entry
				//				this.router.navigate(['/log/new'])
			} );
	}

	public refreshStudy():Observable<PreparedStudy[]>{
		this.busy = true;
		this.loader.present();
		this.cdr.markForCheck();

		return this.studyService.refreshStudies()
			.pipe(
				tap( studies => {
					this.studies = studies;

					this.processSchedule();

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
				} );
				timelineItems.push( {
					type: 'marker',
					time: endOfDay,
					timeLabel: minutesToTime( endOfDay ),
					title: 'End of Day',
				} );


				for( const slot of study.schedule.slots ){

					allSlots.push( slot );

					const isAction = slot.steps?.find( step => actionStepTypes.includes( step.type ) );
					const isContent = slot.steps?.length && !( slot.steps?.find( step => !contentStepTypes.includes( step.type ) ) );


					if( slot.date ){
						// TODO: implement "on date" functionality
					}


					if( slot.availability?.allDay || slot.availability?.start == null ){
						allDaySlots.push( slot );

						if( isAction )
							allDayActions.push( {
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

								slot,
								state: 'todo',
								title: slot.name,
							} );

						}else if( isContent ){
							timelineItems.push( {
								type: 'content',
								time: startMinutes,
								timeLabel: minutesToTime( startMinutes ),
								slot,
							} );

						}else{
							timelineItems.push( {
								type: 'slot',
								time: startMinutes,
								timeLabel: minutesToTime( startMinutes ),
								title: slot.name || slot.key,
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
