import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { formatISO } from 'date-fns';
import { BehaviorSubject, concat, EMPTY, forkJoin, from, Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { ParticipantAccount, PreparedStudy } from '../../../../../libs/core/src';
import { LogEntry } from '../../interfaces/log.interface';
import { ApiService } from '../core/api.service';
import { CoreService } from '../core/core.service';


@Injectable( {
	providedIn: 'root',
} )
export class StudyService{

	public studies$ = new BehaviorSubject<StudyService['studies']>( undefined );
	public studies:PreparedStudy[] | undefined;

	public preferences$ = new BehaviorSubject<StudyService['preferences']>( undefined );
	public preferences:unknown | undefined;

	public currentAccount:ParticipantAccount | undefined;

	constructor(
		private api:ApiService,
		private core:CoreService,
	){
		this.studies$.subscribe( studies => this.studies = studies );
		this.preferences$.subscribe( preferences => this.preferences = preferences );

		this.core.account$.subscribe( account => {
			// act when active account has changed
			if( account?.participant.id == this.currentAccount?.participant.id && account?.host == this.currentAccount?.host )
				return;

			this.currentAccount = account;
			//			this.refreshStudies();
		} );

		this.core.logout$.subscribe( () => {
			this.studies$.next( undefined );
			this.preferences$.next( undefined );

			Preferences.set( { key: 'studies', value: JSON.stringify( undefined ) } );
			Preferences.set( { key: 'study.prefs', value: JSON.stringify( undefined ) } );
		} );
	}


	// CONTINUE:
	/*public getStudy():Observable<PublicStudy>{
		//@ts-ignore
		return undefined;

		if( this.study )
			return of( this.study );

		return this.refreshStudies();
	}*/

	public refreshStudies():Observable<PreparedStudy[]>{
		if( !this.currentAccount ){

		}

		let stored:PreparedStudy[];

		return concat(
			from( Preferences.get( { key: 'studies' } ) )
				.pipe( switchMap( studiesRaw => {
					console.log( 'cached studies in refresh', studiesRaw );
					try{
						if( studiesRaw?.value?.length )
							stored = JSON.parse( studiesRaw.value );
					}catch( e ){}
					return stored?.length ? of( stored ) : EMPTY;
				} ) ),

			!this.core.online$.value ? EMPTY :
			this.api.get<PreparedStudy[]>( 'study/studies' )
				.pipe(
					tap( studies => {
						Preferences.set( { key: 'studies', value: JSON.stringify( studies ) } );
						//						this.study = study;
						//						if( study?.catalog?.version && stored?.catalog?.version === study?.catalog?.version )
						//							return;
						//
						//						Preferences.set( { key: 'study', value: JSON.stringify( study ) } );
					} ),
				),
		).pipe( tap( studies => this.studies$.next( studies ) ) );
	}

	public async restoreStudy():Promise<void>{
		const { value: studiesRaw } = await Preferences.get( { key: 'studies' } );
		const { value: preferencesRaw } = await Preferences.get( { key: 'study.prefs' } );

		let studies:PreparedStudy[] | undefined;
		let preferences:unknown | undefined;

		try{
			studies = studiesRaw ? JSON.parse( studiesRaw ) : undefined;
			preferences = preferencesRaw ? JSON.parse( preferencesRaw ) : undefined;
		}catch( e ){
			console.error( 'error parsing stored study data', e );
		}

		if( !studies )
			return undefined;

		this.studies$.next( studies );
	}


	/**
	 * submit log entry and return information what was and what has note yet been submitted
	 * @param log
	 */
	public submitLog( log:LogEntry ):Observable<{ submitted:LogEntry, pending:LogEntry }>{
		let requests:Observable<any>[] = [];

		let submitted:LogEntry = { date: log.date };
		let pending:LogEntry = { ...log };

		if( log.meal || log.food ){
			const mealData = {
				date: log.meal?.date,
				meal_type: log.meal?.meal,
				people: log.meal?.attend,
				data: log.food?.map( mi => ( { k: mi.foodKey, q: mi.quantity } ) ),
			};

			requests.push(
				this.api.post( 'foodstudy/food', mealData )
					.pipe( tap( done => {
						submitted.meal = log.meal;
						submitted.food = log.food;
						delete pending.meal;
						delete pending.food;
					} ) ),
			);
		}

		if( log.answers ){
			let answers:Record<string, any> = {};
			for( const [ groupID, groupAnswers ] of Object.entries( log.answers ) ){
				for( const [ k, v ] of Object.entries( groupAnswers ) ){
					answers[k] = v;
				}
			}

			requests.push(
				this.api.post( 'foodstudy/log', { data: answers } )
					.pipe( tap( done => {
						submitted.answers = log.answers;
						delete pending.answers;

						const answered = { date: formatISO( new Date() ) };
						Preferences.set( { key: 'questions-last-answer', value: JSON.stringify( answered ) } );
					} ) ),
			);
		}

		if( !requests.length )
			return EMPTY;

		return forkJoin( requests )
			.pipe(
				map( done => {
					return { submitted, pending };
				} ) );
	}



}
