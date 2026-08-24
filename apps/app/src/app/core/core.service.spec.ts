import { EventEmitter } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { of, Subject, throwError } from 'rxjs';
import { ParticipantAccount } from '../../../../../libs/core/src';
import { ApiService } from './api.service';
import { CoreService } from './core.service';


jest.mock( '@capacitor/preferences', () => {
	const store = new Map<string, string>();
	return {
		__store: store,
		Preferences: {
			get: jest.fn( async ( { key }:{ key:string } ) => ( { value: store.get( key ) ?? null } ) ),
			set: jest.fn( async ( { key, value }:{ key:string, value:string } ) => void store.set( key, value ) ),
			remove: jest.fn( async ( { key }:{ key:string } ) => void store.delete( key ) ),
			clear: jest.fn( async () => store.clear() ),
		},
	};
} );

const store = ( jest.requireMock( '@capacitor/preferences' ) as { __store:Map<string, string> } ).__store;


/**
 * Session state lives in @capacitor/preferences, so this is the spec most exposed to a Capacitor
 * major upgrade: if restoreAuth stops finding the stored account, every participant is silently
 * logged out on update and has to re-enrol - which for a study means losing the participant.
 */
describe( 'CoreService', () => {

	let api:{ setToken:jest.Mock, post:jest.Mock, unauthorized:EventEmitter<Error> };
	let alertController:{ create:jest.Mock };
	let translate:{ instant:jest.Mock, onLangChange:Subject<{ lang:string }> };
	let router:{ navigate:jest.Mock };
	let service:CoreService;

	const account = ( id:string, over:Partial<ParticipantAccount> = {} ):ParticipantAccount => ( {
		token: `token-${ id }`,
		participant: { id },
		...over,
	} as ParticipantAccount );

	function build(){
		return new CoreService(
			api as unknown as ApiService,
			alertController as never,
			translate as never,
			router as never,
		);
	}

	beforeEach( () => {
		store.clear();
		jest.clearAllMocks();

		api = { setToken: jest.fn(), post: jest.fn(), unauthorized: new EventEmitter<Error>() };
		alertController = {
			create: jest.fn().mockResolvedValue( {
				present: jest.fn().mockResolvedValue( undefined ),
				onDidDismiss: jest.fn().mockResolvedValue( { role: 'ok' } ),
			} ),
		};
		translate = { instant: jest.fn( ( k:string ) => k ), onLangChange: new Subject() };
		router = { navigate: jest.fn() };

		service = build();
	} );


	describe( 'restoreAuth', () => {

		it( 'returns undefined when nothing is stored', async () => {
			expect( await service.restoreAuth() ).toBeUndefined();
			expect( api.setToken ).not.toHaveBeenCalled();
		} );

		it( 'restores the account named by the stored state', async () => {
			store.set( 'accounts', JSON.stringify( [ account( 'p1' ), account( 'p2' ) ] ) );
			store.set( 'state', JSON.stringify( { participant: 'p2' } ) );

			const restored = await service.restoreAuth();

			expect( restored?.participant.id ).toBe( 'p2' );
			expect( api.setToken ).toHaveBeenCalledWith( 'token-p2' );
			expect( service.account?.participant.id ).toBe( 'p2' );
		} );

		it( 'falls back to the first account when no state is stored', async () => {
			store.set( 'accounts', JSON.stringify( [ account( 'p1' ), account( 'p2' ) ] ) );

			expect( ( await service.restoreAuth() )?.participant.id ).toBe( 'p1' );
			expect( api.setToken ).toHaveBeenCalledWith( 'token-p1' );
		} );

		it( 'returns undefined when the stored state points at an account that is gone', async () => {
			store.set( 'accounts', JSON.stringify( [ account( 'p1' ) ] ) );
			store.set( 'state', JSON.stringify( { participant: 'deleted' } ) );

			expect( await service.restoreAuth() ).toBeUndefined();
			expect( api.setToken ).not.toHaveBeenCalled();
		} );

		it( 'survives corrupted stored json instead of crashing the launch', async () => {
			store.set( 'accounts', '{not json' );

			await expect( service.restoreAuth() ).resolves.toBeUndefined();
		} );

		it( 'returns undefined for an empty account list', async () => {
			store.set( 'accounts', JSON.stringify( [] ) );

			expect( await service.restoreAuth() ).toBeUndefined();
		} );

		it( 'publishes the restored account on the observable streams', async () => {
			store.set( 'accounts', JSON.stringify( [ account( 'p1' ) ] ) );

			await service.restoreAuth();

			expect( service.accounts ).toHaveLength( 1 );
			expect( service.account?.participant.id ).toBe( 'p1' );
		} );

	} );


	describe( 'login', () => {

		it( 'persists the account and token so the next launch can restore it', async () => {
			api.post.mockReturnValue( of( { token: 'fresh-token', participant: { id: 'p1' } } ) );

			const result = await new Promise( resolve => service.login( 'p1', 'pw' ).subscribe( resolve ) );

			expect( api.post ).toHaveBeenCalledWith(
				'auth/login', { participant: 'p1', password: 'pw' }, {}, undefined,
			);
			expect( api.setToken ).toHaveBeenCalledWith( 'fresh-token' );
			expect( ( result as ParticipantAccount ).participant.id ).toBe( 'p1' );

			expect( JSON.parse( store.get( 'accounts' )! ) ).toHaveLength( 1 );
			expect( JSON.parse( store.get( 'state' )! ) ).toEqual( { participant: 'p1' } );
		} );

		it( 'passes an explicit host through to the API call and records it', async () => {
			api.post.mockReturnValue( of( { token: 't', participant: { id: 'p1' }, hostName: 'Study Host' } ) );

			const result = await new Promise( r => service.login( 'p1', 'pw', 'https://other.example.org' ).subscribe( r ) );

			expect( api.post.mock.calls[0][3] ).toBe( 'https://other.example.org' );
			expect( ( result as ParticipantAccount ).host ).toBe( 'https://other.example.org' );
			expect( ( result as ParticipantAccount ).hostName ).toBe( 'Study Host' );
		} );

		it( 'updates an existing account rather than adding a duplicate', async () => {
			store.set( 'accounts', JSON.stringify( [ account( 'p1' ) ] ) );
			await service.restoreAuth();

			api.post.mockReturnValue( of( { token: 'rotated-token', participant: { id: 'p1' } } ) );
			await new Promise( r => service.login( 'p1', 'pw' ).subscribe( r ) );

			const stored = JSON.parse( store.get( 'accounts' )! );
			expect( stored ).toHaveLength( 1 );
			expect( stored[0].token ).toBe( 'rotated-token' );
		} );

		it( 'keeps a second participant alongside the first', async () => {
			store.set( 'accounts', JSON.stringify( [ account( 'p1' ) ] ) );
			await service.restoreAuth();

			api.post.mockReturnValue( of( { token: 'token-p2', participant: { id: 'p2' } } ) );
			await new Promise( r => service.login( 'p2', 'pw' ).subscribe( r ) );

			const stored = JSON.parse( store.get( 'accounts' )! );
			expect( stored.map( ( a:ParticipantAccount ) => a.participant.id ) ).toEqual( [ 'p1', 'p2' ] );
			expect( JSON.parse( store.get( 'state' )! ) ).toEqual( { participant: 'p2' } );
		} );

		it( 'fails without persisting anything when the response carries no token', async () => {
			api.post.mockReturnValue( of( { participant: { id: 'p1' } } ) );

			await expect( new Promise( ( resolve, reject ) =>
				service.login( 'p1', 'pw' ).subscribe( { next: resolve, error: reject } ),
			) ).rejects.toThrow( 'ERR.NO_ACCESS_TOKEN' );

			expect( store.has( 'accounts' ) ).toBe( false );
			expect( api.setToken ).not.toHaveBeenCalled();
		} );

		it( 'fails when the response carries no participant', async () => {
			api.post.mockReturnValue( of( { token: 't' } ) );

			await expect( new Promise( ( resolve, reject ) =>
				service.login( 'p1', 'pw' ).subscribe( { next: resolve, error: reject } ),
			) ).rejects.toThrow( 'ERR.NO_PARTICIPANT' );
		} );

		it( 'propagates a transport error without touching stored state', async () => {
			api.post.mockReturnValue( throwError( () => new Error( 'offline' ) ) );

			await expect( new Promise( ( resolve, reject ) =>
				service.login( 'p1', 'pw' ).subscribe( { next: resolve, error: reject } ),
			) ).rejects.toThrow( 'offline' );

			expect( store.has( 'accounts' ) ).toBe( false );
		} );

	} );


	describe( 'signup', () => {

		it( 'checks a study without enrolling', async () => {
			api.post.mockReturnValue( of( { study: { id: 's1', name: 'S' } } ) );

			await new Promise( r => service.signupCheck( 'key', 'code' ).subscribe( r ) );

			expect( api.post ).toHaveBeenCalledWith( 'study/signup', { key: 'key', code: 'code' }, {}, undefined );
		} );

		it( 'enrols with the signup flag and the chosen badge', async () => {
			api.post.mockReturnValue( of( { study: { id: 's1' }, credentials: {} } ) );

			await new Promise( r => service.signup( 'key', 'code', 'badge-7', 'https://h' ).subscribe( r ) );

			expect( api.post ).toHaveBeenCalledWith(
				'study/signup',
				{ key: 'key', code: 'code', participant: 'badge-7', signup: true },
				{},
				'https://h',
			);
		} );

	} );


	describe( 'logout', () => {

		it( 'clears the token, stored preferences and session, then routes to login', async () => {
			store.set( 'accounts', JSON.stringify( [ account( 'p1' ) ] ) );
			await service.restoreAuth();

			await service.logout( true );

			expect( api.setToken ).toHaveBeenLastCalledWith( undefined );
			expect( Preferences.clear ).toHaveBeenCalled();
			expect( store.size ).toBe( 0 );
			expect( service.account ).toBeUndefined();
			expect( router.navigate ).toHaveBeenCalledWith( [ '/login' ] );
		} );

		it( 'notifies subscribers so dependent caches can drop their data', async () => {
			const onLogout = jest.fn();
			service.logout$.subscribe( onLogout );

			await service.logout( true );

			expect( onLogout ).toHaveBeenCalledWith( true );
		} );

		it( 'asks for confirmation and aborts when the user cancels', async () => {
			alertController.create.mockResolvedValue( {
				present: jest.fn().mockResolvedValue( undefined ),
				onDidDismiss: jest.fn().mockResolvedValue( { role: 'cancel' } ),
			} );
			store.set( 'accounts', JSON.stringify( [ account( 'p1' ) ] ) );
			await service.restoreAuth();

			await service.logout();

			expect( router.navigate ).not.toHaveBeenCalled();
			expect( service.account?.participant.id ).toBe( 'p1' );
			expect( store.has( 'accounts' ) ).toBe( true );
		} );

	} );


	describe( 'expired session handling', () => {

		it( 'logs out and warns the user when the API reports 401', async () => {
			store.set( 'accounts', JSON.stringify( [ account( 'p1' ) ] ) );
			await service.restoreAuth();

			api.unauthorized.emit( new Error( '401' ) );
			await new Promise( r => setTimeout( r, 0 ) );

			expect( translate.instant ).toHaveBeenCalledWith( 'USER.MSG_SESSION_EXPIRED' );
			expect( router.navigate ).toHaveBeenCalledWith( [ '/login' ] );
		} );

		it( 'does not ask for confirmation when the session expired', async () => {
			api.unauthorized.emit( new Error( '401' ) );
			await new Promise( r => setTimeout( r, 0 ) );

			expect( alertController.create ).toHaveBeenCalledTimes( 1 );
			expect( alertController.create.mock.calls[0][0].message ).toBe( 'USER.MSG_SESSION_EXPIRED' );
		} );

	} );


	it( 'persists the chosen language when it changes', () => {
		translate.onLangChange.next( { lang: 'de' } );

		expect( Preferences.set ).toHaveBeenCalledWith( { key: 'lang', value: 'de' } );
	} );

} );
