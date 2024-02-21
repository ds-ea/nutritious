/*
import { AntdInferencer } from '@refinedev/inferencer/antd';
import { InferencerComponentProps, InferField } from '@refinedev/inferencer/src/types';


const ftUser:InferencerComponentProps['fieldTransformer'] = ( field:InferField ) => {
	if( field.key === 'state' ){
		//		field.type = 'relation';
	}
	return field;
};

export default function UsersCreate(){
	return <AntdInferencer
		action="create"
		resource="users"
		meta={ {
			user: {},
		} }
		fieldTransformer={ ftUser }
	/>;
}
*/

import { CommonLayout } from '@components/common-layout';
import { StateSelect } from '@components/form/StateSelect';
import { Create, useForm } from '@refinedev/antd';
import { IResourceComponentsProps } from '@refinedev/core';
import { Form, Input } from 'antd';
import React from 'react';


const UserCreate:React.FC<IResourceComponentsProps> = () => {
	const { formProps, saveButtonProps, queryResult } = useForm();

	return (
		<CommonLayout>
			<Create saveButtonProps={ saveButtonProps } resource={ 'users' }>
				<Form { ...formProps } layout="vertical">
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
					<Form.Item
						label="Email"
						name={ [ 'email' ] }
						rules={ [
							{
								required: true,
							},
						] }
					>
						<Input />
					</Form.Item>
					<Form.Item
						label="Password"
						name={ [ 'newPassword' ] }
						rules={ [
							{
								required: true,
							},
						] }
					>
						<Input type={ 'password' } />
					</Form.Item>

				</Form>
			</Create>
		</CommonLayout>
	);
};

export default UserCreate;
