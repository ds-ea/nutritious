import dayjs from 'dayjs';
import { type TranslateService } from '@ngx-translate/core';
import {
	containsActionStep,
	containsOnlyContentSteps,
	humanReadableDays,
	minutesToTime,
	PreparedSchedule,
	PublicStudy,
	ResponseLog,
	ResponseLogEntry,
	ResponseLogState,
	SafeSlot,
} from '../../../../../../libs/core/src';


export enum ActionState{
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

export type ActionStates = `${ ActionState }`;


export type TimelineItem = {
	type:'marker' | 'slot' | 'action' | 'trail' | 'content' | 'boundary' | 'now';
	time:number;
	timeLabel?:string;
} & DayAction;

export type DayAction = {
	study?:PublicStudy;
	slot?:SafeSlot;
	title?:string;
	state?:ActionStates;
	available?:boolean;
	hint?:string;
	key?:SafeSlot['key'];

	doneCount?:number;
}

export type ScheduleActions = {
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


/**
 * Pure scheduling engine: given a study's prepared schedule, a day, and the participant's local
 * response log, work out what the participant sees and may do on that day.
 *
 * Extracted from DashboardView so it can be tested without a TestBed. Everything it needs arrives
 * as an argument - keep it that way, and extend process-schedule.spec.ts alongside any change.
 */
export function processSchedule(
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
