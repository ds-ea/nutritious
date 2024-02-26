import { SlotInputTypes, SlotWithListId } from '@components/groups/ScheduleFormElements';
import type { Prisma, Slot } from '@nutritious/core';
import { Form, Input, Segmented, Space, TimePicker, TimePickerProps } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import React, { useEffect, useState } from 'react';



type Props<DataType extends SlotInputTypes = SlotInputTypes> = {
	dayStart?:number,
	slot?:SlotWithListId<DataType>,
	isCreate?:boolean,
	onChange?:( data:SlotWithListId<DataType> ) => void,
	onFinish?:( data:SlotWithListId<DataType> ) => void,
	submit?:number
	uniqueSlotChecks?:( Pick<Slot, 'key' | 'name'> & { _listId:string, time?:number } )[],

};

export const SlotShortEditor:React.FC<Props> = ( {
	dayStart, slot, isCreate,
	onChange, onFinish,
	submit, uniqueSlotChecks,
	...props
} ) => {

	if( !slot )
		return ( <></> );
	const [ form ] = Form.useForm<Props['slot']>();

	const [ isAllDay, setIsAllDay ] = useState<boolean>( slot.availability ? !!slot.availability?.allDay : true );
	const [ startTime, setStartTime ] = useState<Dayjs | undefined>();
	const [ startMinutes, setStartMinutes ] = useState( slot?.availability?.start );


	// for triggering submit from outside buttons
	useEffect( () => ( submit && form.submit(), undefined ), [ submit, form ] );

	const onFormChanges = () => {
		const data = form.getFieldsValue();
		setIsAllDay( data?.availability ? !!data.availability?.allDay : true );
	};

	const finishUp = () => {
		const data = Object.assign( {}, slot, form.getFieldsValue() );
		onFinish?.( data );
	};



	useEffect( () => {
		if( !slot.availability )
			slot.availability = { allDay: true };

		form.setFieldsValue( slot );

		setIsAllDay( slot.availability ? !!slot.availability?.allDay : true );

		const time =
			!slot.availability?.start
			? undefined
			: dayjs( '00:00', 'HH:mm' )
				.add( ( dayStart ?? 0 ) + ( slot?.availability?.start ?? 0 ), 'minutes' )
		;

		setStartMinutes( slot.availability?.start ?? undefined );
		setStartTime( time );

	}, [ slot ] );


	const applyTime:TimePickerProps['onChange'] = ( date, dateStr ) => {
		let minutesSinceStartOfDay:number | undefined = undefined;
		let time:Dayjs | undefined = undefined;

		if( date ){
			const minutesSinceMidnight = ( date.hour() * 60 ) + date.minute();
			minutesSinceStartOfDay = minutesSinceMidnight - ( dayStart ?? 0 );
			time = dayjs( '00:00', 'HH:mm' )
				.add( ( dayStart ?? 0 ) + ( minutesSinceStartOfDay ?? 0 ), 'minutes' )
			;
		}

		const availability:Prisma.SlotTimeFrameCreateInput = form.getFieldValue( 'availability' ) || {};
		availability.allDay = isAllDay;
		availability.start = minutesSinceStartOfDay;

		form.setFieldValue( 'availability', availability );

		setStartMinutes( minutesSinceStartOfDay );
		setStartTime( time );

		form.validateFields();
		onFormChanges();
	};

	return (
		<Form form={ form } onChange={ onFormChanges } onFinish={ finishUp }>
			<Space direction={ 'vertical' }>

				<Form.Item name="key"
						   label="Key"
						   rules={ [
							   { required: true },
							   {
								   validator: ( rule, value ) =>
									   uniqueSlotChecks?.find( ( { key, _listId } ) => key === value && _listId !== slot._listId )
									   ? Promise.reject()
									   : Promise.resolve(),
								   message: 'There is already a slot with this key',
							   },
						   ] }
				>
					<Input placeholder="lunch, bedtime" />
				</Form.Item>
				<Form.Item name="name"
						   label="Name"
						   rules={ [
							   { required: true },
							   {
								   validator: ( rule, value ) =>
									   uniqueSlotChecks?.find( ( { name, _listId } ) => name === value && _listId !== slot._listId )
									   ? Promise.reject()
									   : Promise.resolve(),
								   message: 'There is already a slot with the same name',
							   },
						   ] }
				>
					<Input />
				</Form.Item>

				<Form.Item label=""
						   name={ [ 'availability', 'allDay' ] }
						   rules={ [ { required: true } ] }
				>
					<Segmented options={ [ { label: 'All Day', value: true }, { label: 'Time of Day', value: false } ] } />
				</Form.Item>

				{ isAllDay
				  ? <Form.Item name={ [ 'availability', 'start' ] }></Form.Item>
				  : (
					  <Form.Item label="Time"
								 name={ [ 'availability', 'start' ] }
								 rules={ [
									 //									 { required: true },
									 {
										 validator: ( rule, value ) => {
											 if( value == null )
												 return Promise.reject( new Error( 'Please select a time or switch to "all-day"' ) );

											 if( uniqueSlotChecks?.find( ( { time, _listId } ) => time === startMinutes && _listId !== slot?._listId ) )
												 return Promise.reject( 'The selected time is already occupied' );

											 return Promise.resolve();
										 },
									 },
								 ] }
					  >
						  <Form.Item style={ { margin: 0 } }>
							  <TimePicker
								  format={ 'HH:mm' }
								  value={ startTime } onChange={ applyTime }
								  showNow={ false }
								  minuteStep={ 5 }
							  />
						  </Form.Item>
					  </Form.Item>

				  ) }

			</Space>
		</Form>
	);
};
