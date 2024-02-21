import { CommonLayout } from '@components/common-layout';
import { TimeFrameFormValue, timeFrameOnFinish, timeFrameOnLoad } from '@components/form/TimeFrame';
import { GroupEditElements } from '@components/groups/group-edit-elements';
import type { Group, Prisma, Study } from '@nutritious/core';
import { Edit, useForm } from '@refinedev/antd';
import { IResourceComponentsProps, useOne, useParsed } from '@refinedev/core';
import { Form } from 'antd';
import React from 'react';


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
		<CommonLayout>
			<Edit saveButtonProps={ saveButtonProps }>
				<Form { ...formProps } onFinish={ handleOnFinish } layout="vertical">

					<GroupEditElements study={ study } />

				</Form>
			</Edit>
		</CommonLayout>
	);
};
export default GroupEdit;
