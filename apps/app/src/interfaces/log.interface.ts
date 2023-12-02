export enum MealType{
	BREAKFAST = 'breakfast',
	LUNCH = 'lunch',
	DINNER = 'dinner',
	SNACK = 'snack',
}

export enum AttendanceOption{
	ALONE_IDLE = '0',
	ALONE_BUSY = '1',
	TWO = '2',
	MORE = '3',
}

export type LogEntryMeal = {
	date:string;
	meal?:string;
	attend?:string | number;
}

export type LogEntryFood = MealItem[];

export type LogEntryCatalogAnswers = {
	[groupID:string]: {
		[questionKey:string]:any
	}
};

export interface LogEntry{
	
	date:string;
	
	meal?:LogEntryMeal;
	food?:LogEntryFood;
	
	answers?:LogEntryCatalogAnswers;
}


export interface FoodLibraryItem{
	id:number;
	key:string;
	de?:string;
	en?:string;
	
	_fuzzy?:any;
}


export interface MealItem{
	foodID:number;
	foodKey:string;
	
	quantity?:number;
	unit?:string;
	
	_food?:FoodLibraryItem;
}
