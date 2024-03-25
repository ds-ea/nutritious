import type { Prisma, Study } from '@nutritious/core';
import { Create, useForm } from '@refinedev/antd';
import { HttpError, IResourceComponentsProps, useOne, useParsed } from '@refinedev/core';
import { Form } from 'antd';

import React, { useEffect } from 'react';
import { ScheduleFormElements } from '../../../../src/components/schedule/ScheduleFormElements';



export const SchedulesCreate:React.FC<IResourceComponentsProps> = () => {
	const {
		form,
		formProps,
		saveButtonProps,
		queryResult,
		onFinish,
	} = useForm<Prisma.ScheduleCreateInput, HttpError, Prisma.ScheduleCreateInput>( {
		redirect: 'show',
	} );

	const { params } = useParsed<{ studyId?:string }>();
	let studyId = params?.studyId;
	const { data: studyData, isLoading: isLoadingStudy } = useOne<Study>( {
		resource: 'studies',
		id: studyId,
	} );
	const study = studyData?.data as Study;

	useEffect( () => {
		form.setFieldsValue( {
			studyId,
			state: 'ENABLED',
			weekSetup: { startOfWeek: 1 },
			daySetup: [
				{
					days: [ 0, 1, 2, 3, 4, 5, 6 ],
					start: 6 * 60,
					//					end: 0 * 60,
					grace: 5 * 60,
				},
			],

		} as Prisma.ScheduleCreateInput );
	}, [] );

	const handleOnFinish = ( values:Prisma.ScheduleCreateInput ) => {

		const data = {
			...values,
			studyId,
		};

		onFinish( data );
	};

	return (
		<Create saveButtonProps={ saveButtonProps } resource={ 'schedules' }
				isLoading={ isLoadingStudy }
				contentProps={ { className: 'card-transparent' } }
		>

			<Form { ...formProps }
				  layout="vertical"
				  onFinish={ handleOnFinish }
				  autoComplete="off"
			>
				<input type="hidden" autoComplete="false" />

				<ScheduleFormElements study={ study } isCreate={ true } formProps={ formProps } />

			</Form>
		</Create>
	);
};
