import { PlatformModule } from '@angular/cdk/platform';
import { PortalModule } from '@angular/cdk/portal';
import { LOCATION_INITIALIZED } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, Injector, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouteReuseStrategy } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { SplashScreen } from '@capacitor/splash-screen';

import { IonicModule, IonicRouteStrategy, Platform } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage-angular';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { DateFnsModule } from 'ngx-date-fns';
import { EMPTY } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../environments/environment';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ApiService } from './core/api.service';
import { ConfigService } from './core/config.service';
import { CoreService } from './core/core.service';
import { UserModule } from './user/user.module';


export function createTranslateLoader( http:HttpClient ){
	return new TranslateHttpLoader( http, './assets/i18n/', '.json' );
}

export function appInitializerFactory( injector:Injector, translate:TranslateService, platform:Platform, configService:ConfigService ){
	return () => new Promise<any>( async ( resolve ) => {
		// waiting for the platform to be rrrready first
		await platform.ready();

		const config = await configService.loadConfig( environment.build as any ).catch( e => null );
		if( !config )
			console.error( 'configuration not available' );

		const locationInitialized = await injector.get( LOCATION_INITIALIZED, Promise.resolve( null ) );
		const selectedLang = await Preferences.get( { key: 'lang' } );

		translate.setDefaultLang( 'en' );
		const langToSet = selectedLang.value || translate.getBrowserLang();
		if( !langToSet ){
			console.warn( 'no language to initialize' );
		}else{
			await translate.use( langToSet ).pipe(
				tap( () => {
					console.info( `Successfully initialized '${ langToSet }' language.'` );
				} ),
				catchError( err => {
					console.error( `Problem with '${ langToSet }' language initialization.'` );
					return EMPTY;
				} ),
			).toPromise();
		}

		await SplashScreen.hide();


		resolve( undefined );
	} );
}

@NgModule( {
	declarations: [ AppComponent ],
	imports: [
		BrowserModule,
		IonicModule.forRoot(),
		AppRoutingModule,
		BrowserAnimationsModule,
		HttpClientModule,
		PlatformModule,
		IonicStorageModule,
		DateFnsModule.forRoot(),
		PortalModule,
		TranslateModule.forRoot( {
			loader: {
				provide: TranslateLoader,
				useFactory: ( createTranslateLoader ),
				deps: [ HttpClient ],
			},
		} ),
		UserModule,
	],
	providers: [
		CoreService,
		ApiService,
		{
			provide: APP_INITIALIZER,
			useFactory: appInitializerFactory,
			deps: [ Injector, TranslateService, Platform, ConfigService ],
			multi: true,
		},
		{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
	],
	bootstrap: [ AppComponent ],
} )
export class AppModule{}
