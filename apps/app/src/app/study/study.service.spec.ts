import { EventEmitter } from '@angular/core';
import { BehaviorSubject, lastValueFrom, of, throwError, toArray } from 'rxjs';
import {
	ParticipantAccount,
	ResponseLog,
	ResponseLogState,
	StepResponseWithStudyId,
	SubmitResponsesPayload,
} from '../../../../../libs/core/src';
import { ApiService } from '../core/api.service';
import { CoreService } from '../core/core.service';
import { StorageService } from '../core/storage.service';
import { StudyService } from './study.service';


jest.mock( '@capacitor/preferences', () => ( {
	Preferences: {
		get: jest.fn().mockResolvedValue( { value: null } ),
		set: jest.fn().mockResolvedValue( undefined ),
		remove: jest.fn().mockResolvedValue( undefined ),
		clear: jest.fn().mockResolvedValue( undefined ),
	},
} ) );


/**
 * The offline queue is the one place in the app where a regression destroys data that cannot be
 * recovered: a participant's response exists only on their device until the server acknowledges
 * its uid. Every case here is about "was it written locally before we tried the network, and did
 * we only forget it once the server said yes".
 */

class FakeStorage{
	public readonly data = new Map<string, unknown>();
	public cleared = 0;

	private static key( key:string | string[] ):string{
		return Array.isArray( key ) ? key.join( '.' ) : key;
	}

	async set( key:string | string[], value:unknown ){
		// storage round-trips through a serializing driver, so hand back copies, not references -
		// otherwise a test can pass purely because it is holding the service's own object
		this.data.set( FakeStorage.key( key ), JSON.parse( JSON.stringify( value ) ) );
	}

	async get<T>( key:string | string[] ):Promise<T | undefined>{
		const stored = this.data.get( FakeStorage.key( key ) );
		return stored === undefined ? undefined : JSON.parse( JSON.stringify( stored ) ) as T;
	}

	async clear(){
		this.cleared++;
		this.data.clear();
	}
}


const ACCOUNT = { participant: { id: 'p1' }, token: 't' } as ParticipantAccount;

function response( over:Partial<StepResponseWithStudyId> = {} ):StepResponseWithStudyId{
	return {
		_study: 'study1',
		uid: 'uid1',
		suid: 'suid1',
		step: 'step1',
		type: 'form',
		slot: 'slot1',
		created: '2026-08-19T10:00:00.000Z',
		updated: '2026-08-19T10:00:00.000Z',
		forDay: '2026-08-19',
		data: { answer: 42 },
		...over,
	};
}

function payload( ...responses:StepResponseWithStudyId[] ):SubmitResponsesPayload{
	return { responses };
}


describe( 'StudyService', () => {

	let storage:FakeStorage;
	let api:{ get:jest.Mock, post:jest.Mock };
	let core:{ account$:BehaviorSubject<ParticipantAccount | undefined>, logout$:EventEmitter<unknown>, online$:BehaviorSubject<boolean> };
	let service:StudyService;

	beforeEach( () => {
		storage = new FakeStorage();
		api = { get: jest.fn(), post: jest.fn() };
		core = {
			account$: new BehaviorSubject<ParticipantAccount | undefined>( ACCOUNT ),
			logout$: new EventEmitter(),
			online$: new BehaviorSubject( true ),
		};

		service = new StudyService(
			api as unknown as ApiService,
			core as unknown as CoreService,
			storage as unknown as StorageService,
		);
	} );


	describe( 'getStudyLog', () => {

		it( 'returns an empty log rather than undefined for a study with no history', async () => {
			expect( await service.getStudyLog( 'study1' ) ).toEqual( {
				study: 'study1',
				entries: [],
				dayIndex: {},
			} );
		} );

		it( 'returns the stored log when one exists', async () => {
			const log:ResponseLog = { study: 'study1', entries: [], dayIndex: { '2026-08-19': [ 'uid1' ] } };
			await storage.set( [ 'log', 'study1' ], log );

			expect( await service.getStudyLog( 'study1' ) ).toEqual( log );
		} );

	} );


	describe( 'addEntryToLog', () => {

		const entry = ( over = {} ) => ( {
			study: 'study1',
			uid: 'uid1',
			suid: 'suid1',
			slot: 'slot1',
			date: '2026-08-19T10:00:00.000Z',
			forDay: '2026-08-19',
			state: ResponseLogState.Pending,
			...over,
		} ) as never;

		it( 'appends the entry and indexes it by day', () => {
			const log:ResponseLog = { study: 'study1', entries: [], dayIndex: {} };

			service.addEntryToLog( log, entry() );

			expect( log.entries ).toHaveLength( 1 );
			expect( log.dayIndex['2026-08-19'] ).toEqual( [ 'uid1' ] );
		} );

		it( 'replaces an existing entry with the same uid instead of duplicating it', () => {
			const log:ResponseLog = { study: 'study1', entries: [], dayIndex: {} };

			service.addEntryToLog( log, entry( { state: ResponseLogState.Pending } ) );
			service.addEntryToLog( log, entry( { state: ResponseLogState.Done } ) );

			expect( log.entries ).toHaveLength( 1 );
			expect( log.entries[0].state ).toBe( ResponseLogState.Done );
		} );

		it( 'keeps entries for different days in separate day buckets', () => {
			const log:ResponseLog = { study: 'study1', entries: [], dayIndex: {} };

			service.addEntryToLog( log, entry( { uid: 'a', forDay: '2026-08-19' } ) );
			service.addEntryToLog( log, entry( { uid: 'b', forDay: '2026-08-20' } ) );

			expect( log.dayIndex['2026-08-19'] ).toEqual( [ 'a' ] );
			expect( log.dayIndex['2026-08-20'] ).toEqual( [ 'b' ] );
		} );

	} );


	describe( 'submitResponses', () => {

		it( 'writes the response to storage before calling the API', async () => {
			let storedWhenPosted:unknown;
			api.post.mockImplementation( () => {
				storedWhenPosted = storage.data.get( 'log.study1' );
				return of( { success: [ 'uid1' ] } );
			} );

			await lastValueFrom( service.submitResponses( payload( response() ) ), { defaultValue: null } );

			expect( storedWhenPosted ).toBeDefined();
			expect( ( storedWhenPosted as ResponseLog ).entries[0].uid ).toBe( 'uid1' );
		} );

		it( 'posts only the responses that carry data', async () => {
			api.post.mockReturnValue( of( { success: [ 'uid1' ] } ) );

			await lastValueFrom( service.submitResponses( payload(
				response( { uid: 'uid1' } ),
				response( { uid: 'uid2', data: undefined as never } ),
			) ), { defaultValue: null } );

			expect( api.post ).toHaveBeenCalledTimes( 1 );
			const [ url, body ] = api.post.mock.calls[0];
			expect( url ).toBe( 'study/responses' );
			expect( body.responses.map( ( r:{ uid:string } ) => r.uid ) ).toEqual( [ 'uid1' ] );
		} );

		it( 'marks acknowledged responses as done and drops their payload', async () => {
			api.post.mockReturnValue( of( { success: [ 'uid1' ] } ) );

			await lastValueFrom( service.submitResponses( payload( response() ) ), { defaultValue: null } );

			const log = await service.getStudyLog( 'study1' );
			expect( log.entries[0].state ).toBe( ResponseLogState.Done );
			expect( log.entries[0].response ).toBeUndefined();
		} );

		it( 'stores the response but skips the network while offline', async () => {
			core.online$.next( false );

			await lastValueFrom( service.submitResponses( payload( response() ) ), { defaultValue: null } );

			expect( api.post ).not.toHaveBeenCalled();

			const log = await service.getStudyLog( 'study1' );
			expect( log.entries ).toHaveLength( 1 );
			expect( log.entries[0].state ).toBe( ResponseLogState.Pending );
			expect( log.entries[0].response ).toBeDefined();
		} );

		it( 'keeps the response queued when the server acknowledges nothing', async () => {
			api.post.mockReturnValue( of( { success: [] } ) );

			await lastValueFrom( service.submitResponses( payload( response() ) ), { defaultValue: null } );

			const log = await service.getStudyLog( 'study1' );
			expect( log.entries[0].state ).toBe( ResponseLogState.Pending );
			expect( log.entries[0].response ).toBeDefined();
		} );

		it( 'keeps the response queued when the request fails', async () => {
			api.post.mockReturnValue( throwError( () => new Error( 'network down' ) ) );

			await expect(
				lastValueFrom( service.submitResponses( payload( response() ) ), { defaultValue: null } ),
			).rejects.toThrow( 'network down' );

			const log = await service.getStudyLog( 'study1' );
			expect( log.entries[0].state ).toBe( ResponseLogState.Pending );
			expect( log.entries[0].response ).toBeDefined();
		} );

		it( 'acknowledges only the uids the server confirmed', async () => {
			api.post.mockReturnValue( of( { success: [ 'uid1' ] } ) );

			await lastValueFrom( service.submitResponses( payload(
				response( { uid: 'uid1', suid: 's1' } ),
				response( { uid: 'uid2', suid: 's2' } ),
			) ), { defaultValue: null } );

			const log = await service.getStudyLog( 'study1' );
			const byUid = Object.fromEntries( log.entries.map( e => [ e.uid, e ] ) );

			expect( byUid['uid1'].state ).toBe( ResponseLogState.Done );
			expect( byUid['uid2'].state ).toBe( ResponseLogState.Pending );
			expect( byUid['uid2'].response ).toBeDefined();
		} );

		it( 'keeps responses for different studies in separate logs', async () => {
			api.post.mockReturnValue( of( { success: [] } ) );

			await lastValueFrom( service.submitResponses( payload(
				response( { _study: 'study1', uid: 'a' } ),
				response( { _study: 'study2', uid: 'b' } ),
			) ), { defaultValue: null } );

			expect( ( await service.getStudyLog( 'study1' ) ).entries.map( e => e.uid ) ).toEqual( [ 'a' ] );
			expect( ( await service.getStudyLog( 'study2' ) ).entries.map( e => e.uid ) ).toEqual( [ 'b' ] );
			expect( api.post ).toHaveBeenCalledTimes( 2 );
		} );

		it( 'does nothing when there is nothing submittable', async () => {
			const emitted = await lastValueFrom(
				service.submitResponses( payload( response( { data: undefined as never } ) ) ).pipe( toArray() ),
			);

			expect( emitted ).toEqual( [] );
			expect( api.post ).not.toHaveBeenCalled();
			expect( storage.data.size ).toBe( 0 );
		} );

	} );


	describe( 'markResponsesAsSent', () => {

		it( 'sets state to done and removes the stored payload', async () => {
			await storage.set( [ 'log', 'study1' ], {
				study: 'study1',
				dayIndex: {},
				entries: [ {
					study: 'study1', uid: 'uid1', suid: 'suid1', slot: 'slot1',
					date: '2026-08-19T10:00:00.000Z', forDay: '2026-08-19',
					state: ResponseLogState.Pending, response: response(),
				} ],
			} );

			await lastValueFrom( service.markResponsesAsSent( 'study1', [ 'uid1' ] ) );

			const log = await service.getStudyLog( 'study1' );
			expect( log.entries[0].state ).toBe( ResponseLogState.Done );
			expect( log.entries[0].response ).toBeUndefined();
		} );

		it( 'ignores uids that are not in the log', async () => {
			await storage.set( [ 'log', 'study1' ], { study: 'study1', dayIndex: {}, entries: [] } );

			await expect(
				lastValueFrom( service.markResponsesAsSent( 'study1', [ 'unknown' ] ) ),
			).resolves.toBeDefined();
		} );

	} );


	describe( 'logout', () => {

		it( 'drops all cached study data', async () => {
			await storage.set( [ 'log', 'study1' ], { study: 'study1', dayIndex: {}, entries: [] } );

			core.logout$.next( true );

			expect( storage.cleared ).toBe( 1 );
			expect( storage.data.size ).toBe( 0 );
			expect( service.studies ).toBeUndefined();
		} );

	} );

} );
