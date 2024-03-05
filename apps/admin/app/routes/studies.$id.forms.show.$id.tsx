import { CommonLayout } from '@components/common-layout';
import type { Participant, Prisma, Study, StudyForm } from '@nutritious/core';
import { Show, TextField } from '@refinedev/antd';
import { IResourceComponentsProps, useOne, useParsed, useShow } from '@refinedev/core';
import { Divider, Empty, Typography } from 'antd';
import React from 'react';


const { Title } = Typography;



export const FormShow:React.FC<IResourceComponentsProps> = () => {
	const { id: formId, params } = useParsed<{ studyId?:string }>();

	// get study
	const studyId = params?.studyId;
	const { data: studyData, isLoading: isLoadingStudy } =
		useOne<Study>( {
			resource: 'studies',
			id: studyId,
		} );
	const study = studyData?.data;


	// get group -> show
	const { queryResult } =
		useShow<StudyForm>( {} );

	const { data: formData, status, isLoading } = queryResult;
	const form = formData?.data;


	return (
		<CommonLayout>

			<Show isLoading={ isLoading }>
				{ !form ? <Empty /> : <>

					<Title level={ 5 }>Study</Title>
					<TextField value={ study?.name } />

					<Title level={ 5 }>Id</Title>
					<TextField value={ form?.id } />
					{/*<Title level={ 5 }>Created At</Title>
				<DateField value={ record?.createdAt } />
				<Title level={ 5 }>Updated At</Title>
				<DateField value={ record?.updatedAt } />*/ }

					<Title level={ 5 }>Name</Title>
					<TextField value={ form.name } />

					<Title level={ 5 }>Notes</Title>
					<TextField value={ form.notes } />

					<Divider orientation={ 'left' }>Public</Divider>
					<Title level={ 5 }>Title</Title>
					<TextField value={ form.title } />
					<Title level={ 5 }>Intro</Title>
					<TextField value={ form.intro } />

				</> }

			</Show>


		</CommonLayout>
	);
};
export default FormShow;
