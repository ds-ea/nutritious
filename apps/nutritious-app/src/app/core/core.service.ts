import { Portal } from '@angular/cdk/portal';
import { EventEmitter, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, fromEvent, merge, Observable } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { Study, StudyParticipantCredentials } from '../../interfaces/study.interface';
import { User } from '../../interfaces/user.interfaces';
import { ApiService, CallMethod } from './api.service';


@Injectable( {
	             providedIn: 'root',
             } )
export class CoreService{

	public user$ = new BehaviorSubject<CoreService['user']>( undefined );
	public user:User | undefined;
	public study$ = new BehaviorSubject<CoreService['study']>( undefined );
	public study:Study | undefined;

	public scannerUIPortal:Portal<any> | undefined;

	public online$:BehaviorSubject<boolean>;

	public currentLocale:string = 'de-DE';

	public logout$ = new EventEmitter<any>();

	constructor(
		//		private storage:Storage,
		private api:ApiService,
		public alertController:AlertController,
		public translate:TranslateService,
		public router:Router
	){
		this.user$.subscribe( user => this.user = user );
		this.study$.subscribe( study => this.study = study );

		this.online$ = new BehaviorSubject<boolean>( navigator.onLine );
		fromEvent( window, 'online' ).pipe( map( () => this.online$.next( true ) ) );
		fromEvent( window, 'offline' ).pipe( map( () => this.online$.next( false ) ) );

		this.translate.onLangChange.subscribe( change => {
			Preferences.set({key: 'lang', value: change.lang});
		});

		// Get the time zone set on the user's device
//		const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
//		this.currentLocale = 'de-DE';
	}


	public async restoreAuth():Promise<any>{
		const { value: userRaw } = await Preferences.get( { key: 'user' } );
		const { value: token } = await Preferences.get( { key: 'auth.token' } );

		let user:User | undefined;
		try{
			user = userRaw ? JSON.parse( userRaw ) : undefined;
		}catch( e ){
			console.error( 'error parsing stored user', e );
		}

		if( !user || !token )
			return undefined;

		this.api.setToken( token );
		this.user$.next( user );

		return user;
	}


	public login( username:string, password:string ):Observable<User>{
		return this.api.post<any>( 'auth/login', { username, password } )
			.pipe(
				switchMap( loginResponse => {
					const token = loginResponse?.[ 'access_token' ];
					if( !token )
						throw new Error( 'ERR.NO_ACCESS_TOKEN' );

					Preferences.set( { key: 'auth.token', value: token } );
					this.api.setToken( token );

					return this.api.post<User>( 'auth/me' )
						.pipe( tap( user => {
							Preferences.set( { key: 'user', value: JSON.stringify( user ) } );
							this.user$.next( user );
						} ) );
				} ),
			);
	}

	public signupCheck( key:string, code:string ):Observable<{ study:{name:string} }>{
		return this.api.post('study/signup', {key, response: code} );
	}

	public signup( key:string, code:string, participant:string ):Observable<{ study:{name:string}, credentials:StudyParticipantCredentials }>{
		return this.api.post('study/signup', {key, response: code, participant, signup:true} );
	}


	public async logout(){
		const alert = await this.alertController.create( {
			                                                 message: this.translate.instant('USER.LOGOUT_CONFIRM'),
			                                                 cssClass: 'center-buttons',
			                                                 buttons: [ 'Cancel', 'OK' ],
		                                                 } );

		await alert.present();
		const { role } = await alert.onDidDismiss();
		if( role === 'cancel' )
			return;

		this.logout$.next(true);

		this.api.setToken(undefined);
		this.user$.next(undefined);
		this.study$.next(undefined);

		Preferences.clear();


		this.router.navigate(['/login']);
	}

}
