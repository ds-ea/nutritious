import type { Prisma, Study, StudyForm } from '@nutritious/core';
import { Edit, useForm } from '@refinedev/antd';
import { HttpError, IResourceComponentsProps, useOne, useParsed } from '@refinedev/core';
import { Form } from 'antd';
import React from 'react';
import { FormFormElements } from '../../../components/forms/FormFormElements';


export const FormEdit:React.FC<IResourceComponentsProps> = () => {
	const { id: groupId, params } = useParsed<{ studyId?:string }>();

	// get study
	const studyId = params?.studyId;
	const { data: studyData, isLoading: isLoadingStudy } =
		useOne<Study>( {
			resource: 'studies',
			id: studyId,
		} );
	const study = studyData?.data as Study;


	const {
		form,
		formProps,
		saveButtonProps,
		queryResult,
		onFinish,
	} =
		useForm<StudyForm, HttpError, Prisma.StudyFormUncheckedUpdateInput>( {
			redirect: 'show',
		} );


	const handleOnFinish = async ( values:Prisma.StudyFormUncheckedUpdateInput ) => {

		const data:Prisma.StudyFormUncheckedUpdateInput & { id?:StudyForm['id'] } = {
			...values,
			setup: form.getFieldValue( 'setup' ),
			studyId,
		};
		delete data.id;

		return onFinish( data );
	};


	return (
		<Edit saveButtonProps={ saveButtonProps }
			  isLoading={ isLoadingStudy }
			  contentProps={ { className: 'card-transparent' } }
		>

			<Form { ...formProps }
				  layout="vertical"
				  onFinish={ handleOnFinish }
				  autoComplete="off"
			>
				<input type="hidden" autoComplete="false" />
				<FormFormElements
					study={ study }
					formProps={ formProps }
				/>

			</Form>
		</Edit>
	);
};
