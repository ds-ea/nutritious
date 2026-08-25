import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';
import { ReplaySubject } from 'rxjs';
import { describeError } from './log-format';


export type KeyableArgument = string | string[];

@Injectable( {
	providedIn: 'root',
} )
export class StorageService{

	public ready:Promise<Storage>;
	public ready$ = new ReplaySubject<Storage>( 1 );
	private _storage?:Storage;

	constructor( private storage:Storage ){
		this.ready = this.init();

		// init() is kicked off from the constructor, so without this a failure surfaces only as
		// an unhandled rejection - and local storage is where unsent responses live.
		this.ready.catch( err =>
			console.error( `[storage] initialization failed, offline data will not persist: ${ describeError( err ) }` ),
		);
	}

	private async init(){
		// If using, define drivers here: await this.storage.defineDriver(/*...*/);
		this._storage = await this.storage.create();
		if( !this._storage )
			throw new Error( 'storage not available' );

		// app.module asks for [ CordovaSQLiteDriver, IndexedDB ]. If the SQLite driver did not
		// register - it is a Cordova plugin, so it has to be present in the *native* project,
		// which differs per platform - localforage silently falls back to IndexedDB. New data
		// keeps working, so nothing looks wrong, while anything previously written to SQLite is
		// left behind. Say which one actually won.
		const driver = this._storage.driver;

		if( driver === CordovaSQLiteDriver._driver )
			console.info( `[storage] driver: ${ driver } (SQLite)` );
		else
			console.warn( `[storage] driver: ${ driver ?? 'unknown' } - the SQLite driver did not register, so this platform is NOT using SQLite` );

		this.ready$.next( this._storage );

		return Promise.resolve( this._storage );
	}

	private static makeKey( key:KeyableArgument ):string{
		return Array.isArray( key ) ? key.join( '.' ) : key;
	}

	public async set( key:KeyableArgument, value:any ){
		const storage = await this.ready;
		return storage.set( StorageService.makeKey( key ), value );
	}

	public async get<T>( key:KeyableArgument ):Promise<T | undefined>{
		const storage = await this.ready;
		return storage.get( StorageService.makeKey( key ) );
	}


	public async clear(){
		return this.ready.then( storage => storage.clear() );
	}
}
