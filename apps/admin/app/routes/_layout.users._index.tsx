import { EditButton, EmailField, List, ShowButton, useTable } from '@refinedev/antd';
import { BaseRecord, IResourceComponentsProps } from '@refinedev/core';
import { Space, Table } from 'antd';
import React from 'react';

/*
import { AntdInferencer } from '@refinedev/inferencer/antd';

export default function UsersList(){
	return <AntdInferencer
		action="list"
		meta={ {
			user: {
				getList: {
					fields: [ 'id', 'name' ],
					operation: 'users',
				},
			},
		} }
	/>;
}
*/

export const UserList:React.FC<IResourceComponentsProps> = () => {
	const { tableProps } = useTable( {
		syncWithLocation: true,
	} );

	return (
		<List>
			<Table { ...tableProps } rowKey="id">
				<Table.Column dataIndex="id" title="Id" />
				<Table.Column dataIndex="state" title="State" />
				<Table.Column dataIndex="name" title="Name" />
				<Table.Column
					dataIndex={ [ 'email' ] }
					title="Email"
					render={ ( value:any ) => <EmailField value={ value } /> }
				/>

				{/*
				<Table.Column dataIndex="password" title="Password" />
				<Table.Column
					dataIndex={["createdAt"]}
					title="Created At"
					render={(value: any) => <DateField value={value} />}
				/>
				<Table.Column
					dataIndex={["updatedAt"]}
					title="Updated At"
					render={(value: any) => <DateField value={value} />}
				/>*/ }

				<Table.Column
					title="Actions"
					dataIndex="actions"
					render={ ( _, record:BaseRecord ) => (
						<Space>
							<EditButton
								hideText
								size="small"
								recordItemId={ record.id }
							/>
							<ShowButton
								hideText
								size="small"
								recordItemId={ record.id }
							/>
						</Space>
					) }
				/>
			</Table>
		</List>
	);
};

export default UserList;
