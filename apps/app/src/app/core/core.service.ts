import { Portal } from '@angular/cdk/portal';
import { EventEmitter, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, fromEvent, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { AuthLoginResponse, ParticipantAccount, SignupCheckResponse, SignupResponse } from '../../../../../libs/core/src';
import { ApiService } from './api.service';
import { CoreState } from './types';


@Injectable( {
	providedIn: 'root',
} )
export class CoreService{

	public state$ = new BehaviorSubject<CoreState | undefined>( undefined );
	public accounts$ = new BehaviorSubject<CoreService['accounts']>( undefined );
	public accounts:ParticipantAccount[] | undefined;

	public account$ = new BehaviorSubject<CoreService['account']>( undefined );
	public account:ParticipantAccount | undefined;

	public scannerUIPortal:Portal<any> | undefined;

	public online$:BehaviorSubject<boolean>;
	public logout$ = new EventEmitter<any>();

	public currentLocale:string = 'de-DE';


	constructor(
		//		private storage:Storage,
		private api:ApiService,
		public alertController:AlertController,
		public translate:TranslateService,
		public router:Router,
	){
		this.accounts$.subscribe( accounts => this.accounts = accounts );
		this.account$.subscribe( account => this.account = account );

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
		const { value: accountsRaw } = await Preferences.get( { key: 'accounts' } );
		const { value: stateRaw } = await Preferences.get( { key: 'state' } );

		let accounts:ParticipantAccount[] | undefined;
		let state:CoreState | undefined;
		try{
			accounts = accountsRaw ? JSON.parse( accountsRaw ) : undefined;
			state = stateRaw ? JSON.parse( stateRaw ) : undefined;
		}catch( e ){
			console.error( 'error parsing stored account', e );
		}

		if( !accounts?.length )
			return undefined;

		const currentAccount = state?.participant ? accounts.find( ac => ac.participant.id == state?.participant ) : accounts[0];
		if( !currentAccount )
			return undefined;

		state = Object.assign( state || {}, { participant: currentAccount.participant.id } as CoreState );

		this.api.setToken( currentAccount.token );

		this.accounts$.next( accounts );
		this.account$.next( currentAccount );
		this.state$.next( state );

		return currentAccount;
	}


	public login( login:string, password:string, domain?:string ):Observable<ParticipantAccount>{
		return this.api.post<AuthLoginResponse>( 'auth/login', { participant: login, password }, {}, domain )
			.pipe(
				switchMap( loginResponse => {
					const token = loginResponse?.token;
					if( !token )
						throw new Error( 'ERR.NO_ACCESS_TOKEN' );

					if( !( 'participant' in loginResponse ) || !loginResponse.participant )
						throw new Error( 'ERR.NO_PARTICIPANT' );

					let accounts = this.accounts || [];

					let account:ParticipantAccount = {
						token,
						host: domain,
						hostName: loginResponse?.hostName,
						participant: loginResponse.participant,
					};

					const existing = accounts.find( ac => ac.participant.id == loginResponse.participant.id );
					if( existing )
						account = Object.assign( existing, account );
					else
						accounts.push( account );

					const state:CoreState = this.state$.value || {} as CoreState;
					state.participant = loginResponse.participant.id;

					Preferences.set( { key: 'accounts', value: JSON.stringify( accounts ) } );
					Preferences.set( { key: 'state', value: JSON.stringify( state ) } );

					this.api.setToken( token );
					this.accounts$.next( accounts );
					this.account$.next( account );
					this.state$.next( state );

					return of( account );
					// fetch additional information about the participant
					/*return this.api.get<AssociatedStudies>( 'study/studies' )
						.pipe( tap( data => {
							//							if( !( 'participant' in data ) || !data.participant )
							//								throw new Error( 'ERR.NO_PARTICIPANT_DATA' );

							//							Preferences.set( { key: 'user', value: JSON.stringify( data.participant ) } );
						} ) );*/
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
		this.account$.next( undefined );
		this.state$.next( undefined );

		Preferences.clear();


		this.router.navigate( [ '/login' ] );
	}

}
