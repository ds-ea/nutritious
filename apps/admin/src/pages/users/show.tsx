import type { User } from '@nutritious/core';
import { DateField, EmailField, Show, TextField } from '@refinedev/antd';
import { IResourceComponentsProps, useShow } from '@refinedev/core';
import { Typography } from 'antd';
import React from 'react';
/*
import { AntdShowInferencer } from '@refinedev/inferencer/antd';


export default function UsersShow(){
	return <CommonLayout>
		<AntdShowInferencer meta={ {
			users: {
				getOne: {
					fields: [ 'id', 'name', 'email', 'settings' ],
					operation: 'users',
					type: 'UserWhereUniqueInput',
				},
			},
		} } />
	</CommonLayout>;
}
*/


const { Title } = Typography;

export const UserShow:React.FC<IResourceComponentsProps> = () => {
	const { queryResult } = useShow( {
		meta: {
			fields: [ 'id', 'name', 'email', 'settings' ],
			operation: 'users',
		},
	} );
	const { data, isLoading } = queryResult;

	const record = data?.data as Partial<User>;

	return (
		<Show isLoading={ isLoading }>
			<Title level={ 5 }>Id</Title>
			<TextField value={ record?.id } />
			<Title level={ 5 }>State</Title>
			<TextField value={ record?.state } />
			<Title level={ 5 }>Name</Title>
			<TextField value={ record?.name } />
			<Title level={ 5 }>Email</Title>
			<EmailField value={ record?.email } />
			<Title level={ 5 }>Created At</Title>
			<DateField value={ record?.createdAt } />
			<Title level={ 5 }>Updated At</Title>
			<DateField value={ record?.updatedAt } />
		</Show>
	);
};
export default UserShow;
