import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { SlotWithListId } from '@components/groups/ScheduleFormElements';
import type { Prisma } from '@nutritious/core';
import { Button, Card, Flex, Form, Input, List, Popconfirm, Segmented, Select, TimePicker, TimePickerProps } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import React, { useEffect, useState } from 'react';



type Props = {
	dayStart?:number,
	slot?:SlotWithListId
	isCreate?:boolean,
	onChange?:( data:SlotWithListId ) => void,
	onFinish?:( data:SlotWithListId ) => void,
	submit?:number
	uniqueSlotChecks?:( Pick<SlotWithListId, 'key' | 'name' | '_listId'> & { time?:number } )[],

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
			slot.availability = { allDay: true } as SlotWithListId['availability'];

		if( !slot.steps )
			slot.steps = [];

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


	const addStep = () => {
		const steps = form.getFieldValue( 'steps' ) || [];
		steps.push( {
			_listId: 'new_' + Date.now(),
		} );
		form.setFieldValue( 'steps', steps );
	};

	const removeStep = ( index:number ) => {
		const steps = form.getFieldValue( 'steps' ) || [];

		if( steps[index].id )
			steps[index]['_remove'] = !steps[index]['_remove'];
		else
			steps.splice( index, 1 );

		form.setFieldValue( 'steps', steps );
	};

	return (
		<Form form={ form }
			  onChange={ onFormChanges }
			  onFinish={ finishUp }

			  layout="horizontal"
			  colon={ false }
			  labelCol={ {
				  span: 4,
			  } }

			  style={ { paddingBlockStart: 50 } }
		>

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

			<Form.Item label="Time"
					   name={ [ 'availability', 'allDay' ] }
					   rules={ [ { required: true } ] }
			>
				<Segmented options={ [ { label: 'All Day', value: true }, { label: 'Time of Day', value: false } ] } />
			</Form.Item>

			{ isAllDay
			  ? <Form.Item name={ [ 'availability', 'start' ] } label={ <></> }></Form.Item>
			  : (
				  <Form.Item
					  name={ [ 'availability', 'start' ] } label={ <></> }
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

			<div style={ { marginBlockStart: 50 } }>
				<Form.List name={ 'steps' }>
					{ ( fields, { add, move, remove } ) => (
						<Card title="Steps"
							  extra={
								  <Button type={ 'primary' }
										  icon={ <PlusCircleOutlined /> }
										  onClick={ addStep }
								  >{ 'add step' }</Button>
							  }
						>

							{ fields.map( ( { key, name, ...restField } ) => (
								<List.Item key={ key }>
									<Flex gap={ 'middle' }>
										<div style={ { display: 'none' } }>
											<Form.Item name={ [ name, 'id' ] } { ...restField } >
												<Input type="hidden" />
											</Form.Item>
											<Form.Item name={ [ name, 'slotId' ] } { ...restField } >
												<Input type="hidden" />
											</Form.Item>
										</div>

										<Form.Item name={ [ name, 'type' ] } { ...restField }
												   rules={ [ { required: true, message: 'Please select a type' } ] }
												   style={ { minWidth: 140 } }
										>
											<Select placeholder="Select Type"
													options={ [ { label: 'Content', value: 'content' }, { label: 'Form', value: 'form' } ] }
											/>
										</Form.Item>

										<Form.Item name={ [ name, 'reference' ] } { ...restField }
											/*rules={ [ { required: true, message: 'Please set the reference' } ] }*/
												   style={ { flexGrow: 1 } }
										>
											<Input />
										</Form.Item>

										<div>
											<Popconfirm
												title="Remove step"
												description="Are you sure you want to remove this step?"
												onConfirm={ () => removeStep( key ) }
												okText="Yes"
												cancelText="No"
											>
												<Button type={ 'text' } icon={ <MinusCircleOutlined /> }></Button>
											</Popconfirm>
										</div>
									</Flex>

								</List.Item>
							) ) }
						</Card>
					) }
				</Form.List>
			</div>

		</Form>
	);
};
