import { Test, TestingModule } from '@nestjs/testing';
import { FormInputPresetsController } from './form-input-presets.controller';
import { FormInputPresetsService } from './form-input-presets.service';


describe( 'FormInputPresetsController', () => {
	let controller:FormInputPresetsController;

	beforeEach( async () => {
		const module:TestingModule = await Test.createTestingModule( {
			controllers: [ FormInputPresetsController ],
			providers: [ FormInputPresetsService ],
		} ).compile();

		controller = module.get<FormInputPresetsController>( FormInputPresetsController );
	} );

	it( 'should be defined', () => {
		expect( controller ).toBeDefined();
	} );
} );
