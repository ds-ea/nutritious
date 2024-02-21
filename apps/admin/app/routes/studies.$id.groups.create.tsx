import { CommonLayout } from '@components/common-layout';
import { TimeFrameFormValue, timeFrameOnFinish } from '@components/form/TimeFrame';
import { GroupEditElements } from '@components/groups/group-edit-elements';
import type { Prisma, Study } from '@nutritious/core';
import { Create, useForm } from '@refinedev/antd';
import { useOne, useParsed } from '@refinedev/core';
import { Form } from 'antd';

import generatePassword from 'omgopass';
import React, { useEffect } from 'react';


export default function GroupCreate(){
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

	return <CommonLayout>
		<Create saveButtonProps={ saveButtonProps } resource={ 'groups' } isLoading={ isLoadinStudy }>
			<Form { ...formProps }
				  layout="vertical"
				  onFinish={ handleOnFinish }
			>
				<GroupEditElements study={ study } isCreate={ true } />

			</Form>
		</Create>
	</CommonLayout>;
}
