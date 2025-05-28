/*
import { AntdShowInferencer } from '@refinedev/inferencer/antd';


export default function UsersShow(){
	return <CommonLayout>
		<AntdShowInferencer meta={ {
			pages: {
				getOne: {
					fields: [ 'id', 'name', 'email', 'settings' ],
					operation: 'pages',
				},
			},
		} } />
	</CommonLayout>;
}
*/
import type { Page } from '@nutritious/core';
import { DateField, Show, TextField } from '@refinedev/antd';
import { IResourceComponentsProps, useShow } from '@refinedev/core';
import { Typography } from 'antd';
import React from 'react';


const { Title } = Typography;

export const PageShow:React.FC<IResourceComponentsProps> = () => {
	const { queryResult } = useShow( {
		meta: {
			fields: [ 'id', 'name', 'email', 'settings' ],
			operation: 'pages',
		},
	} );
	const { data, isLoading } = queryResult;

	const record = data?.data as Partial<Page>;

	return (
		<Show isLoading={ isLoading }>
			<Title level={ 5 }>Id</Title>
			<TextField value={ record?.id } />
			<Title level={ 5 }>Created At</Title>
			<DateField value={ record?.createdAt } />
			<Title level={ 5 }>Updated At</Title>
			<DateField value={ record?.updatedAt } />
			<Title level={ 5 }>State</Title>
			<TextField value={ record?.state } />
			<Title level={ 5 }>Name</Title>
			<TextField value={ record?.name } />
			<Title level={ 5 }>Alias</Title>
			<TextField value={ record?.alias } />
			<Title level={ 5 }>Body</Title>
			<TextField value={ record?.body } />
		</Show>
	);
};
export default PageShow;
