import { ConfigService } from '@nestjs/config';
import { EntityState, StudyStepType } from '@nutritious/core';
import dayjs from 'dayjs';
import { PrismaService } from '../core/services/db/prisma.service';
import { StudyService } from './study.service';


/**
 * The gate on study signup and the shape of the payload the mobile app caches offline. Both are
 * pinned with a mocked PrismaService - Prisma against MongoDB needs a replica set for transactions,
 * so there is no database here by design.
 */
describe( 'StudyService', () => {

	let prisma:{
		groupMember:{ count:jest.Mock, findMany:jest.Mock, findFirst:jest.Mock, create:jest.Mock },
		studyResponse:{ createMany:jest.Mock },
		group:{ findUnique:jest.Mock },
		study:{ findUnique:jest.Mock },
		schedule:{ findUnique:jest.Mock },
		slot:{ findMany:jest.Mock },
		studyForm:{ findMany:jest.Mock },
		studyContent:{ findMany:jest.Mock },
		formInputPreset:{ findMany:jest.Mock },
		participant:{ create:jest.Mock },
	};
	let service:StudyService;

	beforeEach( () => {
		prisma = {
			groupMember: {
				count: jest.fn().mockResolvedValue( 0 ),
				findMany: jest.fn().mockResolvedValue( [] ),
				findFirst: jest.fn().mockResolvedValue( null ),
				create: jest.fn(),
			},
			studyResponse: { createMany: jest.fn().mockResolvedValue( { count: 0 } ) },
			group: { findUnique: jest.fn().mockResolvedValue( null ) },
			study: { findUnique: jest.fn().mockResolvedValue( null ) },
			schedule: { findUnique: jest.fn().mockResolvedValue( null ) },
			slot: { findMany: jest.fn().mockResolvedValue( [] ) },
			studyForm: { findMany: jest.fn().mockResolvedValue( [] ) },
			studyContent: { findMany: jest.fn().mockResolvedValue( [] ) },
			formInputPreset: { findMany: jest.fn().mockResolvedValue( [] ) },
			participant: { create: jest.fn() },
		};

		service = new StudyService(
			prisma as unknown as PrismaService,
			{ get: jest.fn(), getOrThrow: jest.fn( () => 'secret' ) } as unknown as ConfigService,
		);
	} );


	describe( 'timeframeAvailable', () => {

		const now = dayjs( '2026-08-19T12:00:00' );

		it( 'accepts an enabled timeframe with no bounds', () => {
			expect( service.timeframeAvailable( { state: EntityState.Enabled } as never, now ) ).toBe( true );
		} );

		it( 'rejects a timeframe that is not enabled', () => {
			expect( service.timeframeAvailable( { state: EntityState.Disabled } as never, now ) ).toBe( false );
		} );

		it( 'rejects a timeframe that has not started', () => {
			expect( service.timeframeAvailable(
				{ state: EntityState.Enabled, from: new Date( '2026-09-01' ) } as never, now,
			) ).toBe( false );
		} );

		it( 'rejects a timeframe that has ended', () => {
			expect( service.timeframeAvailable(
				{ state: EntityState.Enabled, until: new Date( '2026-08-01' ) } as never, now,
			) ).toBe( false );
		} );

		it( 'accepts a timeframe that is currently open', () => {
			expect( service.timeframeAvailable( {
				state: EntityState.Enabled,
				from: new Date( '2026-08-01' ),
				until: new Date( '2026-09-01' ),
			} as never, now ) ).toBe( true );
		} );

	} );


	describe( 'studyAvailable', () => {

		const group = ( over:Record<string, unknown> = {} ) => ( {
			id: 'g1', studyId: 's1', state: EntityState.Enabled, regLimit: null, signupPeriod: null, ...over,
		} ) as never;
		const study = ( over:Record<string, unknown> = {} ) => ( {
			id: 's1', state: EntityState.Enabled, signupPeriod: null, ...over,
		} ) as never;

		it( 'accepts an open group on an open study', async () => {
			await expect( service.studyAvailable( group(), study() ) ).resolves.toBe( true );
		} );

		it( 'rejects a disabled group', async () => {
			await expect( service.studyAvailable( group( { state: EntityState.Disabled } ), study() ) )
				.resolves.toBe( false );
		} );

		it( 'rejects a disabled study', async () => {
			await expect( service.studyAvailable( group(), study( { state: EntityState.Disabled } ) ) )
				.resolves.toBe( false );
		} );

		it( 'rejects a group that has reached its registration limit', async () => {
			prisma.groupMember.count.mockResolvedValue( 20 );

			await expect( service.studyAvailable( group( { regLimit: 20 } ), study() ) ).resolves.toBe( false );
		} );

		it( 'accepts a group still below its registration limit', async () => {
			prisma.groupMember.count.mockResolvedValue( 19 );

			await expect( service.studyAvailable( group( { regLimit: 20 } ), study() ) ).resolves.toBe( true );
		} );

		it( 'counts only members of that group against the limit', async () => {
			prisma.groupMember.count.mockResolvedValue( 1 );

			await service.studyAvailable( group( { regLimit: 20 } ), study() );

			expect( prisma.groupMember.count ).toHaveBeenCalledWith( { where: { groupId: 'g1' } } );
		} );

		it( 'rejects when the group signup period has closed', async () => {
			await expect( service.studyAvailable(
				group( { signupPeriod: { state: EntityState.Enabled, until: new Date( '2020-01-01' ) } } ),
				study(),
			) ).resolves.toBe( false );
		} );

		it( 'rejects when the study signup period has closed', async () => {
			await expect( service.studyAvailable(
				group(),
				study( { signupPeriod: { state: EntityState.Enabled, until: new Date( '2020-01-01' ) } } ),
			) ).resolves.toBe( false );
		} );

	} );


	describe( 'prepareSlot', () => {

		const step = ( over:Record<string, unknown> = {} ) => ( {
			id: 'step1', type: StudyStepType.Form, ref: 'form1', config: {},
			state: EntityState.Enabled, slotId: 'slot1', ...over,
		} );
		const slot = ( steps:unknown[] ) => ( {
			id: 'slot1', key: 'k', name: 'n', scheduleId: 'sched1',
			availability: null, constraints: null, steps,
		} ) as never;

		it( 'drops steps that are not enabled', () => {
			const prepared = service.prepareSlot( slot( [
				step( { id: 'a' } ),
				step( { id: 'b', state: EntityState.Disabled } ),
				step( { id: 'c', state: EntityState.Archived } ),
			] ), {} );

			expect( prepared.steps?.map( s => s.id ) ).toEqual( [ 'a' ] );
		} );

		it( 'collects step refs by type so they can be resolved in one query', () => {
			const refs:Record<string, Record<string, unknown>> = {};
			service.prepareSlot( slot( [
				step( { id: 'a', ref: 'form1' } ),
				step( { id: 'b', ref: 'form2' } ),
				step( { id: 'c', type: StudyStepType.Content, ref: 'content1' } ),
			] ), refs );

			expect( Object.keys( refs[StudyStepType.Form] ) ).toEqual( [ 'form1', 'form2' ] );
			expect( Object.keys( refs[StudyStepType.Content] ) ).toEqual( [ 'content1' ] );
		} );

		it( 'does not collect refs from disabled steps', () => {
			const refs:Record<string, Record<string, unknown>> = {};
			service.prepareSlot( slot( [ step( { ref: 'form1', state: EntityState.Disabled } ) ] ), refs );

			expect( refs ).toEqual( {} );
		} );

		it( 'strips scheduleId from the slot sent to participants', () => {
			const prepared = service.prepareSlot( slot( [] ), {} ) as Record<string, unknown>;

			expect( prepared['scheduleId'] ).toBeUndefined();
		} );

	} );


	describe( 'prepareStudies', () => {

		const membership = ( over:Record<string, unknown> = {} ) => ( {
			participantId: 'p1', studyId: 's1', groupId: 'g1', badge: 'badge-1',
			state: EntityState.Enabled,
			study: { id: 's1', name: 'Study One', state: EntityState.Enabled },
			group: { id: 'g1', name: 'Group', state: EntityState.Enabled, scheduleId: null },
			...over,
		} );

		it( 'returns one prepared entry per enabled membership', async () => {
			prisma.groupMember.findMany.mockResolvedValue( [ membership() ] );

			const studies = await service.prepareStudies( 'p1' );

			expect( studies ).toHaveLength( 1 );
			expect( studies[0].study ).toEqual( { id: 's1', name: 'Study One' } );
			expect( studies[0].badge ).toBe( 'badge-1' );
		} );

		it( 'asks only for the participant\'s enabled memberships', async () => {
			await service.prepareStudies( 'p1' );

			expect( prisma.groupMember.findMany ).toHaveBeenCalledWith( {
				where: { participantId: 'p1', state: EntityState.Enabled },
				include: { study: true, group: true },
			} );
		} );

		it( 'skips a membership whose study has been disabled', async () => {
			prisma.groupMember.findMany.mockResolvedValue( [
				membership( { study: { id: 's1', name: 'S', state: EntityState.Disabled } } ),
			] );

			await expect( service.prepareStudies( 'p1' ) ).resolves.toEqual( [] );
		} );

		it( 'skips a membership whose group has been disabled', async () => {
			prisma.groupMember.findMany.mockResolvedValue( [
				membership( { group: { id: 'g1', name: 'G', state: EntityState.Disabled, scheduleId: null } } ),
			] );

			await expect( service.prepareStudies( 'p1' ) ).resolves.toEqual( [] );
		} );

		it( 'never leaks study fields beyond id and name', async () => {
			prisma.groupMember.findMany.mockResolvedValue( [ membership( {
				study: { id: 's1', name: 'S', state: EntityState.Enabled, regPass: 'secret', notes: 'internal' },
			} ) ] );

			const studies = await service.prepareStudies( 'p1' );

			expect( Object.keys( studies[0].study ).sort() ).toEqual( [ 'id', 'name' ] );
		} );

	} );


	describe( 'prepareSchedule', () => {

		it( 'returns undefined when the group has no schedule', async () => {
			await expect( service.prepareSchedule( null ) ).resolves.toBeUndefined();
			expect( prisma.schedule.findUnique ).not.toHaveBeenCalled();
		} );

		it( 'returns undefined when the schedule id does not resolve', async () => {
			prisma.schedule.findUnique.mockResolvedValue( null );

			await expect( service.prepareSchedule( 'missing' ) ).resolves.toBeUndefined();
		} );

		it( 'asks only for enabled slots', async () => {
			prisma.schedule.findUnique.mockResolvedValue( { id: 'sched1', daySetup: [], weekSetup: null } );

			await service.prepareSchedule( 'sched1' );

			expect( prisma.slot.findMany ).toHaveBeenCalledWith( {
				where: { scheduleId: 'sched1', state: EntityState.Enabled },
				include: { steps: true },
			} );
		} );

		it( 'resolves referenced forms and their input presets in bulk', async () => {
			prisma.schedule.findUnique.mockResolvedValue( { id: 'sched1', daySetup: [], weekSetup: null } );
			prisma.slot.findMany.mockResolvedValue( [ {
				id: 'slot1', key: 'k', name: 'n', scheduleId: 'sched1',
				steps: [ { id: 'st1', type: StudyStepType.Form, ref: 'form1', config: {}, state: EntityState.Enabled } ],
			} ] );
			prisma.studyForm.findMany.mockResolvedValue( [ {
				id: 'form1', title: 'F', intro: null, translations: null,
				setup: { items: [ { type: 'question', preset: 'preset1' } ] },
			} ] );
			prisma.formInputPreset.findMany.mockResolvedValue( [
				{ id: 'preset1', inputType: 'slider', config: {}, translations: null },
			] );

			const prepared = await service.prepareSchedule( 'sched1' );

			expect( prisma.studyForm.findMany ).toHaveBeenCalledWith( { where: { id: { in: [ 'form1' ] } } } );
			expect( prisma.formInputPreset.findMany ).toHaveBeenCalledWith( { where: { id: { in: [ 'preset1' ] } } } );
			expect( prepared?.refs?.inputPresets ).toHaveLength( 1 );
		} );

	} );


	describe( 'recordResponses', () => {

		const response = ( over:Record<string, unknown> = {} ) => ( {
			_study: 's1', uid: 'uid1', suid: 'suid1', step: 'step1', slot: 'slot1',
			type: 'form', forDay: '2026-08-19', data: { answer: 1 },
			created: '2026-08-19T10:00:00.000Z', updated: '2026-08-19T10:00:00.000Z',
			...over,
		} );

		it( 'acknowledges every uid it stored', async () => {
			prisma.groupMember.findMany.mockResolvedValue( [ { studyId: 's1', groupId: 'g1' } ] );

			const result = await service.recordResponses( 'p1', {
				responses: [ response( { uid: 'a' } ), response( { uid: 'b' } ) ] as never,
			} );

			expect( result ).toEqual( { success: [ 'a', 'b' ] } );
		} );

		it( 'stamps each row with the participant and their group for that study', async () => {
			prisma.groupMember.findMany.mockResolvedValue( [
				{ studyId: 's1', groupId: 'g1' },
				{ studyId: 's2', groupId: 'g2' },
			] );

			await service.recordResponses( 'p1', {
				responses: [ response( { _study: 's1' } ), response( { _study: 's2', uid: 'uid2' } ) ] as never,
			} );

			const rows = prisma.studyResponse.createMany.mock.calls[0][0].data;
			expect( rows[0] ).toMatchObject( { studyId: 's1', groupId: 'g1', participantId: 'p1' } );
			expect( rows[1] ).toMatchObject( { studyId: 's2', groupId: 'g2', participantId: 'p1' } );
		} );

		it( 'looks up memberships only for the studies actually submitted', async () => {
			prisma.groupMember.findMany.mockResolvedValue( [ { studyId: 's1', groupId: 'g1' } ] );

			await service.recordResponses( 'p1', {
				responses: [ response(), response( { uid: 'uid2' } ) ] as never,
			} );

			expect( prisma.groupMember.findMany ).toHaveBeenCalledWith( {
				where: { participantId: 'p1', studyId: { in: [ 's1' ] } },
			} );
		} );

		it( 'maps the response fields onto the stored row', async () => {
			prisma.groupMember.findMany.mockResolvedValue( [ { studyId: 's1', groupId: 'g1' } ] );

			await service.recordResponses( 'p1', { responses: [ response() ] as never } );

			expect( prisma.studyResponse.createMany.mock.calls[0][0].data[0] ).toEqual( {
				studyId: 's1',
				groupId: 'g1',
				participantId: 'p1',
				stepId: 'step1',
				slotId: 'slot1',
				type: 'form',
				uid: 'uid1',
				suid: 'suid1',
				forDay: '2026-08-19',
				data: { answer: 1 },
			} );
		} );

		it( 'handles an empty submission without writing anything meaningful', async () => {
			const result = await service.recordResponses( 'p1', { responses: [] } );

			expect( result ).toEqual( { success: [] } );
			expect( prisma.studyResponse.createMany ).toHaveBeenCalledWith( { data: [] } );
		} );

	} );

} );
