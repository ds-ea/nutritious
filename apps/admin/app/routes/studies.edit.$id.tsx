import { CommonLayout } from '@components/common-layout';
import { StateSelect } from '@components/form/StateSelect';
import { TimeFrame, TimeFrameFormValue, timeFrameOnFinish, timeFrameOnLoad } from '@components/form/TimeFrame';
import { Prisma, Study } from '@nutritious/core';
import { Edit, useForm } from '@refinedev/antd';
import { IResourceComponentsProps } from '@refinedev/core';
import { Form, Input } from 'antd';
import React from 'react';


export const StudyEdit:React.FC<IResourceComponentsProps> = () => {
	const {
		formProps,
		saveButtonProps,
		queryResult,
		onFinish,
	} =
		useForm<Study>( {} );

	const studiesData = queryResult?.data?.data;
	if( studiesData )
		timeFrameOnLoad( studiesData, [ 'signupPeriod', 'responsePeriod' ] );

	const handleOnFinish = ( values:Record<string, unknown> ) => {
		const data:Prisma.StudyUpdateInput & { id?:Study['id'] } = {
			...values,
			signupPeriod: timeFrameOnFinish( values['signupPeriod'] as TimeFrameFormValue ),
			responsePeriod: timeFrameOnFinish( values['responsePeriod'] as TimeFrameFormValue ),
		};
		delete data.id;
		return onFinish( data );
	};



	return (
		<CommonLayout>
			<Edit saveButtonProps={ saveButtonProps }>
				<Form { ...formProps } onFinish={ handleOnFinish } layout="vertical">
					<Form.Item
						label="Id"
						name={ [ 'id' ] }
						rules={ [
							{
								required: true,
							},
						] }
					>
						<Input readOnly disabled />
					</Form.Item>

					<StateSelect />

					<Form.Item
						label="Name"
						name={ [ 'name' ] }
						rules={ [
							{
								required: true,
							},
						] }
					>
						<Input />
					</Form.Item>

					<Form.Item label="Signup">
						<TimeFrame name={ 'signupPeriod' } />
					</Form.Item>

					<Form.Item label="Responses">
						<TimeFrame name={ 'responsePeriod' } />
					</Form.Item>

					<Form.Item label="Notes (private)"
							   name={ 'notes' }
					>
						<Input.TextArea autoSize={ true } />
					</Form.Item>


				</Form>
			</Edit>
		</CommonLayout>
	);
};
export default StudyEdit;
