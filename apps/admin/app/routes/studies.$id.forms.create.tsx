import { CommonLayout } from '@components/common-layout';
import { FormFormElements } from '@components/forms/FormFormElements';
import type { Prisma, Study, StudyForm } from '@nutritious/core';
import { Create, useForm } from '@refinedev/antd';
import { HttpError, useOne, useParsed } from '@refinedev/core';
import { Form } from 'antd';
import React, { useEffect } from 'react';


export default function FormCreate(){
	const {
		form,
		formProps,
		saveButtonProps,
		queryResult,
		onFinish,
	} = useForm<StudyForm, HttpError, Prisma.StudyFormUncheckedCreateInput>( {
		redirect: 'show',
		resource: 'study-forms',
	} );

	const { params } = useParsed<{ studyId?:string }>();
	let studyId = params?.studyId;
	const { data: studyData, isLoading: isLoadinStudy } = useOne<Study>( {
		resource: 'studies',
		id: studyId,
	} );
	const study = studyData?.data as Study;


	useEffect( () => {
		form.setFieldsValue( {
			studyId,
			setup: { items: [] },
		} as Partial<Prisma.StudyFormUncheckedCreateInput> );
	}, [] );

	const handleOnFinish = ( values:Prisma.StudyFormCreateInput ) => {
		const data = {
			...values,
			setup: form.getFieldValue( 'setup' ),
			studyId,
		};

		onFinish( data );
	};

	return <CommonLayout>
		<Create saveButtonProps={ saveButtonProps } resource={ 'study-forms' }
				isLoading={ isLoadinStudy }
				contentProps={ { className: 'card-transparent' } }
		>
			<Form { ...formProps }
				  layout="vertical"
				  onFinish={ handleOnFinish }
				  autoComplete="off"
			>
				<input type="hidden" autoComplete="false" />
				<FormFormElements formProps={ formProps } study={ study } isCreate={ true } />
			</Form>
		</Create>
	</CommonLayout>;
}
