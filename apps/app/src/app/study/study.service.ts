import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { formatISO } from 'date-fns';
import { concat, defer, EMPTY, forkJoin, from, Observable, of } from 'rxjs';
import { delay, map, switchMap, tap } from 'rxjs/operators';
import { LogEntry } from '../../interfaces/log.interface';
import { Study, StudyDTO } from '../../interfaces/study.interface';
import { User } from '../../interfaces/user.interfaces';
import { ApiService } from '../core/api.service';
import { CoreService } from '../core/core.service';


@Injectable( {
	             providedIn: 'root',
             } )
export class StudyService{

	public study:StudyDTO | undefined;

	constructor(
		private api:ApiService,
		private core:CoreService,
	){
		this.core.logout$.subscribe(()=>{
			this.study = undefined;
		})
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
		).pipe( tap( study => this.core.study$.next(study.study) ));
	}

	public async restoreStudy():Promise<any>{
		const { value: studyRaw } = await Preferences.get( { key: 'study' } );

		let study:StudyDTO | undefined;
		try{
			study = studyRaw ? JSON.parse( studyRaw ) : undefined;
		}catch( e ){
			console.error( 'error parsing stored study', e );
		}

		if( !study )
			return undefined;

		this.study = study;

		return this.study;
	}


	/**
	 * submit log entry and return information what was and what has note yet been submitted
	 * @param log
	 */
	public submitLog( log:LogEntry ):Observable<{submitted:LogEntry, pending:LogEntry}>{
		let requests:Observable<any>[] = [];

		let submitted:LogEntry = {date: log.date};
		let pending:LogEntry = {...log};

		if( log.meal || log.food ){
			const mealData = {
				date: log.meal?.date,
				meal_type: log.meal?.meal,
				people: log.meal?.attend,
				data: log.food?.map( mi => ({k: mi.foodKey, q: mi.quantity}) ),
			};

			requests.push(
				this.api.post('foodstudy/food', mealData)
					.pipe( tap( done => {
						submitted.meal = log.meal;
						submitted.food = log.food;
						delete pending.meal;
						delete pending.food;
					}))
			);
		}

		if( log.answers ){
			let answers:Record<string, any> = {};
			for( const [groupID, groupAnswers] of Object.entries(log.answers) ){
				for( const [k,v] of Object.entries(groupAnswers) ){
					answers[k] = v;
				}
			}

			requests.push(
				this.api.post('foodstudy/log', { data: answers })
					.pipe( tap( done => {
						submitted.answers = log.answers;
						delete pending.answers;

						const answered = { date: formatISO( new Date() ) };
						Preferences.set( { key: 'questions-last-answer', value: JSON.stringify( answered ) } );
					}))
			);
		}

		if( !requests.length )
			return EMPTY;

		return forkJoin( requests )
			.pipe(
				map( done => {
					return {submitted, pending}
				} ) );
	}



}
