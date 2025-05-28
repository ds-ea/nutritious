import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { ReplaySubject } from 'rxjs';


export type KeyableArgument = string | string[];

@Injectable( {
	providedIn: 'root',
} )
export class StorageService{

	public ready:Promise<Storage>;
	public ready$ = new ReplaySubject<Storage>( 1 );
	private _storage?:Storage;

	constructor( private storage:Storage ){
		console.log( 'storage construct' );
		this.ready = this.init();
	}

	private async init(){
		console.log( 'storage init' );
		// If using, define drivers here: await this.storage.defineDriver(/*...*/);
		this._storage = await this.storage.create();
		if( !this._storage )
			throw new Error( 'storage not available' );

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
