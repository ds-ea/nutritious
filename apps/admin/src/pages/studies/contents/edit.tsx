import type { Prisma, Study, StudyContent } from '@nutritious/core';
import { Edit, useForm } from '@refinedev/antd';
import { HttpError, IResourceComponentsProps, useOne, useParsed } from '@refinedev/core';
import { Form } from 'antd';
import React from 'react';
import { ContentFormElements } from '../../../components/contents/ContentFormElements';


export const ContentEdit:React.FC<IResourceComponentsProps> = () => {
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
		useForm<StudyContent, HttpError, Prisma.StudyContentUncheckedUpdateInput>( {
			redirect: 'show',
		} );


	const handleOnFinish = async ( values:Prisma.StudyContentUncheckedUpdateInput ) => {

		const data:Prisma.StudyContentUncheckedUpdateInput & { id?:StudyContent['id'] } = {
			...values,
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
				<ContentFormElements
					study={ study }
					formProps={ formProps }
				/>

			</Form>
		</Edit>
	);
};
