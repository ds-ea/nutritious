import { CommonLayout } from '@components/common-layout';
import { User } from '@nutritious/core';
import { EditButton, EmailField, List, ShowButton, useTable } from '@refinedev/antd';
import { IResourceComponentsProps, useNavigation } from '@refinedev/core';
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
	const { tableProps } = useTable<User>( {
		syncWithLocation: true,
	} );

	const { show } = useNavigation();
	const onCell = ( record:User ) => ( {
		//		onClick: () => show( 'users', record.id ),
	} );

	return (
		<CommonLayout>
			<List>
				<Table { ...tableProps } rowKey="id">
					<Table.Column dataIndex="id" title="Id" width={ 1 } onCell={ onCell } />
					<Table.Column dataIndex="name" title="Name" onCell={ onCell } />
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

					<Table.Column dataIndex="state" title="State" width={ 1 } />
					<Table.Column
						title="Actions"
						dataIndex="actions"
						width={ 1 }
						render={ ( _, record:User ) => (
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
		</CommonLayout>
	);
};

export default UserList;
