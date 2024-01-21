import { LegacyLogFood } from '../../../../prisma/generated/client-legacy';


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
	[groupID:string]:{
		[questionKey:string]:any
	}
};

export type LogEntry = {

	date:string;

	meal?:LogEntryMeal;
	food?:LogEntryFood;

	answers?:LogEntryCatalogAnswers;
}


export type FoodLibraryItem = {
	id:number;
	key:string;
	de?:string;
	en?:string;

	_fuzzy?:any;
}


export type MealItem = {
	foodID:number;
	foodKey:string;

	quantity?:number;
	unit?:string;

	_food?:FoodLibraryItem;
}

export type LegacyFoodLog = {
	date:LegacyLogFood['date'],
	meal_type:LegacyLogFood['meal_type'],
	people:LegacyLogFood['people'],
	data:LogEntryFood,
}
