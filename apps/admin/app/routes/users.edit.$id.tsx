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


import { CommonLayout } from '@components/common-layout';
import { StateSelect } from '@components/form/StateSelect';
import type { Prisma, User } from '@nutritious/core';
import { Edit, useForm } from '@refinedev/antd';
import { IResourceComponentsProps } from '@refinedev/core';
import { Form, Input } from 'antd';
import React from 'react';


const UserEdit:React.FC<IResourceComponentsProps> = () => {
	const { formProps, saveButtonProps, queryResult } = useForm<User>();

	const usersData = queryResult?.data?.data as Prisma.UserCreateInput;

	return (
		<CommonLayout>
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
					<StateSelect />
					{/*<Form.Item
						label="State"
						name={ [ 'state' ] }
						rules={ [
							{
								required: true,
							},
						] }
					>
						<Input />
					</Form.Item>*/ }
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
		</CommonLayout>
	);
};
export default UserEdit;