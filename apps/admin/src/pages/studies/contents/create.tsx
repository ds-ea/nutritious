import type { Prisma, Study, StudyContent } from '@nutritious/core';
import { Create, useForm } from '@refinedev/antd';
import { HttpError, IResourceComponentsProps, useOne, useParsed } from '@refinedev/core';
import { Form } from 'antd';
import React, { useEffect } from 'react';
import { ContentFormElements } from '../../../components/contents/ContentFormElements';


export const ContentCreate:React.FC<IResourceComponentsProps> = () => {
	const {
		form,
		formProps,
		saveButtonProps,
		queryResult,
		onFinish,
	} = useForm<StudyContent, HttpError, Prisma.StudyContentUncheckedCreateInput>( {
		redirect: 'show',
		resource: 'study-contents',
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
		} as Partial<Prisma.StudyContentUncheckedCreateInput> );
	}, [] );

	const handleOnFinish = ( values:Prisma.StudyContentCreateInput ) => {
		const data = {
			...values,
			setup: form.getFieldValue( 'setup' ),
			studyId,
		};

		onFinish( data );
	};

	return (
		<Create saveButtonProps={ saveButtonProps } resource={ 'study-contents' }
				isLoading={ isLoadingStudy }
				contentProps={ { className: 'card-transparent' } }
		>
			<Form { ...formProps }
				  layout="vertical"
				  onFinish={ handleOnFinish }
				  autoComplete="off"
			>
				<input type="hidden" autoComplete="false" />
				<ContentFormElements formProps={ formProps } study={ study } isCreate={ true } />
			</Form>
		</Create>
	);
};
