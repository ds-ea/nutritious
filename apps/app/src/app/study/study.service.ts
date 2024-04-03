import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { formatISO } from 'date-fns';
import { BehaviorSubject, concat, EMPTY, forkJoin, from, Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { LogEntry } from '../../interfaces/log.interface';
import { Study, StudyDTO } from '../../interfaces/study.interface';
import { ApiService } from '../core/api.service';
import { CoreService } from '../core/core.service';


@Injectable( {
	providedIn: 'root',
} )
export class StudyService{

	public studies$ = new BehaviorSubject<StudyService['studies']>( undefined );
	public studies:Study[] | undefined;

	public preferences$ = new BehaviorSubject<StudyService['preferences']>( undefined );
	public preferences:unknown | undefined;

	public study$ = new BehaviorSubject<StudyService['study']>( undefined );
	public study:StudyDTO | undefined;

	constructor(
		private api:ApiService,
		private core:CoreService,
	){
		this.study$.subscribe( study => this.study = study );
		this.studies$.subscribe( studies => this.studies = studies );
		this.preferences$.subscribe( preferences => this.preferences = preferences );

		this.core.logout$.subscribe( () => {
			this.studies$.next( undefined );
			this.preferences$.next( undefined );
			this.study$.next( undefined );

			Preferences.set( { key: 'studies', value: JSON.stringify( undefined ) } );
			Preferences.set( { key: 'study.prefs', value: JSON.stringify( undefined ) } );
		} );
	}


	public getStudy():Observable<StudyDTO>{
		if( this.study )
			return of( this.study );

		return this.refreshStudy();
	}

	public refreshStudy():Observable<StudyDTO>{
		let stored:StudyDTO;
		return concat(
			from( Preferences.get( { key: 'study' } ) )
				.pipe( switchMap( studyRaw => {
					try{
						if( studyRaw?.value )
							stored = JSON.parse( studyRaw.value );
					}catch( e ){}
					return stored ? of( stored ) : EMPTY;
				} ) ),

			!this.core.online$.value ? EMPTY :
			this.api.get<StudyDTO>( 'foodstudy/study' )
				.pipe(
					tap( study => {
						this.study = study;
						if( study?.catalog?.version && stored?.catalog?.version === study?.catalog?.version )
							return;

						Preferences.set( { key: 'study', value: JSON.stringify( study ) } );
					} ),
				),
		).pipe( tap( study => this.study$.next( study.study as any ) ) );
	}

	public async restoreStudy():Promise<any>{
		const { value: studiesRaw } = await Preferences.get( { key: 'studies' } );
		const { value: preferencesRaw } = await Preferences.get( { key: 'study.prefs' } );

		let studies:Study[] | undefined;
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
		this.studies$.next( studies );

		return this.study;
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
