import { CheckboxOptionType } from 'antd/es/checkbox/Group';

// IMPORTANT: the element order MUST correspond to js date day values
export const dayData = [
	{ label: 'Sunday', short: 'Sun' },
	{ label: 'Monday', short: 'Mon' },
	{ label: 'Tuesday', short: 'Tue' },
	{ label: 'Wednesday', short: 'Wed' },
	{ label: 'Thursday', short: 'Thu' },
	{ label: 'Friday', short: 'Fri' },
	{ label: 'Saturday', short: 'Sat' },
] as const;


export type DayDataCheckboxValueType = number;
export const dayDataOptions:( CheckboxOptionType<DayDataCheckboxValueType> & { short:string } )[] =
	dayData.map( ( day, value ) => ( { ...day, value } ) );
