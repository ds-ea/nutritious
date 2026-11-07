import { TestBed } from '@angular/core/testing';
import { AppModule } from './app.module';
import { ApiService } from './core/api.service';
import { ConfigService } from './core/config.service';
import { CoreService } from './core/core.service';
import { StorageService } from './core/storage.service';
import { StudyService } from './study/study.service';


jest.mock( '@capacitor/preferences', () => ( {
	Preferences: {
		get: jest.fn().mockResolvedValue( { value: null } ),
		set: jest.fn().mockResolvedValue( undefined ),
		remove: jest.fn().mockResolvedValue( undefined ),
		clear: jest.fn().mockResolvedValue( undefined ),
	},
} ) );

jest.mock( '@capacitor/splash-screen', () => ( {
	SplashScreen: { hide: jest.fn().mockResolvedValue( undefined ) },
} ) );


/**
 * A dependency-injection smoke test, kept deliberately thin: it replaces ~20 generated
 * "should be created" stubs with the one assertion they were collectively reaching for. Its job is
 * to fail loudly when an Ionic or Angular major upgrade changes how providers resolve, which is
 * otherwise only discovered on a device.
 */
describe( 'AppModule', () => {

	beforeEach( async () => {
		TestBed.configureTestingModule( { imports: [ AppModule ] } );

		// mirrors the APP_INITIALIZER: ApiService reads API_URL in its constructor, so config has
		// to be loaded before anything that depends on it is resolved
		await TestBed.inject( ConfigService ).loadConfig();
	} );

	it( 'resolves the core singletons the whole app hangs off', () => {
		expect( TestBed.inject( ConfigService ) ).toBeInstanceOf( ConfigService );
		expect( TestBed.inject( ApiService ) ).toBeInstanceOf( ApiService );
		expect( TestBed.inject( CoreService ) ).toBeInstanceOf( CoreService );
	} );

	it( 'resolves the study services, including Ionic Storage', () => {
		expect( TestBed.inject( StorageService ) ).toBeInstanceOf( StorageService );
		expect( TestBed.inject( StudyService ) ).toBeInstanceOf( StudyService );
	} );

	it( 'throws if anything reads config before the initializer has loaded it', () => {
		// KNOWN FRAGILITY, pinned rather than fixed: ConfigService.get() dereferences an
		// undefined this.config when loadConfig() has not run, and ApiService calls it from its
		// constructor. Today the APP_INITIALIZER always wins the race, but injecting ApiService
		// any earlier turns into an opaque "Cannot read properties of undefined" at startup.
		TestBed.resetTestingModule();
		TestBed.configureTestingModule( { imports: [ AppModule ] } );

		expect( () => TestBed.inject( ApiService ) ).toThrow( /API_URL/ );
	} );

	it( 'wires StudyService to the same singletons as the rest of the app', () => {
		// providedIn: 'root' plus an explicit providers entry is an easy way to end up with two
		// CoreService instances and a session that only half the app can see
		const core = TestBed.inject( CoreService );
		const study = TestBed.inject( StudyService );

		core.account$.next( { token: 't', participant: { id: 'p1' } } as never );

		expect( study.currentAccountId ).toBe( 'p1' );
	} );

} );
