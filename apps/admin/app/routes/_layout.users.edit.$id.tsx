/*
import { AntdEditInferencer } from '@refinedev/inferencer/antd';


export default function UsersEdit(){
	return <AntdEditInferencer meta={ {
		user: {
			getOne: {
				fields: [ 'id', 'name', 'email', 'settings' ],
				operation: 'user',
				type: 'UserWhereUniqueInput',
			},
		},
	} } />;
}
*/


import { Edit, useForm } from '@refinedev/antd';
import { IResourceComponentsProps } from '@refinedev/core';
import { Form, Input } from 'antd';
import React from 'react';


const UserEdit:React.FC<IResourceComponentsProps> = () => {
	const { formProps, saveButtonProps, queryResult } = useForm();

	const usersData = queryResult?.data?.data;

	return (
		<Edit saveButtonProps={ saveButtonProps } resource={ 'user' }>
			<Form { ...formProps } layout="vertical">
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
				<Form.Item
					label="State"
					name={ [ 'state' ] }
					rules={ [
						{
							required: true,
						},
					] }
				>
					<Input />
				</Form.Item>
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
							required: false,
						},
					] }
				>
					<Input type={ 'password' } />
				</Form.Item>

			</Form>
		</Edit>
	);
};
export default UserEdit;
