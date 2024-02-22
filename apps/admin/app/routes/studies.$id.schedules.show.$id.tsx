import { CommonLayout } from '@components/common-layout';
import type { Participant, Prisma, Schedule, Study } from '@nutritious/core';
import { Show, TextField } from '@refinedev/antd';
import { IResourceComponentsProps, useOne, useParsed, useShow } from '@refinedev/core';
import { Typography } from 'antd';
import React from 'react';


const { Title } = Typography;


export const GroupShow:React.FC<IResourceComponentsProps> = () => {
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
		useShow<Schedule>( {
			meta: {
				fields: [ 'id', 'name', 'state', 'signupPeriod', 'responsePeriod' ],
				operation: 'schedules',
			},
		} );

	const { data: scheduleData, status, isLoading } = queryResult;
	const schedule = scheduleData?.data;



	return (
		<CommonLayout>

			<Show isLoading={ isLoading }>
				<Title level={ 5 }>Study</Title>
				<TextField value={ study?.name } />

				<Title level={ 5 }>Id</Title>
				<TextField value={ schedule?.id } />
				{/*<Title level={ 5 }>Created At</Title>
			<DateField value={ record?.createdAt } />
			<Title level={ 5 }>Updated At</Title>
			<DateField value={ record?.updatedAt } />*/ }
				<Title level={ 5 }>Name</Title>
				<TextField value={ schedule?.name } />
			</Show>


		</CommonLayout>
	);
};
export default GroupShow;
