import { FormInputPreset, Group, Participant, Schedule, Slot, Step, Study, StudyContent, StudyForm, User } from '@prisma/client';
import { EntityState, EntityStates, ExportableMember, GroupMember, InputPreset, SafeGroup, SafeInputPreset } from '../../index';
import type { PublicStudy, SafeParticipant, SafeSchedule, SafeSlot, SafeStep, SafeStudyContent, SafeStudyForm, SafeUser } from '../../types';


type a = keyof Schedule;
type b = keyof SafeSchedule;
type c = Exclude<a, b>;

type CleanOptions<TClean, T> = {
	keep?:Array<keyof TClean>,
	remove?:Array<keyof T>,
	defaults?:boolean;
}

export function clean<
	TClean extends Record<PropertyKey, unknown>,
	//	T extends Record<PropertyKey, unknown> = Record<PropertyKey, unknown>,
	T extends TClean = TClean,
>(
	data:T,
	//	opts:CleanOptions<TClean, T>,
	opts:{
		keep?:Array<keyof TClean>,
		remove?:Array<keyof T>,
		defaults?:boolean;
	},
):TClean{
	const clean = ( opts.keep ? {} : { ...data } ) as TClean;

	if( opts.keep )
		for( const key of opts.keep )
			if( key in data && data[key as keyof T] != null )
				clean[key] = data[key as keyof T] as unknown as TClean[keyof TClean];

	if( opts.remove )
		for( const key of opts.remove )
			delete clean[key as keyof TClean];

	if( opts.defaults )
		for( const key of [ 'createdAt', 'updatedAt', 'state' ] )
			delete clean[key as keyof TClean];

	return clean;
}


export class Sanitize{


	static publicStudy( study:Study | PublicStudy ):PublicStudy{
		return clean<PublicStudy>( study, { keep: [ 'id', 'name' ] } );
	}

	static safeGroup( group:Group | SafeGroup ):SafeGroup{
		return clean<SafeGroup>( group, { keep: [ 'id', 'name', 'state' ] } );
	}

	static safeSchedule( schedule:Schedule ):SafeSchedule{
		return clean<SafeSchedule, Schedule>( schedule, { keep: [ 'id', 'daySetup', 'weekSetup' ], remove: [ 'createdAt' ] } );
	}

	static safeSlot( slot:Slot ):SafeSlot{
		return clean<SafeSlot, Slot>( slot, {
			remove: [ 'createdAt', 'updatedAt', 'scheduleId' ],
		} );
	}

	static safeStep( step:Step ):SafeStep{
		return clean( step as unknown as SafeStep, { keep: [ 'id', 'type', 'ref', 'config' ] } );
	}

	static safeUser( user:User | SafeUser ):SafeUser{
		return clean( user, { keep: [ 'id', 'name' ] } );
	}

	static safeParticipant( participant:Participant | SafeParticipant ):SafeParticipant{
		return clean( participant, { keep: [ 'id', 'name', 'settings', 'lang', 'timeZone' ] } );
	}

	public static safeStudyContent( content:StudyContent ):SafeStudyContent{
		return clean( content, { keep: [ 'id', 'title', 'content', 'translations' ] } );
	}

	public static safeFormInputPreset( preset:FormInputPreset | InputPreset | SafeInputPreset ):SafeInputPreset{
		return clean( preset as InputPreset, { keep: [ 'id', 'inputType', 'config', 'translations' ] } );
	}

	public static safeStudyForm( form:StudyForm ):SafeStudyForm{
		return clean( form as unknown as SafeStudyForm, { keep: [ 'id', 'title', 'intro', 'setup', 'translations' ] } );
	}

	public static exportableMember( member:GroupMember | ExportableMember ):ExportableMember{
		return clean( member, { keep: [ 'badge' ] } );
	}

	public static enforceState<T extends { state:EntityStates }>( record:T, allowedStates?:undefined | EntityStates | ( undefined | EntityStates )[] ):T
	public static enforceState<T extends { state:EntityStates }>( records:T[], allowedStates?:undefined | EntityStates | ( undefined | EntityStates )[] ):T[]
	public static enforceState<T extends { state:EntityStates }>( anyRecords:T | T[] | undefined, anyStates:undefined | EntityStates | ( undefined | EntityStates )[] = EntityState.Enabled ):T | T[] | undefined{
		if( !anyRecords )
			return undefined;

		const multiple = Array.isArray( anyRecords );
		const records = multiple ? anyRecords : [ anyRecords ];
		const validStates = Array.isArray( anyStates ) ? anyStates : [ anyStates ];
		const undefinedIsValid = validStates.includes( undefined );

		const filtered = records.filter( record =>
			( undefinedIsValid && !record.state )
			|| validStates.includes( record.state ),
		);

		return multiple ? filtered : filtered[0];
	}


	public static enforceDeepState<T extends { state:EntityStates }>( record:T, recursiveKeys:string | string[], allowedStates?:undefined | EntityStates | ( undefined | EntityStates )[] ):T
	public static enforceDeepState<T extends { state:EntityStates }>( records:T[], recursiveKeys:string | string[], allowedStates?:undefined | EntityStates | ( undefined | EntityStates )[] ):T[]
	public static enforceDeepState<T extends { state:EntityStates }, TT extends { state:EntityStates }>(
		anyRecords:T | T[] | undefined, anyKeys:string | string[], anyStates:undefined | EntityStates | ( undefined | EntityStates )[] = EntityState.Enabled,
	):T | T[] | undefined{
		if( !anyRecords )
			return undefined;

		const multiple = Array.isArray( anyRecords );
		const records = multiple ? anyRecords : [ anyRecords ];
		const recursiveKeys = Array.isArray( anyKeys ) ? anyKeys : [ anyKeys ];

		const filtered = anyKeys ? records : this.enforceState( records, anyStates );
		for( const recKey of recursiveKeys ){
			const splitPos = recKey.indexOf( '.' );
			const key = ( splitPos > 0 ? recKey.substring( 0, splitPos ) : recKey ) as keyof T;
			const deeper = splitPos > 0 ? recKey.substring( splitPos + 1 ) : undefined;

			for( const record of filtered ){
				if( key in record && Array.isArray( record[key] ) ){
					record[key] = (
						deeper
						? this.enforceDeepState( record[key] as TT[], deeper, anyStates )
						: this.enforceState( record[key] as TT[], anyStates )
					) as T[keyof T];
				}
			}

		}

		return multiple ? filtered : filtered[0];
	}

}
