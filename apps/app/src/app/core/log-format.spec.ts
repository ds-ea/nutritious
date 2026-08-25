import { describeError } from './log-format';


/**
 * Capacitor's Android bridge stringifies each console argument, so an object passed as a second
 * argument reaches logcat as "[object Object]". Everything here exists to make sure the detail
 * survives into the message itself.
 */
describe( 'describeError', () => {

	it( 'never returns [object Object]', () => {
		const cases:unknown[] = [
			new Error( 'boom' ),
			{ status: 500, message: 'server exploded' },
			{ some: 'plain object' },
			'a string',
			null,
			undefined,
			42,
		];

		for( const value of cases )
			expect( describeError( value ) ).not.toContain( '[object Object]' );
	} );

	it( 'describes an Error by name and message', () => {
		expect( describeError( new TypeError( 'not a function' ) ) ).toBe( 'TypeError: not a function' );
	} );

	it( 'describes an HTTP failure by status', () => {
		expect( describeError( { status: 401, statusText: 'Unauthorized' } ) ).toBe( 'HTTP 401 Unauthorized' );
	} );

	it( 'prefers a string error body over statusText', () => {
		expect( describeError( { status: 422, statusText: 'Unprocessable', error: 'signup code expired' } ) )
			.toBe( 'HTTP 422 signup code expired' );
	} );

	it( 'reports a bare status when there is no detail', () => {
		expect( describeError( { status: 0 } ) ).toBe( 'HTTP 0' );
	} );

	it( 'passes strings through', () => {
		expect( describeError( 'plain message' ) ).toBe( 'plain message' );
	} );

	it( 'serializes plain objects', () => {
		expect( describeError( { code: 'E_OFFLINE', retryable: true } ) )
			.toBe( '{"code":"E_OFFLINE","retryable":true}' );
	} );

	it( 'handles null and undefined', () => {
		expect( describeError( null ) ).toBe( 'unknown error' );
		expect( describeError( undefined ) ).toBe( 'unknown error' );
	} );

	it( 'survives a circular structure', () => {
		const circular:Record<string, unknown> = { name: 'loop' };
		circular['self'] = circular;

		expect( () => describeError( circular ) ).not.toThrow();
	} );

} );
