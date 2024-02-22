import { CommonLayout } from '@components/common-layout';
import { ScheduleFormElements } from '@components/groups/ScheduleFormElements';
import type { Prisma, Schedule, Study } from '@nutritious/core';
import { Edit, useForm } from '@refinedev/antd';
import { IResourceComponentsProps, useOne, useParsed } from '@refinedev/core';
import { Form } from 'antd';
import React from 'react';


export const GroupEdit:React.FC<IResourceComponentsProps> = () => {
	const { id: scheduleId, params } = useParsed<{ studyId?:string }>();
	// get study
	const studyId = params?.studyId;
	const { data: studyData, isLoading: isLoadingStudy } =
		useOne<Study>( {
			resource: 'studies',
			id: studyId,
		} );
	const study = studyData?.data as Study;


	const {
		formProps,
		saveButtonProps,
		queryResult,
		onFinish,
	} =
		useForm<Schedule>( {
			redirect: 'show',
		} );

	const scheduleData = queryResult?.data?.data;


	const handleOnFinish = ( values:Record<string, unknown> ) => {
		const data:Prisma.GroupUpdateInput & { id?:Schedule['id'] } = {
			...values,
		};
		delete data.id;

		return onFinish( data );
	};



	return (
		<CommonLayout>
			<Edit saveButtonProps={ saveButtonProps }
				  contentProps={ { className: 'card-transparent' } }
			>
				<Form { ...formProps } onFinish={ handleOnFinish } layout="vertical">

					<ScheduleFormElements study={ study } formProps={ formProps } />

				</Form>
			</Edit>
		</CommonLayout>
	);
};
export default GroupEdit;
