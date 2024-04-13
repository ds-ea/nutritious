import type { BLS } from '@prisma/client';
import { BLSAttendanceOption, BLSMealType } from '../../lib/study';


export type BLSFoodItem = Pick<BLS, 'id' | 'key' | 'name' | 'translations'>;

export type BLSMealItem = {
	foodId?:number;
	blsKey:string;

	quantity?:number;
	unit?:string;
}

export type BLSMeal = {
	date:string;

	type?:BLSMealType;
	attendance?:BLSAttendanceOption;
}

export type MealBLSResponseData = {
	meal:BLSMeal;
	items:BLSMealItem[];
}
