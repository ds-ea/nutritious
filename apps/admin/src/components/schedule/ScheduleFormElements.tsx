import { ClockCircleOutlined, EditOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { EmojiFoodBeverageOutlined, NewspaperOutlined, QuizOutlined } from '@mui/icons-material';
import { Prisma, Schedule, Slot, Step, Study, StudyContent, StudyForm, StudyStepType } from '@nutritious/core';
import { useList } from '@refinedev/core';
import { Button, Card, Col, Descriptions, Divider, Form, FormProps, Input, List, Modal, Row, Select, Space, Tag, Timeline } from 'antd';
import { TimeLineItemProps } from 'antd/lib/timeline/TimelineItem';
import { DefaultOptionType } from 'rc-select/lib/Select';
import React, { useEffect, useState } from 'react';
import { WeekdayPicker } from '../form/WeekdayPicker';
import { parseSchedule } from './ScheduleTimeline';
import { StudyStepTypeMeta } from './shared';
import { SlotShortEditor } from './SlotShortEditor';



export type SlotUpdateDto = Partial<Slot> & { steps?:Partial<Step & { _remove?:boolean, _listId?:string }>[] };

export type SlotWithListId<T extends SlotUpdateDto = SlotUpdateDto> = T & { _listId:string };


export function hoursToTime( hours:number ):string{
	return hours.toString().padStart( 2, '0' ) + ':00';
}

export function minutesToTime( minutes:number | null | undefined ):string{
	if( minutes == null )
		return '';

	return `${ String( Math.floor( minutes / 60 ) ).padStart( 2, '0' ) }:${ String( minutes % 60 ).padStart( 2, '0' ) }`;
}

export function SlotItemContent( props:{
	slot:SlotWithListId,
	formMap:Record<string, StudyForm> | undefined,
	contentMap:Record<string, StudyContent> | undefined
	onEdit?:( slot:SlotWithListId ) => void,
} ){
	const { slot } = props;
	return <Space direction={ 'vertical' }>
		<Space>
			<Button size="small" shape="round" type="default">{ slot.name as string }</Button>
			{ props.onEdit != null &&
				<Button size="small" shape="circle" type="default" icon={ <EditOutlined /> }
						onClick={ () => props.onEdit?.( slot ) }
				/>
			}
		</Space>
		<ol>
			{ slot.steps?.map( step => (
				<li key={ step._listId ?? step.id }>
					<Space align={ 'center' }>
						{ step.type === StudyStepType.Content && <NewspaperOutlined fontSize={ 'small' } /> }
						{ step.type === StudyStepType.Form && <QuizOutlined fontSize={ 'small' } /> }
						{ step.type === StudyStepType.BlsFood && <EmojiFoodBeverageOutlined fontSize={ 'small' } /> }

						<Tag>
							{ step.type === StudyStepType.Content && ( props.contentMap?.[step.ref ?? 0]?.name ?? '?' ) }
							{ step.type === StudyStepType.Form && ( props.formMap?.[step.ref ?? 0]?.name ?? '?' ) }
							{ step.type === StudyStepType.BlsFood && StudyStepTypeMeta['bls-food-entry'].name }
						</Tag>
					</Space>
				</li>
			) ) }
		</ol>
	</Space>;
}



export const ScheduleFormElements:React.FC<{
	formProps:FormProps<Prisma.ScheduleCreateInput> | FormProps<Prisma.ScheduleUpdateInput>,
	study:Study,
	isCreate?:boolean
}> = ( { study, isCreate, formProps } ) => {

	let createCount = 0;

	const startOfWeek = formProps?.form?.getFieldValue( [ 'weekSetup', 'startOfWeek' ] );

	const dayHoursOptions:DefaultOptionType[] = Array.from(
		{ length: 24 },
		( v, h ) => ( {
			label: hoursToTime( h ),
			value: h * 60,
		} ),
	);

	const graceOptions:DefaultOptionType[] = [
		{ label: 'no grace period', value: 0 },
		...Array.from(
			{ length: 48 },
			( v, h ) => ( {
				label: `${ h + 1 } hour${ h ? 's' : '' }`,
				value: ( h + 1 ) * 60,
			} ),
		),
	];


	const [ allDaySlots, setAllDaySlots ] = useState<SlotWithListId[]>( [] );
	const [ dayStart, setDayStart ] = useState<number>( formProps?.form?.getFieldValue( 'daySetup' )?.[0].start ?? 0 );
	const [ timeline, setTimeline ] = useState<TimeLineItemProps[]>( [] );

	const { data: availableForms, isLoading: isLoadingForms } =
		useList<StudyForm>( {
			resource: 'study-forms',
			filters: [ { field: 'studyId', operator: 'eq', value: study?.id } ],
		} );

	const [ formMap, setFormMap ] = useState<Record<string, StudyForm>>();
	useEffect( () => {
		setFormMap( availableForms?.data?.reduce( (
				map, form ) => (
				map[form.id] = form,
					map
			)
			, {} as Record<string, StudyForm> ) );
	}, [ availableForms ] );


	/*const { data: availableForms, isLoading: isLoadingForms } =
		useList<StudyForm>( {
			resource: 'study-forms',
			filters: [ { field: 'studyId', operator: 'eq', value: study.id } ],
		} );*/


	const updateTimeline = () => {

		const daySetup:Schedule['daySetup'] = formProps?.form?.getFieldValue( 'daySetup' );
		const slots:SlotWithListId[] = formProps?.form?.getFieldValue( 'slots' ) ?? [];


		const { dayStart, allDaySlots, timelineItems, uniqueSlotChecks }
			= parseSchedule( daySetup, slots, createCount, formMap, editSlot );

		setDayStart( dayStart );
		setAllDaySlots( allDaySlots );
		setTimeline( timelineItems );
		setUniqueSlotChecks( uniqueSlotChecks );
	};

	useEffect( () => {
		updateTimeline();
	}, [ formProps ] );
	//	updateTimeline();



	let [ selectedSlot, setSelectedSlot ] = useState<SlotWithListId | undefined | null>();
	const [ isNewSlot, setIsNewSlot ] = useState( false );
	const [ submitSlotForm, callSubmitSlotForm ] = useState( 0 );

	const [ uniqueSlotChecks, setUniqueSlotChecks ] = useState<( Pick<SlotWithListId, 'key' | 'name' | '_listId'> & { time?:number } )[]>( [] );



	const cancelSlotEditing = () => {
		setSelectedSlot( null );
	};

	const confirmSlotChanges = ( data:SlotWithListId<SlotUpdateDto> ) => {
		const slotsValue:( SlotWithListId<SlotUpdateDto> )[] = formProps?.form?.getFieldValue( 'slots' ) ?? [];

		// patch slot
		const existing = slotsValue.find( slot => ( slot._listId || slot.id ) === ( selectedSlot?._listId || selectedSlot?.id ) );
		if( existing )
			Object.assign( existing, data );
		else
			slotsValue.push( data );

		formProps?.form?.setFieldValue( 'slots', slotsValue );
		updateTimeline();

		setIsNewSlot( false );
		setSelectedSlot( null );
	};

	const addSlot = () => {
		const slot:typeof selectedSlot = {
			key: '',
			name: '',
			availability: { allDay: false } as SlotWithListId['availability'],
			steps: [ { _listId: 'new_' + Date.now() } ],
			_listId: 'new_' + ++createCount,
		};
		setIsNewSlot( true );
		setSelectedSlot( slot );
	};

	const editSlot = ( slot:SlotWithListId ) => {
		setIsNewSlot( false );
		setSelectedSlot( slot );
	};


	return ( <>
		<Modal open={ !!selectedSlot } onCancel={ cancelSlotEditing }
			   centered width={ 600 }
			   title={ ( selectedSlot && 'id' in selectedSlot && selectedSlot?.id ) ? 'Edit Slot' : 'Add Slot' }
			   footer={ <><Button type={ 'primary' } onClick={ () => callSubmitSlotForm( prev => prev + 1 ) }>{ 'Ok' }</Button></> }
		>
			{ !selectedSlot
			  ? <></>
			  : <SlotShortEditor slot={ selectedSlot }
								 study={ study }
								 dayStart={ dayStart }
								 isCreate={ isNewSlot }
								 onFinish={ confirmSlotChanges }
								 uniqueSlotChecks={ uniqueSlotChecks }
								 submit={ submitSlotForm }
			  />
			}
		</Modal>


		<Space direction={ 'vertical' } className={ 'stretch' }>
			<Card title={ 'Schedule' + ( isCreate ? 'New' : ` ( ${ formProps?.form?.getFieldValue( 'id' ) } )` ) }
				  extra={
					  <Descriptions size={ 'small' } bordered={ true }
									items={ [ { label: 'Study', children: study?.name } ] }
					  />
				  }>

				<Row gutter={ [ 50, 50 ] }>
					<Col xs={ 24 } lg={ 12 }>
						<Form.Item
							label="Name" name={ [ 'name' ] }
							rules={ [ { required: true } ] }
						>
							<Input autoFocus={ isCreate } />
						</Form.Item>
					</Col>
					<Col xs={ 24 } lg={ 12 }>
						<Form.Item label="Notes (private)"
								   name={ 'notes' }
						>
							<Input.TextArea
								autoSize={ true } style={ { minHeight: 50 } }
							/>
						</Form.Item>
					</Col>
				</Row>
			</Card>

			<Card title={ 'Week' }>
				<Space direction={ 'vertical' }>

					<Space align={ 'start' }>

						<Form.Item
							label="Week Starts on" name={ [ 'weekSetup', 'startOfWeek' ] }
							rules={ [ { required: true } ] }
						>
							<Select options={ [ { label: 'Sunday', value: 0 }, { label: 'Monday', value: 1 } ] } />
						</Form.Item>

						<Divider type={ 'vertical' } />


						<Form.List name="daySetup">
							{ ( fields, { add, remove } ) => (
								<>
									{ fields.map( ( { key, name, ...restField } ) => (
										<Space key={ key } style={ { display: 'flex', marginBottom: 8 } } align="baseline">

											<Form.Item { ...restField }
													   label={ 'On days' }
													   name={ [ name, 'days' ] }
													   rules={ [ { required: true } ] }
											>
												<WeekdayPicker startOfWeek={ startOfWeek } readOnly />
											</Form.Item>

											<Form.Item
												{ ...restField }
												label={ 'Day begins' }
												name={ [ name, 'start' ] }
											>
												<Select
													options={ dayHoursOptions }
													allowClear={ true }
													placeholder={ 'at midnight' }
													suffixIcon={ <ClockCircleOutlined /> }
													onChange={ updateTimeline }
												/>
											</Form.Item>

											<Form.Item
												{ ...restField }
												label={ 'Day ends' }
												name={ [ name, 'end' ] }
											>
												<Select options={ dayHoursOptions }
														allowClear={ true }
														placeholder={ 'at midnight' }
														suffixIcon={ <ClockCircleOutlined /> }
														onChange={ updateTimeline }
												/>
											</Form.Item>

											<Form.Item
												{ ...restField }
												label={ 'Response grace period' }
												name={ [ name, 'grace' ] }
											>
												<Select options={ graceOptions } allowClear={ true } placeholder={ 'no limit (forever)' } />
											</Form.Item>

											{/*<MinusCircleOutlined onClick={ () => remove( name ) } />*/ }
										</Space>
									) ) }

									{/*<Form.Item>
										<Button type="dashed" onClick={ () => add() } block icon={ <PlusOutlined /> }>
											Add field
										</Button>
									</Form.Item>*/ }
								</>
							) }
						</Form.List>
					</Space>

				</Space>

				<Row gutter={ [ 50, 50 ] }>
					<Col xs={ 24 } lg={ 12 }>

					</Col>

					<Col xs={ 24 } lg={ 12 }>

					</Col>
				</Row>
			</Card>

			<Card title={ 'Schedule' } extra={
				<Button type={ 'primary' } icon={ <PlusCircleOutlined /> }
						onClick={ addSlot }
				>{ 'add slot to schedule' }</Button>
			}>

				<Row gutter={ [ 50, 50 ] }>
					<Col xs={ 24 } lg={ { span: 12, order: 2 } }>

						<Divider orientation={ 'left' }>All Day Slots</Divider>

						<List
							dataSource={ allDaySlots }
							split={ false }
							renderItem={ ( slot:SlotWithListId ) => (
								<List.Item
									/*actions={ [ <a key="list-loadmore-edit">edit</a>, <a key="list-loadmore-more">more</a> ] }*/
								>
									<SlotItemContent slot={ slot } onEdit={ editSlot } contentMap={ undefined } formMap={ formMap } />
								</List.Item>
							) }
						/>

					</Col>

					<Col xs={ 24 } lg={ 12 }>
						<Divider>Scheduled Slots</Divider>

						<Timeline mode={ 'left' } items={ timeline } />
					</Col>
				</Row>
			</Card>

		</Space>
	</> );
};
