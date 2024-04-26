import { Test, TestingModule } from '@nestjs/testing';
import { FormInputPresetsService } from './form-input-presets.service';


describe( 'FormInputPresetsService', () => {
	let service:FormInputPresetsService;

	beforeEach( async () => {
		const module:TestingModule = await Test.createTestingModule( {
			providers: [ FormInputPresetsService ],
		} ).compile();

		service = module.get<FormInputPresetsService>( FormInputPresetsService );
	} );

	it( 'should be defined', () => {
		expect( service ).toBeDefined();
	} );
} );
