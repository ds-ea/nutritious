import { CalendarOutlined } from '@ant-design/icons';
import { Button, Checkbox, CheckboxProps, Divider, InputProps, Popover, Space } from 'antd';
import { CheckboxOptionType } from 'antd/es/checkbox/Group';
import React, { useState } from 'react';


type CheckboxValueType = number;

const dayData:( CheckboxOptionType<CheckboxValueType> & { short:string } )[] = [
	{ label: 'Monday', short: 'Mon', value: 1 },
	{ label: 'Tuesday', short: 'Tue', value: 2 },
	{ label: 'Wednesday', short: 'Wed', value: 3 },
	{ label: 'Thursday', short: 'Thu', value: 4 },
	{ label: 'Friday', short: 'Fri', value: 5 },
	{ label: 'Saturday', short: 'Sat', value: 6 },
	{ label: 'Sunday', short: 'Sun', value: 0 },
];


const Parse = ( days:number[], startOfWeek = 0, shiftStartOfWeek = true ) => {

	const dayOptions = [ ...dayData ];

	if( startOfWeek === 0 && shiftStartOfWeek )
		dayOptions.unshift( dayOptions.pop()! );

	const dayMap = dayOptions.reduce<Record<number, typeof dayOptions[number]>>(
		( map, day ) =>
			( map[day.value as number] = day, map )
		, {} );

	const checkedAllWeek = days?.length === 7;
	const checkedWeekend = days.length === 2 && days[0] === 6 && days[1] === 0;

	const indeterminateAllWeek = !checkedWeekend && !checkedAllWeek && days?.length > 0;

	let label = '';
	if( checkedAllWeek )
		label = 'all week';
	else if( checkedWeekend )
		label = 'weekends';
	else{
		label = days.map( day => dayMap[day].short ).join( ', ' );
	}

	return { label, checkedAllWeek, checkedWeekend, indeterminateAllWeek, dayOptions };
};
Parse.displayName = 'Parse weekday information';


export const WeekdayPicker:
	React.FC<InputProps & { startOfWeek:0 | 1, shiftStartOfWeek?:boolean }>
	& { Parse:typeof Parse }
	= ( {
	value, onChange, startOfWeek, shiftStartOfWeek,
	...props
} ) => {

	const { disabled, readOnly } = props;

	const [ checkedDays, setCheckedDaysList ] = useState<CheckboxValueType[]>( value as unknown as CheckboxValueType[] );


	const { checkedAllWeek, indeterminateAllWeek, checkedWeekend, label, dayOptions }
		= Parse( checkedDays, startOfWeek, shiftStartOfWeek );


	const onCheckWeekdays:CheckboxProps['onChange'] = ( e ) => {
		if( readOnly || disabled )
			return;
		setCheckedDaysList( e.target.checked ? [ 0, 1, 2, 3, 4, 5, 6 ] : [] );
	};

	const onCheckWeekend:CheckboxProps['onChange'] = ( e ) => {
		if( readOnly || disabled )
			return;
		setCheckedDaysList( e.target.checked ? [ 6, 0 ] : [] );
	};

	const updateSelected = ( list:CheckboxValueType[] ) => {
		if( readOnly || disabled )
			return;
		setCheckedDaysList( list );
	};


	const picker = ( <>
		<Space>
			<Checkbox disabled={ disabled || readOnly } indeterminate={ indeterminateAllWeek } onChange={ onCheckWeekdays } checked={ checkedAllWeek }>{ 'Weekdays' }</Checkbox>
			<Checkbox disabled={ disabled || readOnly } onChange={ onCheckWeekend } checked={ checkedWeekend }>{ 'Weekend' }</Checkbox>
		</Space>

		<Divider />

		<Checkbox.Group disabled={ disabled || readOnly } options={ dayOptions } value={ checkedDays } onChange={ updateSelected } className={ 'dual-col-checkbox-group' } />
	</> );

	return <>
		<Popover content={ picker } trigger="click">
			<Button type={ disabled || readOnly ? 'dashed' : 'default' }>{ label } <CalendarOutlined /></Button>
		</Popover>
	</>;
};

WeekdayPicker.Parse = Parse;

