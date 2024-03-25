import type { Prisma, Study } from '@nutritious/core';
import { Create, useForm } from '@refinedev/antd';
import { IResourceComponentsProps, useOne, useParsed } from '@refinedev/core';
import { Form } from 'antd';

import generatePassword from 'omgopass';
import React, { useEffect } from 'react';
import { TimeFrameFormValue, timeFrameOnFinish } from '../../../../src/components/form/TimeFrame';
import { GroupFormElements } from '../../../../src/components/groups/GroupFormElements';


export const GroupCreate:React.FC<IResourceComponentsProps> = () => {
	const {
		form,
		formProps,
		saveButtonProps,
		queryResult,
		onFinish,
	} = useForm<Partial<Prisma.GroupCreateInput>>( {
		redirect: 'show',
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
			state: 'ENABLED',
			regKey: generatePassword( { syllablesCount: 4 } ),
			regPass: generatePassword( { syllablesCount: 4 } ),
			//			signupPeriod: { state: 'ENABLED' },
			//			responsePeriod: { state: 'ENABLED' },
		} );
	}, [] );

	const handleOnFinish = ( values:Record<string, unknown> ) => {

		const data = {
			...values,
			studyId,
			signupPeriod: timeFrameOnFinish( values['signupPeriod'] as TimeFrameFormValue ),
			responsePeriod: timeFrameOnFinish( values['responsePeriod'] as TimeFrameFormValue ),
		};

		onFinish( data );
	};

	return (
		<Create saveButtonProps={ saveButtonProps } resource={ 'groups' } isLoading={ isLoadinStudy }>
			<Form { ...formProps }
				  layout="vertical"
				  onFinish={ handleOnFinish }
			>
				<GroupFormElements study={ study } isCreate={ true } />

			</Form>
		</Create>
	);
};
export default GroupCreate;
