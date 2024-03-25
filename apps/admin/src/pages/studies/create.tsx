import { Prisma } from '@nutritious/core';
import { Create, useForm } from '@refinedev/antd';
import { IResourceComponentsProps } from '@refinedev/core';
import { Form, Input } from 'antd';
import React, { useEffect } from 'react';
import { StateSelect } from '../../../src/components/form/StateSelect';
import { TimeFrame, TimeFrameFormValue, timeFrameOnFinish } from '../../../src/components/form/TimeFrame';



export const StudiesCreate:React.FC<IResourceComponentsProps> = () => {
	const {
		form,
		formProps,
		saveButtonProps,
		queryResult,
		onFinish,

	} = useForm<Partial<Prisma.StudyCreateInput>>( {
		redirect: 'show',
	} );

	useEffect( () => {
		form.setFieldsValue( {
			state: 'ENABLED',
			signupPeriod: { state: 'ENABLED' },
			responsePeriod: { state: 'ENABLED' },
		} );
	}, [] );

	const handleOnFinish = ( values:Record<string, unknown> ) => {

		const data = {
			...values,
			signupPeriod: timeFrameOnFinish( values['signupPeriod'] as TimeFrameFormValue ),
			responsePeriod: timeFrameOnFinish( values['responsePeriod'] as TimeFrameFormValue ),
		};

		onFinish( data );
	};

	return (
		<Create saveButtonProps={ saveButtonProps } resource={ 'studies' }>
			<Form { ...formProps }
				  layout="vertical"
				  onFinish={ handleOnFinish }
			>
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
					<Input autoFocus />
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
		</Create>
	);
};
