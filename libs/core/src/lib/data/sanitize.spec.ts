import { EntityState } from '../entity/enums';
import { clean, Sanitize } from './sanitize';


/**
 * These payloads go straight to participant devices. The point of every `safe*` helper is that
 * adding a column to the Prisma schema does NOT add it to the wire format - so the assertions here
 * are deliberately about what is absent, not only about what is present.
 */
describe( 'Sanitize', () => {

	const participantRow = {
		id: 'p1',
		state: EntityState.Enabled,
		login: 'secret-login',
		password: '$argon2id$v=19$m=65536,t=3,p=4$hash',
		name: 'Test Participant',
		settings: { theme: 'dark' },
		lang: 'de',
		timeZone: 'Europe/Berlin',
		createdAt: new Date(),
		updatedAt: new Date(),
	} as any;

	const userRow = {
		id: 'u1',
		state: EntityState.Enabled,
		name: 'Admin',
		email: 'admin@example.com',
		password: '$2y$10$abcdefghijklmnopqrstuv',
		settings: { rows: 20 },
		createdAt: new Date(),
		updatedAt: new Date(),
	} as any;

	const studyRow = {
		id: 's1',
		state: EntityState.Enabled,
		name: 'Study One',
		signupPeriod: { state: EntityState.Enabled },
		regPass: 'do-not-leak',
		createdAt: new Date(),
	} as any;


	describe( 'safeParticipant', () => {
		it( 'never emits the password or login', () => {
			const safe = Sanitize.safeParticipant( participantRow ) as Record<string, unknown>;

			expect( safe['password'] ).toBeUndefined();
			expect( safe['login'] ).toBeUndefined();
			expect( JSON.stringify( safe ) ).not.toContain( 'argon2' );
		} );

		it( 'keeps the fields the app renders', () => {
			expect( Sanitize.safeParticipant( participantRow ) ).toEqual( {
				id: 'p1',
				name: 'Test Participant',
				settings: { theme: 'dark' },
				lang: 'de',
				timeZone: 'Europe/Berlin',
			} );
		} );

		it( 'drops keys that are null rather than emitting them', () => {
			const safe = Sanitize.safeParticipant( { ...participantRow, name: null, lang: null } );

			expect( 'name' in safe ).toBe( false );
			expect( 'lang' in safe ).toBe( false );
			expect( safe.id ).toBe( 'p1' );
		} );
	} );


	describe( 'safeUser', () => {
		it( 'never emits the password or email', () => {
			const safe = Sanitize.safeUser( userRow ) as Record<string, unknown>;

			expect( safe['password'] ).toBeUndefined();
			expect( safe['email'] ).toBeUndefined();
			expect( safe ).toEqual( { id: 'u1', name: 'Admin' } );
		} );
	} );


	describe( 'publicStudy', () => {
		it( 'reduces a study to id and name', () => {
			const safe = Sanitize.publicStudy( studyRow ) as Record<string, unknown>;

			expect( safe ).toEqual( { id: 's1', name: 'Study One' } );
			expect( safe['regPass'] ).toBeUndefined();
		} );
	} );


	describe( 'safeSlot', () => {
		it( 'strips bookkeeping fields but keeps the rest of the slot', () => {
			const safe = Sanitize.safeSlot( {
				id: 'slot1',
				key: 'breakfast',
				name: 'Breakfast',
				scheduleId: 'sched1',
				availability: { start: 480, duration: 60 },
				constraints: { obligatory: true },
				createdAt: new Date(),
				updatedAt: new Date(),
			} as any ) as Record<string, unknown>;

			expect( safe['scheduleId'] ).toBeUndefined();
			expect( safe['createdAt'] ).toBeUndefined();
			expect( safe['updatedAt'] ).toBeUndefined();
			expect( safe['key'] ).toBe( 'breakfast' );
			expect( safe['availability'] ).toEqual( { start: 480, duration: 60 } );
		} );
	} );


	describe( 'safeStep', () => {
		it( 'keeps only the fields the slot runner needs', () => {
			const safe = Sanitize.safeStep( {
				id: 'step1',
				type: 'form',
				ref: 'form1',
				config: { intro: true },
				state: EntityState.Enabled,
				slotId: 'slot1',
				createdAt: new Date(),
			} as any ) as Record<string, unknown>;

			expect( safe ).toEqual( { id: 'step1', type: 'form', ref: 'form1', config: { intro: true } } );
			expect( safe['slotId'] ).toBeUndefined();
			expect( safe['state'] ).toBeUndefined();
		} );
	} );


	describe( 'enforceState', () => {
		const records = [
			{ id: 'a', state: EntityState.Enabled },
			{ id: 'b', state: EntityState.Disabled },
			{ id: 'c', state: EntityState.Archived },
		];

		it( 'keeps only enabled records by default', () => {
			expect( Sanitize.enforceState( records ).map( r => r.id ) ).toEqual( [ 'a' ] );
		} );

		it( 'accepts an explicit list of allowed states', () => {
			expect(
				Sanitize.enforceState( records, [ EntityState.Enabled, EntityState.Archived ] ).map( r => r.id ),
			).toEqual( [ 'a', 'c' ] );
		} );

		it( 'returns undefined for a single record in a disallowed state', () => {
			expect( Sanitize.enforceState( { id: 'b', state: EntityState.Disabled } ) ).toBeUndefined();
		} );

		it( 'returns undefined when given nothing', () => {
			expect( Sanitize.enforceState( undefined as any ) ).toBeUndefined();
		} );
	} );


	describe( 'clean', () => {
		it( 'copies everything when only removing', () => {
			expect( clean( { a: 1, b: 2, c: 3 }, { remove: [ 'b' ] } ) ).toEqual( { a: 1, c: 3 } );
		} );

		it( 'does not mutate the source', () => {
			const source = { a: 1, b: 2 };
			clean( source, { remove: [ 'b' ] } );

			expect( source ).toEqual( { a: 1, b: 2 } );
		} );

		it( 'drops the standard bookkeeping fields with defaults:true', () => {
			const result = clean(
				{ id: 'x', createdAt: new Date(), updatedAt: new Date(), state: EntityState.Enabled },
				{ defaults: true },
			) as Record<string, unknown>;

			expect( result ).toEqual( { id: 'x' } );
		} );
	} );

} );
