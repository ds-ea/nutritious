import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { EntityState } from '@nutritious/core';
import * as argon2 from 'argon2';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../core/services/db/prisma.service';
import { AuthService } from './auth.service';


const PW_SECRET = 'test-pw-secret';
const JWT_SECRET = 'test-jwt-secret';
const PASSWORD = 'correct horse battery staple';


/**
 * Participants enrolled before the PHP-era migration still carry bcrypt hashes written with a
 * '$2y$' prefix, which node's bcrypt refuses outright; everyone since uses argon2 keyed with
 * PW_SECRET. Both paths have to keep working - if the legacy one breaks, those participants are
 * locked out of a running study with nothing in the logs to say why.
 */
describe( 'AuthService', () => {

	let prisma:{ participant:{ findUnique:jest.Mock }, user:{ findUnique:jest.Mock } };
	let service:AuthService;

	// bcrypt itself is the slow part; hash once for the whole file
	let legacyBcryptHash:string;
	let argon2Hash:string;

	beforeAll( async () => {
		const generated = await bcrypt.hash( PASSWORD, 4 );
		// PHP's password_hash() emits $2y$; node emits $2b$. AuthService is expected to rewrite
		// the prefix to $2a$ before comparing.
		legacyBcryptHash = generated.replace( /^\$2[ab]\$/, '$2y$' );

		argon2Hash = await argon2.hash( PASSWORD, { secret: Buffer.from( PW_SECRET, 'utf-8' ) } );
	} );

	beforeEach( () => {
		prisma = {
			participant: { findUnique: jest.fn().mockResolvedValue( null ) },
			user: { findUnique: jest.fn().mockResolvedValue( null ) },
		};

		const config = {
			get: jest.fn( ( key:string ) => ( key === 'JWT_SECRET' ? JWT_SECRET : undefined ) ),
			getOrThrow: jest.fn( ( key:string ) => {
				if( key === 'PW_SECRET' ) return PW_SECRET;
				throw new Error( `missing config ${ key }` );
			} ),
		};

		service = new AuthService(
			prisma as unknown as PrismaService,
			new JwtService(),
			config as unknown as ConfigService,
		);
	} );

	const participant = ( over:Record<string, unknown> = {} ) => ( {
		id: 'p1',
		login: 'participant-login',
		state: EntityState.Enabled,
		password: argon2Hash,
		name: 'Test',
		settings: null,
		lang: 'de',
		timeZone: 'Europe/Berlin',
		...over,
	} );


	describe( 'legacy bcrypt hashes', () => {

		it( 'accepts a correct password against a $2y$ hash', async () => {
			prisma.participant.findUnique.mockResolvedValue( participant( { password: legacyBcryptHash } ) );

			await expect( service.checkCredentials( { participant: 'participant-login', password: PASSWORD } ) )
				.resolves.toBeDefined();
		} );

		it( 'rejects a wrong password against a $2y$ hash', async () => {
			prisma.participant.findUnique.mockResolvedValue( participant( { password: legacyBcryptHash } ) );

			await expect( service.checkCredentials( { participant: 'participant-login', password: 'wrong' } ) )
				.resolves.toBeUndefined();
		} );

	} );


	describe( 'argon2 hashes', () => {

		it( 'accepts a correct password', async () => {
			prisma.participant.findUnique.mockResolvedValue( participant() );

			await expect( service.checkCredentials( { participant: 'participant-login', password: PASSWORD } ) )
				.resolves.toBeDefined();
		} );

		it( 'rejects a wrong password', async () => {
			prisma.participant.findUnique.mockResolvedValue( participant() );

			await expect( service.checkCredentials( { participant: 'participant-login', password: 'wrong' } ) )
				.resolves.toBeUndefined();
		} );

		it( 'rejects when the keyed secret does not match', async () => {
			const otherHash = await argon2.hash( PASSWORD, { secret: Buffer.from( 'a-different-secret', 'utf-8' ) } );
			prisma.participant.findUnique.mockResolvedValue( participant( { password: otherHash } ) );

			await expect( service.checkCredentials( { participant: 'participant-login', password: PASSWORD } ) )
				.resolves.toBeUndefined();
		} );

	} );


	describe( 'account state', () => {

		it.each( [ EntityState.Disabled, EntityState.Locked, EntityState.Pending, EntityState.Archived ] )(
			'refuses a participant in state %s even with the right password',
			async state => {
				prisma.participant.findUnique.mockResolvedValue( participant( { state } ) );

				await expect( service.checkCredentials( { participant: 'participant-login', password: PASSWORD } ) )
					.resolves.toBeUndefined();
			},
		);

		it( 'refuses an unknown login', async () => {
			prisma.participant.findUnique.mockResolvedValue( null );

			await expect( service.checkCredentials( { participant: 'nobody', password: PASSWORD } ) )
				.resolves.toBeUndefined();
		} );

		it( 'refuses an account with no password set', async () => {
			prisma.participant.findUnique.mockResolvedValue( participant( { password: '' } ) );

			await expect( service.checkCredentials( { participant: 'participant-login', password: PASSWORD } ) )
				.resolves.toBeUndefined();
		} );

		it( 'refuses an empty password without touching the database', async () => {
			await expect( service.checkCredentials( { participant: 'participant-login', password: '' } ) )
				.resolves.toBeUndefined();

			expect( prisma.participant.findUnique ).not.toHaveBeenCalled();
		} );

	} );


	describe( 'user vs participant lookup', () => {

		it( 'looks a participant up by login', async () => {
			prisma.participant.findUnique.mockResolvedValue( participant() );

			await service.checkCredentials( { participant: 'participant-login', password: PASSWORD } );

			expect( prisma.participant.findUnique ).toHaveBeenCalledWith( { where: { login: 'participant-login' } } );
			expect( prisma.user.findUnique ).not.toHaveBeenCalled();
		} );

		it( 'looks a user up by email', async () => {
			prisma.user.findUnique.mockResolvedValue( {
				id: 'u1', email: 'admin@example.org', state: EntityState.Enabled,
				password: argon2Hash, name: 'Admin', settings: null,
			} );

			await service.checkCredentials( { email: 'admin@example.org', password: PASSWORD } );

			expect( prisma.user.findUnique ).toHaveBeenCalledWith( { where: { email: 'admin@example.org' } } );
			expect( prisma.participant.findUnique ).not.toHaveBeenCalled();
		} );

	} );


	describe( 'signIn', () => {

		it( 'returns a token plus a sanitized participant', async () => {
			prisma.participant.findUnique.mockResolvedValue( participant() );

			const result = await service.signIn( { participant: 'participant-login', password: PASSWORD } );

			expect( result?.token ).toEqual( expect.any( String ) );
			expect( result ).toHaveProperty( 'participant' );

			const payload = result as { participant:Record<string, unknown> };
			expect( payload.participant['password'] ).toBeUndefined();
			expect( payload.participant['login'] ).toBeUndefined();
			expect( payload.participant['id'] ).toBe( 'p1' );
		} );

		it( 'subjects the token to the participant id', async () => {
			prisma.participant.findUnique.mockResolvedValue( participant() );

			const result = await service.signIn( { participant: 'participant-login', password: PASSWORD } );
			const decoded = new JwtService().verify( result!.token!, { secret: JWT_SECRET } );

			expect( decoded.sub ).toEqual( { participant: 'p1' } );
		} );

		it( 'returns a token that the configured secret can verify', async () => {
			prisma.participant.findUnique.mockResolvedValue( participant() );

			const result = await service.signIn( { participant: 'participant-login', password: PASSWORD } );

			expect( () => new JwtService().verify( result!.token!, { secret: 'wrong-secret' } ) ).toThrow();
		} );

		it( 'returns undefined for bad credentials rather than an unsigned token', async () => {
			prisma.participant.findUnique.mockResolvedValue( participant() );

			await expect( service.signIn( { participant: 'participant-login', password: 'wrong' } ) )
				.resolves.toBeUndefined();
		} );

		it( 'returns a sanitized user for a user login', async () => {
			prisma.user.findUnique.mockResolvedValue( {
				id: 'u1', email: 'admin@example.org', state: EntityState.Enabled,
				password: argon2Hash, name: 'Admin', settings: null,
			} );

			const result = await service.signIn( { email: 'admin@example.org', password: PASSWORD } );

			expect( result ).toHaveProperty( 'user' );
			const payload = result as { user:Record<string, unknown> };
			expect( payload.user['password'] ).toBeUndefined();
			expect( payload.user['email'] ).toBeUndefined();
		} );

		it( 'issues a token that is not already expired', async () => {
			prisma.participant.findUnique.mockResolvedValue( participant() );

			const result = await service.signIn( { participant: 'participant-login', password: PASSWORD } );
			const decoded = new JwtService().verify( result!.token!, { secret: JWT_SECRET } );

			expect( decoded.exp ).toBeGreaterThan( Math.floor( Date.now() / 1000 ) );

			// KNOWN DEFECT, deliberately pinned rather than fixed here: signIn computes `exp` as a
			// unix timestamp and hands it to signAsync as `expiresIn`, which is interpreted as
			// *seconds from now* - so the token lives ~55 years instead of 30 minutes. Fixing it
			// needs a refresh-token flow first, since the app has none. See docs/mobile-release.md.
			const thirtyMinutes = Math.floor( Date.now() / 1000 ) + ( 30 * 60 );
			expect( decoded.exp ).toBeGreaterThan( thirtyMinutes );
		} );

	} );

} );
