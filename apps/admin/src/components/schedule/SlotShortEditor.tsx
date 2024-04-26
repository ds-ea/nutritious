import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { Prisma, Step, Study, StudyContent, StudyForm } from '@nutritious/core';
import { useList } from '@refinedev/core';
import { Button, Card, Collapse, Divider, Flex, Form, Input, List, Popconfirm, Segmented, Select, TimePicker, TimePickerProps } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { DefaultOptionType } from 'rc-select/lib/Select';
import React, { useEffect, useState } from 'react';
import { GracePicker } from '../form-components/GracePicker';
import { LimitPicker } from '../form-components/LimitPicker';
import { StepReferencePicker } from '../form-components/StepReferencePicker';
import { WeekdayPicker } from '../form-components/WeekdayPicker';
import { GroupDivider } from '../layout/GroupDivider';
import { SlotWithListData } from './ScheduleFormElements';
import { StudyStepTypeMeta } from './shared';


type StepWithListId = Step & { _listId:string };

type Props = {
	startOfWeek:0 | 1,
	dayStart?:number,
	slot:SlotWithListData,
	study:Study,
	isCreate?:boolean,
	onChange?:( data:SlotWithListData ) => void,
	onFinish?:( data:SlotWithListData ) => void,
	submit?:number
	uniqueSlotChecks?:( Pick<SlotWithListData, 'key' | 'name' | '_listId'> & { time?:number } )[],

};



export const SlotShortEditor:React.FC<Props> = ( {
	startOfWeek,
	dayStart,
	slot, study,
	isCreate,
	onChange, onFinish,
	submit, uniqueSlotChecks,
	...props
} ) => {

	if( !slot || !study )
		return ( <></> );

	const useCollapseDividerHeaders = false;

	const [ form ] = Form.useForm<Props['slot']>();

	const [ isAllDay, setIsAllDay ] = useState<boolean>( slot.availability ? !!slot.availability?.allDay : true );
	const [ startTime, setStartTime ] = useState<Dayjs | undefined>();
	const [ startMinutes, setStartMinutes ] = useState( slot?.availability?.start );

	// for triggering submit from outside buttons
	useEffect( () => ( submit && form.submit(), undefined ), [ submit, form ] );

	const [ stepTypeMap, setStepTypeMap ] = useState<Record<string, string>>( {} );
	const updateStepTypeMap = () => {
		const steps = form.getFieldValue( 'steps' ) as StepWithListId[];
		const map = steps.reduce(
			( map, step, k ) => (
				map[k] = step.type,
					map ),
			{} as typeof stepTypeMap,
		);
		setStepTypeMap( map );
	};


	const onFormChanges = () => {
		const data = form.getFieldsValue();
		setIsAllDay( data?.availability ? !!data.availability?.allDay : true );
		updateStepTypeMap();
	};

	const finishUp = () => {
		const data = Object.assign( {}, slot, form.getFieldsValue() );
		onFinish?.( data );
	};


	// form init
	useEffect( () => {
		if( !slot.availability )
			slot.availability = { allDay: true } as SlotWithListData['availability'];

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
		updateStepTypeMap();

	}, [ form, slot ] );


	const stepTypeOptions = Object.entries( StudyStepTypeMeta ).map( ( [ value, meta ] ) => ( { label: meta.name, value } as DefaultOptionType ) );


	const { data: availableForms, isLoading: isLoadingForms } =
		useList<StudyForm>( {
			resource: 'study-forms',
			filters: [ { field: 'studyId', operator: 'eq', value: study.id } ],
		} );

	const { data: availableContents, isLoading: isLoadingContents } =
		useList<StudyContent>( {
			resource: 'study-contents',
			filters: [ { field: 'studyId', operator: 'eq', value: study.id } ],
		} );



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

		const availability:Prisma.SlotAvailabilityCreateInput = form.getFieldValue( 'availability' ) || { days: [] };
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

	const perConstraintOptions:DefaultOptionType[] = [
		{ label: 'day', value: 'day' },
		{ label: 'week', value: 'week' },
		{ label: 'month', value: 'month' },
	];


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

			<Form.Item label="Days"
					   name={ [ 'availability', 'days' ] }
			>
				<WeekdayPicker startOfWeek={ startOfWeek } allowClear />
			</Form.Item>

			<Form.Item label="Time"
					   name={ [ 'availability', 'allDay' ] }
					   rules={ [ { required: true } ] }
			>
				<Segmented options={ [ { label: 'All Day', value: true }, { label: 'Time of Day', value: false } ] } />
			</Form.Item>

			<Form.Item
				name={ [ 'availability', 'start' ] } label={ <></> }
				rules={ isAllDay ? [] : [
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
				hidden={ isAllDay }
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

			<Collapse
				ghost
				size={ 'small' }
				defaultActiveKey={ [] }
				items={ [
					isAllDay
					? { showArrow: false, label: undefined }
					: {
							key: 'availability',
							label: useCollapseDividerHeaders ? <Divider orientation="left">{ 'Availability' }</Divider> : 'Availability',
							children: <>
								<Form.Item label={ 'Entry Restrictions' }>
									<GroupDivider>
										<GracePicker name={ [ 'availability', 'graceStart' ] } graceType={ 'before' }></GracePicker>
										<GracePicker name={ [ 'availability', 'graceEnd' ] } graceType={ 'after' }></GracePicker>
									</GroupDivider>
								</Form.Item>
							</>,
						},
					{
						key: 'constraints',
						label: useCollapseDividerHeaders ? <Divider orientation="left">{ 'Constraints' }</Divider> : 'Constraints',
						children: <>
							<Form.Item name={ [ 'constraints', 'obligatory' ] }
									   label={ 'Obligatory' }
							>
								<Segmented options={ [ { label: 'optional', value: false }, { label: 'required', value: true } ] } />
							</Form.Item>

							<Form.Item label={ 'Response Limits' }>
								<GroupDivider>
									<Form.Item label={ 'min' }>
										<LimitPicker name={ [ 'constraints', 'min' ] } unit={ 'response' } direction={ 'up' } />
									</Form.Item>
									<Form.Item label={ 'max' }>
										<LimitPicker name={ [ 'constraints', 'max' ] } unit={ 'response' } direction={ 'down' } />
									</Form.Item>

									<Form.Item label={ 'per' }
											   name={ [ 'constraints', 'per' ] }
									>
										<Select options={ perConstraintOptions } allowClear placeholder={ 'day' } disabled />
									</Form.Item>
								</GroupDivider>
							</Form.Item>
						</>,
					},
				] } />


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
													options={ stepTypeOptions }
													onChange={ () => updateStepTypeMap() }
											/>
										</Form.Item>

										<Form.Item name={ [ name, 'ref' ] } { ...restField }
											/*rules={ [ { required: true, message: 'Please set the reference' } ] }*/
												   style={ { flexGrow: 1 } }
										>
											<StepReferencePicker type={ stepTypeMap[key] } forms={ availableForms?.data } contents={ availableContents?.data } />
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
