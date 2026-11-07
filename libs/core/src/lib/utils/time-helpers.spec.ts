import { hoursToTime, humanReadableDays, minutesToTime } from './time-helpers';


describe( 'minutesToTime', () => {

	it( 'formats minutes as zero-padded HH:MM', () => {
		expect( minutesToTime( 0 ) ).toBe( '00:00' );
		expect( minutesToTime( 5 ) ).toBe( '00:05' );
		expect( minutesToTime( 480 ) ).toBe( '08:00' );
		expect( minutesToTime( 1439 ) ).toBe( '23:59' );
	} );

	it( 'wraps past 24h, so a schedule running over midnight still renders', () => {
		expect( minutesToTime( 1440 ) ).toBe( '00:00' );
		expect( minutesToTime( 1500 ) ).toBe( '01:00' );
	} );

	it( 'returns an empty string for null and undefined', () => {
		expect( minutesToTime( null ) ).toBe( '' );
		expect( minutesToTime( undefined ) ).toBe( '' );
	} );

	it( 'does not treat 0 as absent', () => {
		expect( minutesToTime( 0 ) ).not.toBe( '' );
	} );

} );


describe( 'hoursToTime', () => {

	it( 'formats whole hours', () => {
		expect( hoursToTime( 0 ) ).toBe( '00:00' );
		expect( hoursToTime( 9 ) ).toBe( '09:00' );
		expect( hoursToTime( 23 ) ).toBe( '23:00' );
	} );

} );


describe( 'humanReadableDays', () => {

	it( 'returns undefined for no days', () => {
		expect( humanReadableDays( undefined ) ).toBeUndefined();
		expect( humanReadableDays( [] ) ).toBeUndefined();
	} );

	it( 'collapses Saturday+Sunday to "weekends"', () => {
		expect( humanReadableDays( [ 0, 6 ] ) ).toEqual( [ 'weekends' ] );
	} );

	it( 'collapses Mon-Fri to "weekdays"', () => {
		expect( humanReadableDays( [ 1, 2, 3, 4, 5 ] ) ).toEqual( [ 'weekdays' ] );
	} );

	it( 'lists individual days otherwise', () => {
		expect( humanReadableDays( [ 1, 3 ] ) ).toEqual( [ 'MON', 'WED' ] );
		expect( humanReadableDays( [ 0 ] ) ).toEqual( [ 'SUN' ] );
	} );

	it( 'does not collapse a 5-day set that includes a weekend day', () => {
		expect( humanReadableDays( [ 0, 1, 2, 3, 4 ] ) ).toEqual( [ 'SUN', 'MON', 'TUE', 'WED', 'THU' ] );
	} );

	it( 'emits translation keys and resolves them when given a TranslateService', () => {
		const translate = { instant: jest.fn( ( key:string ) => `t(${ key })` ) } as any;

		expect( humanReadableDays( [ 1, 3 ], translate ) )
			.toEqual( [ 't(DATE.DAY_MON_SHORT)', 't(DATE.DAY_WED_SHORT)' ] );

		expect( humanReadableDays( [ 0, 6 ], translate ) ).toEqual( [ 't(DATE.WEEKENDS)' ] );
	} );

	it( 'honours a custom translation suffix', () => {
		const translate = { instant: jest.fn( ( key:string ) => key ) } as any;

		expect( humanReadableDays( [ 5 ], translate, '' ) ).toEqual( [ 'DATE.DAY_FRI' ] );
	} );

} );
