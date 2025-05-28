import { Test, TestingModule } from '@nestjs/testing';
import { GroupMembersService } from './groupMembers.service';


describe( 'GroupMembersService', () => {
	let service:GroupMembersService;

	beforeEach( async () => {
		const module:TestingModule = await Test.createTestingModule( {
			providers: [ GroupMembersService ],
		} ).compile();

		service = module.get<GroupMembersService>( GroupMembersService );
	} );

	it( 'should be defined', () => {
		expect( service ).toBeDefined();
	} );
} );
