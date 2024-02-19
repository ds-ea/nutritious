import { CommonLayout } from '@components/common-layout';
import { EditButton, List, ShowButton, useTable } from '@refinedev/antd';
import { BaseRecord, IResourceComponentsProps } from '@refinedev/core';
import { Space, Table } from 'antd';


/*
import { AntdInferencer } from '@refinedev/inferencer/antd';
export default function PagesList(){
	return <CommonLayout>
		<AntdInferencer
			action="list"
			meta={ {
				pages: {
					getList: {
						fields: [ 'id', 'name' ],
						operation: 'pages',
					},
				},
			} }
		/>
	</CommonLayout>;
}
*/
import React from 'react';


export const PagesList:React.FC<IResourceComponentsProps> = () => {
	const { tableProps } = useTable( {
		syncWithLocation: true,
		meta: {
			fields: [ 'id', 'name', 'alias' ],
			operation: 'pages',
		},
	} );

	return (
		<CommonLayout>
			<List>
				<Table { ...tableProps } rowKey="id">
					{/*<Table.Column dataIndex="id" title="Id" />*/ }
					<Table.Column dataIndex="name" title="Name" />
					<Table.Column dataIndex="alias" title="Alias" />
					<Table.Column dataIndex="state" title="State" />
					<Table.Column dataIndex="nav" title="Menu" />
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
		</CommonLayout>
	);
};
export default PagesList;
