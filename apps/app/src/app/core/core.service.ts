import { Portal } from '@angular/cdk/portal';
import { EventEmitter, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, fromEvent, Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { AssociatedStudies, AuthLoginResponse, SafeParticipant, SignupCheckResponse, SignupResponse } from '../../../../../libs/core/src';
import { User } from '../../interfaces/user.interfaces';
import { ApiService } from './api.service';


@Injectable( {
	providedIn: 'root',
} )
export class CoreService{

	public user$ = new BehaviorSubject<CoreService['user']>( undefined );
	public user:SafeParticipant | undefined;

	public scannerUIPortal:Portal<any> | undefined;

	public online$:BehaviorSubject<boolean>;

	public currentLocale:string = 'de-DE';

	public logout$ = new EventEmitter<any>();

	constructor(
		//		private storage:Storage,
		private api:ApiService,
		public alertController:AlertController,
		public translate:TranslateService,
		public router:Router,
	){
		this.user$.subscribe( user => this.user = user );

		this.online$ = new BehaviorSubject<boolean>( navigator.onLine );
		fromEvent( window, 'online' ).pipe( map( () => this.online$.next( true ) ) );
		fromEvent( window, 'offline' ).pipe( map( () => this.online$.next( false ) ) );

		this.translate.onLangChange.subscribe( change => {
			Preferences.set( { key: 'lang', value: change.lang } );
		} );

		// Get the time zone set on the user's device
		//		const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
		//		this.currentLocale = 'de-DE';
	}


	public async restoreAuth():Promise<any>{
		const { value: userRaw } = await Preferences.get( { key: 'user' } );
		const { value: token } = await Preferences.get( { key: 'auth.token' } );

		let user:SafeParticipant | undefined;
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


	public login( login:string, password:string ):Observable<User>{
		return this.api.post<AuthLoginResponse>( 'auth/login', { participant: login, password } )
			.pipe(
				switchMap( loginResponse => {
					const token = loginResponse?.access_token;
					if( !token )
						throw new Error( 'ERR.NO_ACCESS_TOKEN' );

					if( !( 'participant' in loginResponse ) || !loginResponse.participant )
						throw new Error( 'ERR.NO_PARTICIPANT' );

					Preferences.set( { key: 'auth.token', value: token } );
					this.api.setToken( token );

					Preferences.set( { key: 'user', value: JSON.stringify( loginResponse.participant ) } );
					this.user$.next( loginResponse.participant );

					// fetch additional information about the participant
					return this.api.get<AssociatedStudies>( 'study/studies' )
						.pipe( tap( data => {
							//							if( !( 'participant' in data ) || !data.participant )
							//								throw new Error( 'ERR.NO_PARTICIPANT_DATA' );

							//							Preferences.set( { key: 'user', value: JSON.stringify( data.participant ) } );
						} ) );
				} ),
			);
	}

	public signupCheck( key:string, code:string, domain?:string ):Observable<SignupCheckResponse>{
		return this.api.post( 'study/signup',
			{ key, code },
			{},
			domain,
		);
	}

	public signup( key:string, code:string, participant:string, domain?:string ):Observable<SignupResponse>{
		return this.api.post( 'study/signup',
			{ key, code, participant, signup: true },
			{},
			domain,
		);
	}


	public async logout(){
		const alert = await this.alertController.create( {
			message: this.translate.instant( 'USER.LOGOUT_CONFIRM' ),
			cssClass: 'center-buttons',
			buttons: [ 'Cancel', 'OK' ],
		} );

		await alert.present();
		const { role } = await alert.onDidDismiss();
		if( role === 'cancel' )
			return;

		this.logout$.next( true );

		this.api.setToken( undefined );
		this.user$.next( undefined );

		Preferences.clear();


		this.router.navigate( [ '/login' ] );
	}

}
