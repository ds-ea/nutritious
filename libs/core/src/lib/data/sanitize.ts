import { FormInputPreset, Participant, Schedule, Slot, Step, Study, StudyContent, StudyForm, User } from '@prisma/client';
import { ExportableMember, GroupMember, InputPreset, SafeInputPreset } from '../../index';
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

	static safeSchedule( schedule:Schedule ):SafeSchedule{
		return clean<SafeSchedule, Schedule>( schedule, { keep: [ 'id', 'daySetup', 'weekSetup' ], remove: [ 'createdAt' ] } );
	}

	static safeSlot( slot:Slot ):SafeSlot{
		return clean<SafeSlot, Slot>( slot, {
			remove: [ 'createdAt', 'updatedAt', 'scheduleId' ],
		} );
	}

	static safeStep( step:Step ):SafeStep{
		return clean( step as unknown as SafeStep, { keep: [ 'id', 'type', 'ref' ] } );
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
}
