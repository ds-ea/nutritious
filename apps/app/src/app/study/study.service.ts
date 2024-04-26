import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { BehaviorSubject, concat, EMPTY, forkJoin, from, Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { MatchedSlot, ParticipantAccount, PreparedSlot, PreparedStudy, PublicStudy, ResponseLog, ResponseLogEntry, ResponseLogState, SafeSlot, SubmitResponsesPayload } from '../../../../../libs/core/src';
import { ApiService } from '../core/api.service';
import { CoreService } from '../core/core.service';
import { StorageService } from '../core/storage.service';


@Injectable( {
	providedIn: 'root',
} )
export class StudyService{

	public studies$ = new BehaviorSubject<StudyService['studies']>( undefined );
	public studies:PreparedStudy[] | undefined;

	public preferences$ = new BehaviorSubject<StudyService['preferences']>( undefined );
	public preferences:unknown | undefined;

	public currentAccount:ParticipantAccount | undefined;
	public currentAccountId:string | 'default' = 'default';

	constructor(
		private api:ApiService,
		private core:CoreService,
		private readonly storage:StorageService,
	){
		this.studies$.subscribe( studies => this.studies = studies );
		this.preferences$.subscribe( preferences => this.preferences = preferences );

		this.core.account$.subscribe( account => {
			// act when active account has changed
			//			if( account?.participant.id == this.currentAccount?.participant.id && account?.host == this.currentAccount?.host ){}

			this.currentAccount = account;
			this.currentAccountId = account?.participant.id || 'default';
		} );

		this.core.logout$.subscribe( () => {
			this.studies$.next( undefined );
			this.preferences$.next( undefined );
			this.currentAccount = undefined;

			this.storage.clear();
			Preferences.remove( { key: 'study.prefs' } );

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

	public refreshStudies():Observable<{ study:PreparedStudy, log?:ResponseLog }[]>{
		if( !this.currentAccount )
			throw new Error( 'not logged in' );

		const studyLogs:Record<PublicStudy['id'], ResponseLog> = {};

		return concat(
			from( this.storage.get<PreparedStudy[]>( [ 'studies', this.currentAccountId ] ) )
				.pipe( switchMap( stored => {
					return stored?.length ? of( stored ) : EMPTY;
				} ) ),

			!this.core.online$.value ? EMPTY :
			this.api.get<PreparedStudy[]>( 'study/studies' )
				.pipe(
					tap( studies => {
						this.storage.set( [ 'studies', this.currentAccountId ], studies );


						//						Preferences.set( { key: 'studies', value: JSON.stringify( studies ) } );
						//						this.study = study;
						//						if( study?.catalog?.version && stored?.catalog?.version === study?.catalog?.version )
						//							return;
						//
						//						Preferences.set( { key: 'study', value: JSON.stringify( study ) } );
					} ),
				),
		).pipe(
			// get logs and merge
			switchMap( studies =>
				forkJoin(
					studies.map( study => from( this.getStudyLog( study.study.id ) ).pipe( map( log => ( { study, log } ) ) ) ),
				) ),
			tap( ( data ) => this.studies$.next( data.map( item => item.study ) ) ),
		);
	}

	public async restoreStudy():Promise<void>{

		let preferences:unknown | undefined;

		try{
			const { value: preferencesRaw } = await Preferences.get( { key: 'study.prefs' } );
			preferences = preferencesRaw ? JSON.parse( preferencesRaw ) : undefined;

		}catch( e ){
			console.error( 'error parsing stored study data', e );
		}

		const studies:PreparedStudy[] | undefined = await this.storage.get<PreparedStudy[]>( [ 'studies', this.currentAccountId ] );

		if( !studies )
			return undefined;

		this.studies$.next( studies );
	}


	public async getStudyLog( studyId:ResponseLog['study'] ):Promise<ResponseLog>{
		const log = await this.storage.get<ResponseLog>( [ 'log', studyId ] );
		return log || { study: studyId, entries: [], dayIndex: {} };
	}

	public addEntryToLog( log:ResponseLog, entry:ResponseLogEntry ){
		const index = log.entries.findIndex( e => e.uid === entry.uid );
		if( index !== -1 )
			log.entries[index] = entry;
		else
			log.entries.push( entry );

		if( !log.dayIndex[entry.forDay] )
			log.dayIndex[entry.forDay] = [];

		log.dayIndex[entry.forDay].push( entry.uid );

	}

	public markResponsesAsSent( studyId:ResponseLog['study'], uids:ResponseLogEntry['uid'][] ):Observable<ResponseLog>{
		return from( this.getStudyLog( studyId ) )
			.pipe(
				switchMap( log => {
					for( const uid of uids ){
						const entry = log.entries.find( entry => entry.uid === uid );
						if( !entry )
							continue;

						delete entry.response;
						entry.state = ResponseLogState.Done;
					}

					return from( this.storage.set( [ 'log', studyId ], log ) )
						.pipe(
							// gotta return the log
							map( updated => log ),
						);
				} ),
			);
	}

	/**
	 * records responses locally and attempts to send them afterward
	 */
	public logResponses( entries:ResponseLogEntry[] ):Observable<unknown>{

		const logEntriesByStudy = entries.reduce( ( acc, entry ) => {
			acc[entry.study] = acc[entry.study] || [];
			acc[entry.study].push( entry );
			return acc;
		}, {} as Record<ResponseLogEntry['study'], ResponseLogEntry[]> );

		const promisedLogs = Object.keys( logEntriesByStudy ).map(
			studyId => this.getStudyLog( studyId ),
		);


		return from( Promise.all( promisedLogs ) )
			.pipe(
				switchMap( async responseLogs => {
					for( const log of responseLogs ){
						logEntriesByStudy[log.study]
							.forEach( entry =>
								this.addEntryToLog( log, entry ),
							);
					}

					await Promise.all( responseLogs.map( log => this.storage.set( [ 'log', log.study ], log ) ) );

					return responseLogs;
				} ),
			);
	}



	/**
	 * logs responses locally and submits them to the API
	 * @param responses
	 */
	public submitResponses( responses:SubmitResponsesPayload ){

		const entriesByStudy:Record<ResponseLogEntry['study'], ResponseLogEntry[]> = {};

		// store all locally (state + data)
		for( const response of responses.responses ){
			const canBeSubmitted = !!response.data;

			// no need to process if not submitted or local metadata
			if( !canBeSubmitted || !!response.meta )
				continue;

			const entry:ResponseLogEntry = {
				state: canBeSubmitted ? ResponseLogState.Pending : ResponseLogState.Local,

				study: response._study,
				uid: response.uid,
				slot: response.slot,
				date: response.created,
				forDay: response.forDay,
			};

			if( canBeSubmitted )
				entry.response = response;

			if( !entriesByStudy[entry.study] )
				entriesByStudy[entry.study] = [];

			entriesByStudy[entry.study].push( entry );

		}

		// nothing to process
		if( !Object.keys( entriesByStudy ).length )
			return EMPTY;

		return concat( ...
			Object.entries( entriesByStudy ).map(
				( [ studyId, logEntries ] ) => {
					const submittableResponses = logEntries
						.filter( entry => !!entry.response?.data )
						.map( entry => entry.response );

					return this.logResponses( logEntries )
						.pipe(
							switchMap( logged =>
								( !submittableResponses.length || !this.core.online$.value )
								? EMPTY
								: this.api.post<{ success:ResponseLogEntry['uid'][] } | undefined>( 'study/responses', { responses: submittableResponses } ),
							),
							switchMap( result => {
								return !result?.success.length
									   ? EMPTY
									   : this.markResponsesAsSent( studyId, result.success )
									;

							} ),
						);
				} ),
		);
	}


	/**
	 * submit log entry and return information what was and what has note yet been submitted
	 * @param log
	 */

	/*public submitLog( log:LogEntry ):Observable<{ submitted:LogEntry, pending:LogEntry }>{
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
	}*/



	public async getSlot( slotId:SafeSlot['id'] ):Promise<MatchedSlot | undefined>{
		if( !this.studies?.length )
			return undefined;

		let study:PreparedStudy | undefined;
		let slot:PreparedSlot | undefined;
		let refs:MatchedSlot['refs'] = {};

		for( const preparedStudy of this.studies ){
			if( !preparedStudy.schedule?.slots )
				continue;

			for( const scheduleSlot of preparedStudy.schedule.slots ){
				if( scheduleSlot.id != slotId )
					continue;

				study = preparedStudy;
				slot = scheduleSlot;
			}

			if( slot )
				break;
		}

		if( !slot )
			return undefined;

		if( study?.schedule?.refs?.inputPresets )
			refs.inputPresets = study?.schedule?.refs?.inputPresets.reduce( ( map, preset ) => ( map[preset.id] = preset, map ), {} as NonNullable<MatchedSlot['refs']['inputPresets']> );

		if( slot.steps?.length )
			for( const step of slot.steps ){
				if( !step.ref )
					continue;

				if( !study?.schedule?.refs || !( step.type in study.schedule.refs ) )
					continue;

				if( !( step.type in refs ) || !refs[step.type] )
					refs[step.type] = {};

				const typeRefs = refs[step.type]!;

				const refData = study.schedule.refs[step.type]?.find( ref => ref.id == step.ref );
				if( refData )
					typeRefs[step.ref] = refData;

			}

		return { prepared: slot, refs };
	}

}
