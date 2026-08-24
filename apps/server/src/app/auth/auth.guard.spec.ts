import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { EntityState } from '@nutritious/core';
import { PrismaService } from '../core/services/db/prisma.service';
import { AuthGuard } from './auth.guard';


const JWT_SECRET = 'test-jwt-secret';


/**
 * Access control is declarative and global: every route is user-level unless it opts out with
 * @Public() or @ParticipantAccess(). A participant token reaching a route that never opted in is
 * the failure that would expose one participant's data to another, so it is pinned here.
 */
describe( 'AuthGuard', () => {

	let prisma:{ participant:{ findUnique:jest.Mock }, user:{ findUnique:jest.Mock } };
	let jwt:JwtService;
	let guard:AuthGuard;
	let request:Record<string, unknown>;

	/** builds a context whose handler carries the given metadata */
	function context( metadata:Record<string, boolean> = {} ):ExecutionContext{
		const handler = () => undefined;
		for( const [ key, value ] of Object.entries( metadata ) )
			Reflect.defineMetadata( key, value, handler );

		return {
			getHandler: () => handler,
			getClass: () => class Controller{},
			switchToHttp: () => ( { getRequest: () => request } ),
		} as unknown as ExecutionContext;
	}

	// seconds, not a '30m' string - newer @types/jsonwebtoken types expiresIn as
	// `number | StringValue`, and a plain string is not assignable to it
	function token( sub:Record<string, string>, expiresInSeconds = 30 * 60 ){
		return jwt.sign( { sub }, { secret: JWT_SECRET, expiresIn: expiresInSeconds } );
	}

	function authorize( value:string | undefined ){
		request = { headers: value == null ? {} : { authorization: value } };
	}

	beforeEach( () => {
		prisma = {
			participant: { findUnique: jest.fn().mockResolvedValue( null ) },
			user: { findUnique: jest.fn().mockResolvedValue( null ) },
		};
		jwt = new JwtService();

		guard = new AuthGuard(
			{ get: () => JWT_SECRET } as unknown as ConfigService,
			jwt,
			prisma as unknown as PrismaService,
			new Reflector(),
		);

		authorize( undefined );
	} );

	const enabledParticipant = { id: 'p1', state: EntityState.Enabled };
	const enabledUser = { id: 'u1', state: EntityState.Enabled };


	describe( 'public routes', () => {

		it( 'lets an anonymous request through', async () => {
			await expect( guard.canActivate( context( { isPublic: true } ) ) ).resolves.toBe( true );
		} );

		it( 'does not hit the database for a public route', async () => {
			await guard.canActivate( context( { isPublic: true } ) );

			expect( prisma.participant.findUnique ).not.toHaveBeenCalled();
			expect( prisma.user.findUnique ).not.toHaveBeenCalled();
		} );

	} );


	describe( 'token extraction', () => {

		it( 'rejects a request with no authorization header', async () => {
			await expect( guard.canActivate( context() ) ).rejects.toThrow( UnauthorizedException );
		} );

		it( 'rejects a non-bearer scheme', async () => {
			authorize( `Basic ${ token( { user: 'u1' } ) }` );

			await expect( guard.canActivate( context() ) ).rejects.toThrow( UnauthorizedException );
		} );

		it( 'rejects a bearer token that is not a valid jwt', async () => {
			authorize( 'Bearer not-a-token' );

			await expect( guard.canActivate( context() ) ).rejects.toThrow( UnauthorizedException );
		} );

		it( 'rejects a token signed with a different secret', async () => {
			authorize( `Bearer ${ jwt.sign( { sub: { user: 'u1' } }, { secret: 'other', expiresIn: '30m' } ) }` );
			prisma.user.findUnique.mockResolvedValue( enabledUser );

			await expect( guard.canActivate( context() ) ).rejects.toThrow( UnauthorizedException );
		} );

		it( 'rejects an expired token', async () => {
			authorize( `Bearer ${ token( { user: 'u1' }, -60 ) }` );
			prisma.user.findUnique.mockResolvedValue( enabledUser );

			await expect( guard.canActivate( context() ) ).rejects.toThrow( UnauthorizedException );
		} );

	} );


	describe( 'user access', () => {

		it( 'admits an enabled user to a default route', async () => {
			authorize( `Bearer ${ token( { user: 'u1' } ) }` );
			prisma.user.findUnique.mockResolvedValue( enabledUser );

			await expect( guard.canActivate( context() ) ).resolves.toBe( true );
			expect( request['user'] ).toEqual( enabledUser );
		} );

		it( 'rejects a user whose account is no longer enabled', async () => {
			authorize( `Bearer ${ token( { user: 'u1' } ) }` );
			prisma.user.findUnique.mockResolvedValue( { id: 'u1', state: EntityState.Disabled } );

			await expect( guard.canActivate( context() ) ).rejects.toThrow( UnauthorizedException );
		} );

		it( 'rejects a token for a user that has been deleted', async () => {
			authorize( `Bearer ${ token( { user: 'gone' } ) }` );
			prisma.user.findUnique.mockResolvedValue( null );

			await expect( guard.canActivate( context() ) ).rejects.toThrow( UnauthorizedException );
		} );

		it( 'admits a user to a participant-access route as well', async () => {
			authorize( `Bearer ${ token( { user: 'u1' } ) }` );
			prisma.user.findUnique.mockResolvedValue( enabledUser );

			await expect( guard.canActivate( context( { allowParticipantAccess: true } ) ) ).resolves.toBe( true );
		} );

	} );


	describe( 'participant access', () => {

		it( 'admits an enabled participant to a participant-access route', async () => {
			authorize( `Bearer ${ token( { participant: 'p1' } ) }` );
			prisma.participant.findUnique.mockResolvedValue( enabledParticipant );

			await expect( guard.canActivate( context( { allowParticipantAccess: true } ) ) ).resolves.toBe( true );
			expect( request['participant'] ).toEqual( enabledParticipant );
		} );

		it( 'forbids a participant on a route that did not opt in', async () => {
			authorize( `Bearer ${ token( { participant: 'p1' } ) }` );
			prisma.participant.findUnique.mockResolvedValue( enabledParticipant );

			await expect( guard.canActivate( context() ) ).rejects.toThrow( ForbiddenException );
		} );

		it( 'rejects a participant whose account is no longer enabled', async () => {
			authorize( `Bearer ${ token( { participant: 'p1' } ) }` );
			prisma.participant.findUnique.mockResolvedValue( { id: 'p1', state: EntityState.Disabled } );

			await expect( guard.canActivate( context( { allowParticipantAccess: true } ) ) )
				.rejects.toThrow( UnauthorizedException );
		} );

		it( 'rejects a token for a participant that has been removed', async () => {
			authorize( `Bearer ${ token( { participant: 'gone' } ) }` );
			prisma.participant.findUnique.mockResolvedValue( null );

			await expect( guard.canActivate( context( { allowParticipantAccess: true } ) ) )
				.rejects.toThrow( UnauthorizedException );
		} );

		it( 'looks the participant up by the id in the token subject', async () => {
			authorize( `Bearer ${ token( { participant: 'p1' } ) }` );
			prisma.participant.findUnique.mockResolvedValue( enabledParticipant );

			await guard.canActivate( context( { allowParticipantAccess: true } ) );

			expect( prisma.participant.findUnique ).toHaveBeenCalledWith( { where: { id: 'p1' } } );
		} );

	} );


	it( 'rejects a well-formed token whose subject names neither a user nor a participant', async () => {
		authorize( `Bearer ${ token( {} ) }` );

		await expect( guard.canActivate( context( { allowParticipantAccess: true } ) ) )
			.rejects.toThrow( UnauthorizedException );
	} );

} );
