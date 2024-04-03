import type { PublicStudy, SafeParticipant, SafeUser } from '@nutritious/core';
import type { Participant, Study, User } from '@prisma/client';


type CleanOptions<TClean, T> = {
	keep?:Array<keyof TClean>,
	remove?:Array<keyof T>,
	defaults?:boolean;
}

export function clean<
	TClean extends Record<string, unknown>,
	T extends TClean = TClean
>(
	data:T,
	opts:CleanOptions<TClean, T>,
):TClean{
	const clean = opts.keep ? {} as TClean : { ...data };

	if( opts.keep )
		for( const key of opts.keep )
			if( key in data && data[key] != null )
				clean[key] = data[key];

	if( opts.remove )
		for( const key of opts.remove )
			delete clean[key as keyof TClean];

	if( opts.defaults )
		for( const key of [ 'createdAt', 'updatedAt', 'state' ] )
			delete clean[key as keyof TClean];

	return clean as TClean;
};


export class Sanitize{

	static publicStudy( study:Study ):PublicStudy{
		return clean<PublicStudy>( study, { keep: [ 'id', 'name' ] } );
	}

	static safeUser( user:User ):SafeUser{
		return clean( user, { keep: [ 'id', 'name' ] } );
	}

	static safeParticipant( participant:Participant ):SafeParticipant{
		return clean( participant, { keep: [ 'id', 'name', 'settings', 'lang', 'timeZone' ] } );
	}

}
