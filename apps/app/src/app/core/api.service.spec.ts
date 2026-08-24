import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ApiService, CallMethod } from './api.service';
import { ConfigService } from './config.service';


/**
 * ApiService is the single choke point for every call the app makes: base URL assembly, the bearer
 * token, and the 401 handling that drives the "session expired" logout. A regression here is
 * invisible in unit terms but takes the whole app down on device.
 */
describe( 'ApiService', () => {

	let service:ApiService;
	let http:HttpTestingController;

	// null, not undefined - passing undefined would silently fall back to the default parameter
	function configure( apiUrl:string | null = 'https://api.example.org' ){
		TestBed.configureTestingModule( {
			providers: [
				provideHttpClient(),
				provideHttpClientTesting(),
				{ provide: ConfigService, useValue: { get: () => apiUrl ?? undefined } },
			],
		} );

		service = TestBed.inject( ApiService );
		http = TestBed.inject( HttpTestingController );
	}

	afterEach( () => http?.verify() );


	describe( 'url assembly', () => {

		it( 'joins the base url and the call path', () => {
			configure( 'https://api.example.org' );
			service.get( 'auth/me' ).subscribe();

			http.expectOne( 'https://api.example.org/auth/me' ).flush( {} );
		} );

		it( 'does not double up the separator when the base url already ends in a slash', () => {
			configure( 'https://api.example.org/' );
			service.get( 'auth/me' ).subscribe();

			http.expectOne( 'https://api.example.org/auth/me' ).flush( {} );
		} );

		it( 'prefers an explicit base url over the configured one', () => {
			configure( 'https://api.example.org' );
			service.get( 'auth/me', undefined, {}, 'https://other.example.org' ).subscribe();

			http.expectOne( 'https://other.example.org/auth/me' ).flush( {} );
		} );

		it( 'throws rather than issuing a request against an undefined host', () => {
			configure( null );

			expect( () => service.get( 'auth/me' ) ).toThrow( 'API base url was not set' );
		} );

	} );


	describe( 'payload placement', () => {

		it( 'sends data as query params on GET', () => {
			configure();
			service.get( 'study/studies', { since: '2026-01-01' } ).subscribe();

			const req = http.expectOne( r => r.url === 'https://api.example.org/study/studies' );
			expect( req.request.params.get( 'since' ) ).toBe( '2026-01-01' );
			expect( req.request.body ).toBeNull();
			req.flush( {} );
		} );

		it( 'sends data as a body on POST', () => {
			configure();
			service.post( 'auth/login', { participant: 'p1', password: 'pw' } ).subscribe();

			const req = http.expectOne( 'https://api.example.org/auth/login' );
			expect( req.request.method ).toBe( 'POST' );
			expect( req.request.body ).toEqual( { participant: 'p1', password: 'pw' } );
			req.flush( {} );
		} );

		it( 'defaults to GET without data and POST with data', () => {
			configure();
			service.call( 'a' ).subscribe();
			expect( http.expectOne( 'https://api.example.org/a' ).request.method ).toBe( 'GET' );

			service.call( 'b', { x: 1 } ).subscribe();
			expect( http.expectOne( 'https://api.example.org/b' ).request.method ).toBe( 'POST' );

			http.verify();
		} );

	} );


	describe( 'authorization', () => {

		it( 'omits the header when no token is set', () => {
			configure();
			service.get( 'auth/me' ).subscribe();

			const req = http.expectOne( 'https://api.example.org/auth/me' );
			expect( req.request.headers.get( 'Authorization' ) ).toBeNull();
			req.flush( {} );
		} );

		it( 'sends a bearer token once one is set', () => {
			configure();
			service.setToken( 'token-123' );
			service.get( 'auth/me' ).subscribe();

			const req = http.expectOne( 'https://api.example.org/auth/me' );
			expect( req.request.headers.get( 'Authorization' ) ).toBe( 'Bearer token-123' );
			req.flush( {} );
		} );

		it( 'omits the token when the call opts out with noAuth', () => {
			configure();
			service.setToken( 'token-123' );
			service.post( 'study/signup', { key: 'k' }, { noAuth: true } ).subscribe();

			const req = http.expectOne( 'https://api.example.org/study/signup' );
			expect( req.request.headers.get( 'Authorization' ) ).toBeNull();
			req.flush( {} );
		} );

		it( 'stops sending the token after it is cleared on logout', () => {
			configure();
			service.setToken( 'token-123' );
			service.setToken( undefined );
			service.get( 'auth/me' ).subscribe();

			const req = http.expectOne( 'https://api.example.org/auth/me' );
			expect( req.request.headers.get( 'Authorization' ) ).toBeNull();
			req.flush( {} );
		} );

	} );


	describe( 'cache busting', () => {

		it( 'adds no-cache headers when asked', () => {
			configure();
			service.get( 'study/studies', undefined, { nocache: true } ).subscribe();

			const req = http.expectOne( 'https://api.example.org/study/studies' );
			expect( req.request.headers.get( 'Cache-Control' ) ).toBe( 'no-cache' );
			expect( req.request.headers.get( 'Pragma' ) ).toBe( 'no-cache' );
			req.flush( {} );
		} );

	} );


	describe( '401 handling', () => {

		it( 'emits unauthorized so the app can show "session expired" and log out', () => {
			configure();
			const unauthorized = jest.fn();
			service.unauthorized.subscribe( unauthorized );

			service.get( 'study/studies' ).subscribe( { error: () => undefined } );
			http.expectOne( 'https://api.example.org/study/studies' )
				.flush( 'nope', { status: 401, statusText: 'Unauthorized' } );

			expect( unauthorized ).toHaveBeenCalledTimes( 1 );
			expect( unauthorized.mock.calls[0][0] ).toBeInstanceOf( HttpErrorResponse );
		} );

		it( 'stays quiet when the call opts out with ignore401', () => {
			configure();
			const unauthorized = jest.fn();
			service.unauthorized.subscribe( unauthorized );

			service.post( 'auth/login', { participant: 'p' }, { ignore401: true } )
				.subscribe( { error: () => undefined } );
			http.expectOne( 'https://api.example.org/auth/login' )
				.flush( 'nope', { status: 401, statusText: 'Unauthorized' } );

			expect( unauthorized ).not.toHaveBeenCalled();
		} );

		it( 'does not emit unauthorized for other error statuses', () => {
			configure();
			const unauthorized = jest.fn();
			service.unauthorized.subscribe( unauthorized );

			service.get( 'study/studies' ).subscribe( { error: () => undefined } );
			http.expectOne( 'https://api.example.org/study/studies' )
				.flush( 'boom', { status: 500, statusText: 'Server Error' } );

			expect( unauthorized ).not.toHaveBeenCalled();
		} );

		it( 'still surfaces the error to the caller after emitting unauthorized', () => {
			configure();
			const onError = jest.fn();

			service.get( 'study/studies' ).subscribe( { error: onError } );
			http.expectOne( 'https://api.example.org/study/studies' )
				.flush( 'nope', { status: 401, statusText: 'Unauthorized' } );

			expect( onError ).toHaveBeenCalledTimes( 1 );
		} );

	} );


	it( 'exposes the expected verbs', () => {
		expect( CallMethod.GET ).toBe( 'GET' );
		expect( CallMethod.POST ).toBe( 'POST' );
	} );

} );
