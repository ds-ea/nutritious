import { Test, TestingModule } from '@nestjs/testing';
import { StudyFormsService } from './study-forms.service';


describe( 'StudyFormsService', () => {
	let service:StudyFormsService;

	beforeEach( async () => {
		const module:TestingModule = await Test.createTestingModule( {
			providers: [ StudyFormsService ],
		} ).compile();

		service = module.get<StudyFormsService>( StudyFormsService );
	} );

	it( 'should be defined', () => {
		expect( service ).toBeDefined();
	} );
} );
