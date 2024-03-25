import type { Prisma, Study, StudyForm } from '@nutritious/core';
import { Show } from '@refinedev/antd';
import { IResourceComponentsProps, useList, useOne, useParsed, useShow } from '@refinedev/core';
import { Card, Col, Descriptions, Divider, List, Row, Space, Timeline } from 'antd';
import { TimeLineItemProps } from 'antd/lib/timeline/TimelineItem';
import React, { useEffect, useState } from 'react';
import { WeekdayPicker } from '../../../components/form/WeekdayPicker';
import { DetailsHeader } from '../../../components/header/DetailsHeader';
import { minutesToTime, SlotItemContent, SlotWithListId } from '../../../components/schedule/ScheduleFormElements';
import { parseSchedule } from '../../../components/schedule/ScheduleTimeline';



export const ScheduleShow:React.FC<IResourceComponentsProps> = () => {
	const { id: scheduleId, params } = useParsed<{ studyId?:string }>();
	// get study
	const studyId = params?.studyId;
	const { data: studyData, isLoading: isLoadingStudy } =
		useOne<Study>( {
			resource: 'studies',
			id: studyId,
		} );
	const study = studyData?.data;


	// get schedule -> show
	const { queryResult } =
		useShow<Prisma.ScheduleGetPayload<{ include:{ slots:true } }>>( {
			meta: {
				fields: [ 'id', 'name', 'state', 'signupPeriod', 'responsePeriod' ],
				operation: 'schedules',
			},
		} );

	const { data: scheduleData, status, isLoading } = queryResult;
	const schedule = scheduleData?.data;


	const [ allDaySlots, setAllDaySlots ] = useState<SlotWithListId[]>( [] );
	const [ dayStart, setDayStart ] = useState<number>( schedule?.daySetup?.[0].start ?? 0 );
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


	useEffect( () => {
		if( !schedule )
			return;

		const { dayStart, allDaySlots, timelineItems, uniqueSlotChecks }
			= parseSchedule( schedule.daySetup, schedule.slots );

		setDayStart( dayStart );
		setAllDaySlots( allDaySlots );
		setTimeline( timelineItems );

	}, [ schedule ] );


	return (
		<Show isLoading={ isLoading } contentProps={ { className: 'card-transparent' } }>
			<Space direction="vertical" className={ 'stretch' } size={ 'middle' }>

				<Card>
					<DetailsHeader study={ study! } schedule={ schedule } />
					<Divider />

					<Descriptions bordered={ true } column={ 4 }>
						{ schedule?.notes &&
							<Descriptions.Item label={ 'Notes' } span={ 3 } labelStyle={ { width: 140 } }>
								<p>{ schedule.notes }</p>
							</Descriptions.Item>
						}

					</Descriptions>

				</Card>

				<Card title={ 'Week' }>
					<List>
						{ schedule?.daySetup.map( ( daySetup, num ) =>
							<List.Item key={ num }>
								<Space direction={ 'vertical' }>
									<Space>
										Days: { WeekdayPicker.Parse( daySetup.days ).label }
									</Space>
									<Space>
										Start: { minutesToTime( daySetup.start ) } - End: { minutesToTime( daySetup.end ) } ({ daySetup.grace === 0 ? 'no grace period' : daySetup.grace == null ? 'no limit' : minutesToTime(
										daySetup.grace ) + 'h grace' } )
									</Space>
								</Space>
							</List.Item>,
						) }
					</List>
				</Card>

				<Card title={ 'Schedule' }>

					<Row gutter={ [ 50, 50 ] }>
						<Col xs={ 24 } lg={ { span: 12, order: 2 } }>

							<Divider orientation={ 'left' }>All Day Slots</Divider>

							<List
								dataSource={ allDaySlots }
								split={ false }
								renderItem={ ( slot:SlotWithListId ) => (
									<List.Item key={ slot._listId }>
										<SlotItemContent slot={ slot } contentMap={ undefined } formMap={ formMap } />
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

		</Show>
	);
};
export default ScheduleShow;
