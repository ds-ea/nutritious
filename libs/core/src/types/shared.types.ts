import { EntityState } from '../lib/entity';


//export type EntityStates = typeof EntityState[ keyof typeof EntityState ];
export type EntityStates = `${ EntityState }`;
//export type EntityStates = 'PENDING' | 'ENABLED' | 'DISABLED' | 'LOCKED' | 'ARCHIVED' | 'DELETED';


export type TimeFrame = {
	state:EntityStates;
	from?:string | Date | null;
	until?:string | Date | null;
}

