import type { Group, Prisma, Study } from '@nutritious/core';
import { Edit, useForm } from '@refinedev/antd';
import { IResourceComponentsProps, useOne, useParsed } from '@refinedev/core';
import { Form } from 'antd';
import React from 'react';
import { TimeFrameFormValue, timeFrameOnFinish, timeFrameOnLoad } from '../../../../src/components/form/TimeFrame';
import { GroupFormElements } from '../../../../src/components/groups/GroupFormElements';


export const GroupEdit:React.FC<IResourceComponentsProps> = () => {
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
		formProps,
		saveButtonProps,
		queryResult,
		onFinish,
	} =
		useForm<Group>( {
			redirect: 'show',
		} );

	const studiesData = queryResult?.data?.data;
	if( studiesData )
		timeFrameOnLoad( studiesData, [ 'signupPeriod', 'responsePeriod' ] );

	const handleOnFinish = ( values:Record<string, unknown> ) => {
		const data:Prisma.GroupUpdateInput & { id?:Group['id'] } = {
			...values,
			signupPeriod: timeFrameOnFinish( values['signupPeriod'] as TimeFrameFormValue ),
			responsePeriod: timeFrameOnFinish( values['responsePeriod'] as TimeFrameFormValue ),
		};
		delete data.id;

		data.regLimit = Number( data.regLimit ) || null;

		return onFinish( data );
	};



	return (
		<Edit saveButtonProps={ saveButtonProps }>
			<Form { ...formProps } onFinish={ handleOnFinish } layout="vertical">

				<GroupFormElements study={ study } />

			</Form>
		</Edit>
	);
};
export default GroupEdit;
