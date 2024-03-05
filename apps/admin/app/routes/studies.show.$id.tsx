import { CommonLayout } from '@components/common-layout';
import type { Group, Prisma, Schedule, Study, StudyForm } from '@nutritious/core';
import { CreateButton, EditButton, Show, ShowButton, TextField, useTable } from '@refinedev/antd';
import { IResourceComponentsProps, useParsed, useShow } from '@refinedev/core';
import { Card, Col, Divider, Row, Space, Table, Typography } from 'antd';
import React from 'react';


const { Title } = Typography;

export const StudyShow:React.FC<IResourceComponentsProps> = () => {
	const { id: studyId } = useParsed();

	const { queryResult } = useShow<Study>( {
		meta: {
			fields: [ 'id', 'name', 'state', 'signupPeriod', 'responsePeriod' ],
			operation: 'studies',
		},

	} );
	const { data, isLoading } = queryResult;
	const study = data?.data;

	// get groups
	const { tableProps: groupTableProps, setFilters } = useTable( {
		syncWithLocation: true,
		resource: 'groups',
		filters: {
			permanent: [ { field: 'studyId', operator: 'eq', value: studyId } ],
		},
		meta: {
			fields: [ 'id', 'name', 'state' ],
			operation: 'groups',
		},
	} );

	// get schedules
	const { tableProps: schedulesTableProps } =
		useTable( {
			syncWithLocation: true,
			resource: 'schedules',
			meta: {
				fields: [ 'id', 'name', 'state' ],
				operation: 'schedules',
			},
			filters: {
				permanent: [
					{
						field: 'studyId',
						operator: 'eq',
						value: studyId,
					},
				],
			},
		} );

	// get forms
	const { tableProps: formsTableProps } =
		useTable( {
			syncWithLocation: true,
			resource: 'study-forms',
			meta: {
				fields: [ 'id', 'name', 'state' ],
			},
			filters: {
				permanent: [
					{
						field: 'studyId',
						operator: 'eq',
						value: studyId,
					},
				],
			},
		} );


	return (
		<CommonLayout>
			<Show isLoading={ isLoading }>
				<Title level={ 5 }>Id</Title>
				<TextField value={ study?.id } />
				{/*<Title level={ 5 }>Created At</Title>
				<DateField value={ record?.createdAt } />
				<Title level={ 5 }>Updated At</Title>
				<DateField value={ record?.updatedAt } />*/ }
				<Title level={ 5 }>State</Title>
				<TextField value={ study?.state } />
				<Title level={ 5 }>Name</Title>
				<TextField value={ study?.name } />

				<Divider />

			</Show>


			<Row gutter={ [ 20, 20 ] } style={ { marginBlockStart: 20 } }>

				<Col xs={ 24 } lg={ 12 } xl={ 8 }>
					<Card title="Participant Groups" id={ 'groups' }
						  extra={ (
							  <CreateButton resource={ 'groups' } disabled={ isLoading } meta={ { studyId } }>
								  add Group
							  </CreateButton>
						  ) }
					>
						<Table { ...groupTableProps } rowKey="id">
							{/*<Table.Column dataIndex="id" title="Id" />*/ }
							<Table.Column dataIndex="name" title="Name" />
							<Table.Column dataIndex="state" title="State" width={ 1 } />
							<Table.Column
								title="Actions"
								dataIndex="actions"
								width={ 1 }
								render={ ( _, group:Group ) => (
									<Space>
										<EditButton
											hideText
											size="small"
											resource={ 'groups' }
											recordItemId={ group.id }
											meta={ { studyId: group.studyId } }
										/>
										<ShowButton
											hideText
											size="small"
											resource={ 'groups' }
											recordItemId={ group.id }
											meta={ { studyId: group.studyId } }
										/>
									</Space>
								) }
							/>
						</Table>
					</Card>
				</Col>

				<Col xs={ 24 } lg={ 12 } xl={ 8 }>
					<Card title="Schedules" id="schedules"
						  extra={ (
							  <CreateButton resource={ 'schedules' } disabled={ isLoading } meta={ { studyId } }>
								  add Schedule
							  </CreateButton>
						  ) }
					>
						<Table { ...schedulesTableProps } rowKey="id">
							{/*<Table.Column dataIndex="id" title="Id" />*/ }
							<Table.Column dataIndex="name" title="Name" />
							<Table.Column dataIndex="state" title="State" width={ 1 } />
							<Table.Column
								title="Actions"
								dataIndex="actions"
								width={ 1 }
								render={ ( _, schedule:Schedule ) => (
									<Space>
										<EditButton
											hideText
											size="small"
											resource={ 'schedules' }
											recordItemId={ schedule.id }
											meta={ { studyId } }
										/>
										<ShowButton
											hideText
											size="small"
											resource={ 'schedules' }
											recordItemId={ schedule.id }
											meta={ { studyId } }
										/>
									</Space>
								) }
							/>
						</Table>
					</Card>
				</Col>

				<Col xs={ 24 } lg={ 12 } xl={ 8 }>
					<Card title="Forms" id="forms"
						  extra={ (
							  <CreateButton resource={ 'study-forms' } disabled={ isLoading } meta={ { studyId } }>
								  add Form
							  </CreateButton>
						  ) }
					>
						<Table { ...formsTableProps } rowKey="id">
							{/*<Table.Column dataIndex="id" title="Id" />*/ }
							<Table.Column dataIndex="name" title="Name" />
							<Table.Column dataIndex="state" title="State" width={ 1 } />
							<Table.Column
								title="Actions"
								dataIndex="actions"
								width={ 1 }
								render={ ( _, form:StudyForm ) => (
									<Space>
										<EditButton
											hideText
											size="small"
											resource={ 'study-forms' }
											recordItemId={ form.id }
											meta={ { studyId } }
										/>
										<ShowButton
											hideText
											size="small"
											resource={ 'study-forms' }
											recordItemId={ form.id }
											meta={ { studyId } }
										/>
									</Space>
								) }
							/>
						</Table>
					</Card>
				</Col>

			</Row>


			{/*<Tabs items={ [
				{
					key: 'groups', label: 'Groups', children: ( <>
					</> ),
				},
				{
					key: 'schedules', label: `Schedules`, children: ( <>
					</> ),
				},
			] } />*/ }

		</CommonLayout>
	);
};
export default StudyShow;
