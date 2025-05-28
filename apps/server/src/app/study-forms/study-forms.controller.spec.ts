import { Test, TestingModule } from '@nestjs/testing';
import { StudyFormsController } from './study-forms.controller';
import { StudyFormsService } from './study-forms.service';


describe( 'StudyFormsController', () => {
	let controller:StudyFormsController;

	beforeEach( async () => {
		const module:TestingModule = await Test.createTestingModule( {
			controllers: [ StudyFormsController ],
			providers: [ StudyFormsService ],
		} ).compile();

		controller = module.get<StudyFormsController>( StudyFormsController );
	} );

	it( 'should be defined', () => {
		expect( controller ).toBeDefined();
	} );
} );
