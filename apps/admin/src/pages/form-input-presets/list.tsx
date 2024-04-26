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


export const FormInputPresetsList:React.FC<IResourceComponentsProps> = () => {
	const { tableProps } = useTable( {
		syncWithLocation: true,
		meta: {
			fields: [ 'id', 'name', 'alias' ],
			operation: 'form-input-presets',
		},
	} );

	return (
		<List>
			<Table { ...tableProps } rowKey="id">
				{/*<Table.Column dataIndex="id" title="Id" />*/ }
				<Table.Column dataIndex="name" title="Name" />
				<Table.Column dataIndex="inputType" title="Type" />
				<Table.Column
					title="Actions"
					dataIndex="actions"
					width={ 1 }
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
