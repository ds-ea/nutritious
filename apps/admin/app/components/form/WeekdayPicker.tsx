import { CalendarOutlined } from '@ant-design/icons';
import { Button, Checkbox, CheckboxProps, Divider, InputProps, Popover, Space } from 'antd';
import { CheckboxOptionType } from 'antd/es/checkbox/Group';
import React, { useState } from 'react';


type CheckboxValueType = number;

export const WeekdayPicker:React.FC<InputProps & { startOfWeek:0 | 1, shiftStartOfWeek?:boolean }> = ( {
	value, onChange, startOfWeek, shiftStartOfWeek,
	...props
} ) => {

	const { disabled, readOnly } = props;

	const dayOptions:( CheckboxOptionType<CheckboxValueType> & { short:string } )[] = [
		{ label: 'Monday', short: 'Mon', value: 1 },
		{ label: 'Tuesday', short: 'Tue', value: 2 },
		{ label: 'Wednesday', short: 'Wed', value: 3 },
		{ label: 'Thursday', short: 'Thu', value: 4 },
		{ label: 'Friday', short: 'Fri', value: 5 },
		{ label: 'Saturday', short: 'Sat', value: 6 },
		{ label: 'Sunday', short: 'Sun', value: 0 },
	];
	if( startOfWeek === 0 && shiftStartOfWeek )
		dayOptions.unshift( dayOptions.pop()! );

	const dayMap = dayOptions.reduce<Record<number, typeof dayOptions[number]>>(
		( map, day ) =>
			( map[day.value as number] = day, map )
		, {} );


	const [ checkedDays, setCheckedDaysList ] = useState<CheckboxValueType[]>( value as unknown as CheckboxValueType[] );

	const checkedAllWeek = checkedDays?.length === 7;
	const checkedWeekend = checkedDays.length === 2 && checkedDays[0] === 6 && checkedDays[1] === 0;

	const indeterminateAllWeek = !checkedWeekend && !checkedAllWeek && checkedDays?.length > 0;

	let label = '';
	if( checkedAllWeek )
		label = 'all week';
	else if( checkedWeekend )
		label = 'weekends';
	else{
		label = checkedDays.map( day => dayMap[day].short ).join( ', ' );
	}

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
			<Button disabled={ disabled || readOnly }>{ label } <CalendarOutlined /></Button>
		</Popover>
	</>;
};
