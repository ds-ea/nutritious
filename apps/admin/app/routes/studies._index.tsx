/*
import { CommonLayout } from '@components/common-layout';
import { AntdInferencer } from '@refinedev/inferencer/antd';


export default function PagesList(){
	return <CommonLayout>
		<AntdInferencer
			action="list"
			meta={ {
				studies: {
					getList: {
						//						fields: [ 'id', 'name' ],
						operation: 'studies',
					},
				},
			} }
		/>
	</CommonLayout>;
}
*/

import { CommonLayout } from '@components/common-layout';
import { Study } from '@nutritious/core';
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
		<CommonLayout>
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
		</CommonLayout>
	);
};
export default StudiesList;
