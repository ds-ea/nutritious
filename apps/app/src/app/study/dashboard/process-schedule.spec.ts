import dayjs from 'dayjs';
import {
	PreparedSchedule,
	PreparedSlot,
	PublicStudy,
	ResponseLog,
	ResponseLogEntry,
	ResponseLogState,
	StudyStepType,
} from '../../../../../../libs/core/src';
import { processSchedule } from './process-schedule';


/**
 * The scheduling engine decides what a participant is shown and allowed to do each day, so these
 * cases are written around a fixed clock. `day` is always derived from `now` by whole days, which
 * is how DashboardView calls it - the function relies on `day` carrying the same wall-clock time
 * as `now` to locate midnight.
 */

const STUDY:PublicStudy = { id: 'study1', name: 'Test Study' };

// Wednesday 2026-08-19, 12:00 local
const NOW = dayjs( '2026-08-19T12:00:00' );
const WEDNESDAY = 3;

const actionStep = { id: 'step1', type: StudyStepType.Form, ref: 'form1' } as never;
const contentStep = { id: 'step2', type: StudyStepType.Content, ref: 'content1' } as never;


function slot( over:Partial<PreparedSlot> = {} ):PreparedSlot{
	return {
		id: 'slot1',
		key: 'slot-key',
		name: 'A Slot',
		translations: null,
		event: null,
		date: null,
		availability: null,
		constraints: null,
		reminders: null,
		dependsOn: null,
		steps: [ actionStep ],
		...over,
	} as PreparedSlot;
}

function schedule( slots:PreparedSlot[], daySetup:unknown[] = [] ):PreparedSchedule{
	return {
		schedule: { id: 'sched1', daySetup, weekSetup: null },
		slots,
	} as unknown as PreparedSchedule;
}

function logWith( entries:Partial<ResponseLogEntry>[] ):ResponseLog{
	return {
		study: STUDY.id,
		dayIndex: {},
		entries: entries.map( ( e, i ) => ( {
			study: STUDY.id,
			uid: `uid${ i }`,
			suid: `suid${ i }`,
			date: NOW.toISOString(),
			forDay: NOW.format( 'YYYY-MM-DD' ),
			slot: 'slot1',
			state: ResponseLogState.Done,
			...e,
		} ) as ResponseLogEntry ),
	};
}

/** run for "today" unless a day offset into the past is given */
function run( prepared:PreparedSchedule, log?:ResponseLog, daysAgo = 0 ){
	return processSchedule( STUDY, prepared, NOW.clone().subtract( daysAgo, 'day' ), NOW, log );
}


describe( 'processSchedule', () => {

	describe( 'empty schedule detection', () => {

		it( 'reports an empty schedule when no slot has steps', () => {
			expect( run( schedule( [ slot( { steps: [] } ) ] ) ).emptySchedule ).toBe( true );
		} );

		it( 'reports a non-empty schedule as soon as one slot has steps', () => {
			expect( run( schedule( [ slot( { steps: [] } ), slot( { id: 'slot2' } ) ] ) ).emptySchedule )
				.toBe( false );
		} );

		it( 'reports empty for a schedule with no slots at all', () => {
			expect( run( schedule( [] ) ).emptySchedule ).toBe( true );
		} );

	} );


	describe( 'all-day slots', () => {

		it( 'treats a slot with no availability as all-day and available', () => {
			const result = run( schedule( [ slot() ] ) );

			expect( result.allDay ).toHaveLength( 1 );
			expect( result.allDay[0].state ).toBe( 'todo' );
			expect( result.available ).toHaveLength( 1 );
			expect( result.timeline.filter( i => i.type !== 'marker' ) ).toHaveLength( 0 );
		} );

		it( 'honours an explicit allDay flag even when a start time is present', () => {
			const result = run( schedule( [ slot( { availability: { allDay: true, start: 480, days: [] } as never } ) ] ) );

			expect( result.allDay ).toHaveLength( 1 );
		} );

		it( 'routes content-only slots to allDayContent rather than allDay', () => {
			const result = run( schedule( [ slot( { steps: [ contentStep ] } ) ] ) );

			expect( result.allDayContent ).toHaveLength( 1 );
			expect( result.allDay ).toHaveLength( 0 );
		} );

		it( 'marks an obligatory all-day slot from a past day as overdue while its window is still open', () => {
			// overdue only exists while yesterday can still be filled in, which needs a day grace
			// long enough to reach into today - a 24h grace keeps yesterday open until midnight
			const result = run(
				schedule(
					[ slot( { constraints: { obligatory: true } as never } ) ],
					[ { days: [ 0, 1, 2, 3, 4, 5, 6 ], grace: 24 * 60 } ],
				),
				undefined,
				1,
			);

			expect( result.overdue ).toHaveLength( 1 );
			expect( result.overdue[0].state ).toBe( 'overdue' );
		} );

		it( 'stops reporting a past day as overdue once its grace window has closed', () => {
			// with no grace, yesterday's entry window shut at midnight - nothing is actionable
			const result = run(
				schedule( [ slot( { constraints: { obligatory: true } as never } ) ] ),
				undefined,
				1,
			);

			expect( result.overdue ).toHaveLength( 0 );
			expect( result.available ).toHaveLength( 0 );
			expect( result.allDay[0].available ).toBe( false );
		} );

		it( 'does not mark a non-obligatory slot from a past day as overdue', () => {
			const result = run(
				schedule( [ slot() ], [ { days: [ 0, 1, 2, 3, 4, 5, 6 ], grace: 24 * 60 } ] ),
				undefined,
				1,
			);

			expect( result.overdue ).toHaveLength( 0 );
			expect( result.available ).toHaveLength( 1 );
		} );

		it( 'does not mark today\'s obligatory slot as overdue', () => {
			const result = run( schedule( [ slot( { constraints: { obligatory: true } as never } ) ] ) );

			expect( result.overdue ).toHaveLength( 0 );
		} );

	} );


	describe( 'day-of-week availability', () => {

		it( 'marks a slot unavailable on a day it is not scheduled for', () => {
			// NOW is a Wednesday (3); allow only Monday
			const result = run( schedule( [ slot( { availability: { days: [ 1 ] } as never } ) ] ) );

			expect( result.allDay[0].state ).toBe( 'unavailable' );
			expect( result.allDay[0].available ).toBe( false );
			expect( result.available ).toHaveLength( 0 );
		} );

		it( 'leaves a slot available on a day it is scheduled for', () => {
			const result = run( schedule( [ slot( { availability: { days: [ WEDNESDAY ] } as never } ) ] ) );

			expect( result.allDay[0].available ).toBe( true );
		} );

		it( 'treats an empty days array as "every day"', () => {
			const result = run( schedule( [ slot( { availability: { days: [] } as never } ) ] ) );

			expect( result.allDay[0].available ).toBe( true );
		} );

	} );


	describe( 'response constraints', () => {

		it( 'counts done, pending and local responses towards doneCount', () => {
			const result = run( schedule( [ slot() ] ), logWith( [
				{ suid: 'a', state: ResponseLogState.Done },
				{ suid: 'b', state: ResponseLogState.Pending },
				{ suid: 'c', state: ResponseLogState.Local },
			] ) );

			expect( result.allDay[0].doneCount ).toBe( 3 );
		} );

		it( 'does not count incomplete responses', () => {
			const result = run( schedule( [ slot() ] ), logWith( [
				{ suid: 'a', state: ResponseLogState.Incomplete },
			] ) );

			expect( result.allDay[0].doneCount ).toBe( 0 );
		} );

		it( 'deduplicates multiple entries sharing a slot response id', () => {
			// one slot run emits one entry per step, all sharing a suid - it must count once
			const result = run( schedule( [ slot() ] ), logWith( [
				{ uid: 'u1', suid: 'same' },
				{ uid: 'u2', suid: 'same' },
				{ uid: 'u3', suid: 'same' },
			] ) );

			expect( result.allDay[0].doneCount ).toBe( 1 );
		} );

		it( 'ignores responses belonging to a different slot', () => {
			const result = run( schedule( [ slot() ] ), logWith( [ { slot: 'other-slot' } ] ) );

			expect( result.allDay[0].doneCount ).toBe( 0 );
		} );

		it( 'closes the slot once max responses are reached', () => {
			const result = run(
				schedule( [ slot( { constraints: { max: 2 } as never } ) ] ),
				logWith( [ { suid: 'a' }, { suid: 'b' } ] ),
			);

			expect( result.allDay[0].state ).toBe( 'done' );
			expect( result.allDay[0].available ).toBe( false );
			expect( result.available ).toHaveLength( 0 );
		} );

		it( 'keeps the slot open below max', () => {
			const result = run(
				schedule( [ slot( { constraints: { max: 2 } as never } ) ] ),
				logWith( [ { suid: 'a' } ] ),
			);

			expect( result.allDay[0].state ).toBe( 'todo' );
			expect( result.allDay[0].available ).toBe( true );
		} );

		it( 'keeps the slot on todo while below min but already started', () => {
			const result = run(
				schedule( [ slot( { constraints: { min: 3 } as never } ) ] ),
				logWith( [ { suid: 'a' } ] ),
			);

			expect( result.allDay[0].state ).toBe( 'todo' );
		} );

	} );


	describe( 'timed slots', () => {

		// availability.start is an offset from start-of-day, so with no daySetup 480 == 08:00
		const timed = ( over:Record<string, unknown> = {} ) =>
			slot( { availability: { days: [], start: 480, duration: 60, ...over } as never } );

		it( 'places the slot on the timeline at its start time', () => {
			const result = run( schedule( [ timed() ] ) );
			const item = result.timeline.find( i => i.type === 'action' );

			expect( item ).toBeDefined();
			expect( item!.time ).toBe( 480 );
			expect( item!.timeLabel ).toBe( '08:00' );
		} );

		it( 'stays available after its window when no graceEnd is set', () => {
			// NOW is 12:00, the window was 08:00-09:00; without graceEnd availability runs to
			// end of day, which is what keeps "log it later today" working
			const result = run( schedule( [ timed() ] ) );

			expect( result.available ).toHaveLength( 1 );
			expect( result.missed ).toHaveLength( 0 );
			expect( result.unfulfilled ).toHaveLength( 0 );
		} );

		it( 'is upcoming before its graceStart window opens', () => {
			// starts at 20:00 with a 30 minute lead-in, so at 12:00 it is not open yet
			const result = run( schedule( [ timed( { start: 1200, graceStart: 30 } ) ] ) );

			expect( result.upcoming ).toHaveLength( 1 );
			expect( result.upcoming[0].state ).toBe( 'upcoming' );
			expect( result.upcoming[0].available ).toBe( false );
			expect( result.available ).toHaveLength( 0 );
		} );

		it( 'opens once inside the graceStart window', () => {
			// starts 13:00, opens 30 minutes early at 12:30 - still closed at 12:00
			expect( run( schedule( [ timed( { start: 780, graceStart: 30 } ) ] ) ).upcoming ).toHaveLength( 1 );

			// starts 13:00, opens 90 minutes early at 11:30 - open at 12:00
			expect( run( schedule( [ timed( { start: 780, graceStart: 90 } ) ] ) ).available ).toHaveLength( 1 );
		} );

		it( 'is available all day when graceStart is unset, even before its start time', () => {
			const result = run( schedule( [ timed( { start: 1200 } ) ] ) );

			expect( result.upcoming ).toHaveLength( 0 );
			expect( result.available ).toHaveLength( 1 );
		} );

		it( 'is unfulfilled once past graceEnd when not obligatory', () => {
			// 08:00-09:00 plus 30 minutes grace closes at 09:30, now is 12:00
			const result = run( schedule( [ timed( { graceEnd: 30 } ) ] ) );

			expect( result.unfulfilled ).toHaveLength( 1 );
			expect( result.unfulfilled[0].state ).toBe( 'unfulfilled' );
			expect( result.missed ).toHaveLength( 0 );
			expect( result.available ).toHaveLength( 0 );
		} );

		it( 'is missed once past graceEnd when obligatory', () => {
			const result = run( schedule( [
				slot( {
					availability: { days: [], start: 480, duration: 60, graceEnd: 30 } as never,
					constraints: { obligatory: true } as never,
				} ),
			] ) );

			expect( result.missed ).toHaveLength( 1 );
			expect( result.missed[0].state ).toBe( 'missed' );
			expect( result.unfulfilled ).toHaveLength( 0 );
		} );

		it( 'is still available inside its graceEnd window', () => {
			// 08:00-09:00 plus 240 minutes grace closes at 13:00, now is 12:00
			const result = run( schedule( [ timed( { graceEnd: 240 } ) ] ) );

			expect( result.available ).toHaveLength( 1 );
			expect( result.unfulfilled ).toHaveLength( 0 );
		} );

		it( 'measures graceEnd from the start when the slot has no duration', () => {
			// point-in-time slot at 08:00 with 30 minutes grace closed at 08:30
			const result = run( schedule( [ timed( { duration: undefined, graceEnd: 30 } ) ] ) );

			expect( result.unfulfilled ).toHaveLength( 1 );
		} );

		it( 'marks an obligatory timed slot from a past day as overdue while still open', () => {
			const result = run(
				schedule(
					[ slot( {
						availability: { days: [], start: 480, duration: 60 } as never,
						constraints: { obligatory: true } as never,
					} ) ],
					[ { days: [ 0, 1, 2, 3, 4, 5, 6 ], grace: 24 * 60 } ],
				),
				undefined,
				1,
			);

			expect( result.overdue ).toHaveLength( 1 );
			expect( result.overdue[0].state ).toBe( 'overdue' );
		} );

		it( 'labels content-only timed slots as content', () => {
			const result = run( schedule( [ slot( {
				steps: [ contentStep ],
				availability: { days: [], start: 480 } as never,
			} ) ] ) );

			expect( result.timeline.find( i => i.type === 'content' ) ).toBeDefined();
		} );

	} );


	describe( 'day setup', () => {

		it( 'offsets slot start times by the configured start of day', () => {
			// day starts at 06:00, slot is 120 minutes after that => 08:00
			const result = run( schedule(
				[ slot( { availability: { days: [], start: 120 } as never } ) ],
				[ { days: [ 0, 1, 2, 3, 4, 5, 6 ], start: 360, end: 1320 } ],
			) );

			const item = result.timeline.find( i => i.type === 'action' );
			expect( item!.time ).toBe( 480 );
			expect( item!.timeLabel ).toBe( '08:00' );
		} );

		it( 'closes entry for the day once past end of day plus grace', () => {
			// day ends 10:00 with 30 minutes grace => closed at 10:30, now is 12:00
			const result = run( schedule(
				[ slot() ],
				[ { days: [ 0, 1, 2, 3, 4, 5, 6 ], start: 0, end: 600, grace: 30 } ],
			) );

			expect( result.allDay[0].available ).toBe( false );
			expect( result.available ).toHaveLength( 0 );
		} );

		it( 'keeps entry open while inside the end-of-day grace period', () => {
			// day ends 11:00, grace 120 minutes => closes 13:00, now is 12:00
			const result = run( schedule(
				[ slot() ],
				[ { days: [ 0, 1, 2, 3, 4, 5, 6 ], start: 0, end: 660, grace: 120 } ],
			) );

			expect( result.allDay[0].available ).toBe( true );
		} );

		it( 'extends a day that ends before it starts across midnight', () => {
			// 20:00 -> 04:00 next day; the end marker is pushed past 24h rather than going negative
			const result = run( schedule(
				[ slot() ],
				[ { days: [ 0, 1, 2, 3, 4, 5, 6 ], start: 1200, end: 240 } ],
			) );

			const markers = result.timeline.filter( i => i.type === 'marker' );
			expect( markers ).toHaveLength( 2 );
			expect( markers[0].time ).toBe( 1200 );
			expect( markers[1].time ).toBe( 240 + 24 * 60 );
		} );

		it( 'only applies a day setup to the weekdays it lists', () => {
			// setup covers Monday only, so Wednesday falls back to a full 00:00-24:00 day
			const result = run( schedule(
				[ slot() ],
				[ { days: [ 1 ], start: 0, end: 600, grace: 0 } ],
			) );

			expect( result.allDay[0].available ).toBe( true );
		} );

	} );


	describe( 'timeline markers', () => {

		it( 'always appends start and end of day markers', () => {
			const markers = run( schedule( [ slot() ] ) ).timeline.filter( i => i.type === 'marker' );

			expect( markers ).toHaveLength( 2 );
			expect( markers[0].time ).toBe( 0 );
			expect( markers[1].time ).toBe( 24 * 60 );
		} );

		it( 'renders a full-length day as ending at 23:59 rather than 24:00', () => {
			const markers = run( schedule( [ slot() ] ) ).timeline.filter( i => i.type === 'marker' );

			expect( markers[1].timeLabel ).toBe( '23:59' );
		} );

	} );

} );
