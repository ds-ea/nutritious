import type { Study } from '@nutritious/core';
import { EditButton, List, ShowButton, useTable } from '@refinedev/antd';
import { IResourceComponentsProps } from '@refinedev/core';
import { Space, Table } from 'antd';
import React from 'react';


export const StudiesList:React.FC<IResourceComponentsProps> = () => {
	const { tableProps } = useTable( {
		syncWithLocation: true,
		resource: 'studies',
		meta: {
			fields: [ 'id', 'name', 'state' ],
			operation: 'studies',
		},
	} );

	return (
		<List>
			<Table { ...tableProps } rowKey="id">
				{/*<Table.Column dataIndex="id" title="Id" />*/ }
				<Table.Column dataIndex="name" title="Name" />
				<Table.Column dataIndex="alias" title="Alias" />
				<Table.Column dataIndex="nav" title="Menu" />
				<Table.Column dataIndex="state" title="State" width={ 1 } />
				<Table.Column
					title="Actions"
					dataIndex="actions"
					width={ 1 }
					render={ ( _, record:Study ) => (
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
export default StudiesList;
