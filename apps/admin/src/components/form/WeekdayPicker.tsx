import { CalendarOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { Button, Checkbox, CheckboxProps, Divider, Flex, InputProps, Popover, Space } from 'antd';
import React, { useEffect, useState } from 'react';
import { DayDataCheckboxValueType, dayDataOptions } from '../shared';


const sortedDayOptions = dayDataOptions.sort( ( a, b ) => a.value - b.value );

const Parse = ( days:number[] | undefined, startOfWeek = 0, shiftStartOfWeek = true ) => {

	if( !days )
		days = [];

	const dayOptions = [ ...sortedDayOptions ];
	if( startOfWeek === 1 && shiftStartOfWeek )
		dayOptions.push( dayOptions.shift()! );

	const dayMap = dayOptions.reduce<Record<number, typeof dayOptions[number]>>(
		( map, day ) =>
			( map[day.value as number] = day, map ),
		{},
	);

	const checkedWeekday = days.some( day => day !== 0 && day !== 6 );
	const checkedWeekendDay = days.includes( 6 ) || days.includes( 0 );

	const checkedAllWeek = days?.length === 7;
	const checkedWeekdays = days?.length === 5 && !checkedWeekendDay;
	const checkedWeekend = days.length === 2 && days.includes( 6 ) && days.includes( 0 );

	const indeterminateWeekdays = !checkedWeekendDay && !checkedWeekdays && days.length > 0;
	const indeterminateWeekend = !checkedWeekday && !checkedWeekend && checkedWeekendDay;

	let label = 'Select Days';
	if( checkedAllWeek )
		label = 'all week';
	else if( checkedWeekdays )
		label = 'weekdays';
	else if( checkedWeekend )
		label = 'weekends';
	else if( days.length )
		label = days.map( day => dayMap[day].short ).join( ', ' );

	return { label, checkedAllWeek, checkedWeekdays, checkedWeekend, indeterminateWeekdays, indeterminateWeekend, dayOptions };
};
Parse.displayName = 'Parse weekday information';


export const WeekdayPicker:
	React.FC<
		InputProps
		&
		{
			startOfWeek:0 | 1,
			shiftStartOfWeek?:boolean,
		}
	>
	& { Parse:typeof Parse }
	= (
	{
		value,
		onChange,
		startOfWeek,
		shiftStartOfWeek,
		...props
	} ) => {

	const { disabled, readOnly, allowClear } = props;

	const [ checkedDays, setCheckedDaysList ] = useState<DayDataCheckboxValueType[] | undefined>( value as unknown as DayDataCheckboxValueType[] );
	useEffect( () => {
		setCheckedDaysList( value as number[] | undefined );
	}, [ value ] );

	const updateValue = ( value:number[] ) => {
		if( readOnly || disabled )
			return;

		setCheckedDaysList( value );
		if( onChange )
			( onChange as any )( value );
	};

	const parsed = Parse( checkedDays, startOfWeek, shiftStartOfWeek );


	const onCheckWeekdays:CheckboxProps['onChange'] = ( e ) => {
		updateValue( e.target.checked ? [ 1, 2, 3, 4, 5 ] : [] );
	};

	const onCheckAllWeek:CheckboxProps['onChange'] = ( e ) => {
		updateValue( e.target.checked ? [ 0, 1, 2, 3, 4, 5, 6 ] : [] );
	};

	const onCheckWeekend:CheckboxProps['onChange'] = ( e ) => {
		updateValue( e.target.checked ? [ 6, 0 ] : [] );
	};

	const updateSelected = ( list:DayDataCheckboxValueType[] ) => {
		updateValue( list );
	};

	const clear = () => {
		updateValue( [] );
	};

	const picker = ( <>
		<Space direction={ 'vertical' }>
			<Checkbox disabled={ disabled || readOnly } onChange={ onCheckAllWeek } checked={ parsed.checkedAllWeek }>{ 'All Week' }</Checkbox>

			<Space>
				<Checkbox disabled={ disabled || readOnly } onChange={ onCheckWeekdays } checked={ parsed.checkedWeekdays } indeterminate={ parsed.indeterminateWeekdays }>{ 'Weekdays' }</Checkbox>
				<Checkbox disabled={ disabled || readOnly } onChange={ onCheckWeekend } checked={ parsed.checkedWeekend } indeterminate={ parsed.indeterminateWeekend }>{ 'Weekend' }</Checkbox>
			</Space>
		</Space>

		<Divider />

		<Space direction={ 'vertical' } size={ 'middle' }>
			<Checkbox.Group disabled={ disabled || readOnly } options={ parsed.dayOptions } value={ checkedDays } onChange={ updateSelected } className={ 'dual-col-checkbox-group' } />

			{ allowClear && <>
				<Flex justify={ 'flex-end' }>
					<Button
						type={ 'link' }
						size={ 'small' }
						icon={ <CloseCircleOutlined /> }
						onClick={ clear }
						disabled={ !checkedDays?.length }

					>clear</Button>
				</Flex>
			</> }
		</Space>
	</> );

	return <>
		<Popover content={ picker } trigger="click">
			<Button type={ disabled || readOnly ? 'dashed' : 'default' }
					style={ { color: !checkedDays?.length ? '#d9d9d9' : 'initial' } }
			>
				{ parsed.label }
				<CalendarOutlined />
			</Button>
		</Popover>
	</>;
};

WeekdayPicker.Parse = Parse;

