import { EyeOutlined, LinkOutlined } from '@ant-design/icons';
import { ParticipantWithMemberships, SafeGroup, Study, StudyResponse } from '@nutritious/core';
import { Show, useTable } from '@refinedev/antd';
import { IResourceComponentsProps, useGetToPath, useGo, useOne, useParsed, useShow } from '@refinedev/core';
import { Button, Card, Col, Descriptions, Divider, Empty, Modal, Row, Space, Table } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DetailsHeader } from '../../components/header/DetailsHeader';
import { resources } from '../../data/resources';


export const ParticipantShow:React.FC<IResourceComponentsProps> = () => {
	const getToPath = useGetToPath();
	const go = useGo();

	const { id: participantId, params } = useParsed<{ studyId?:string }>();

	// get study
	const studyId = params?.studyId;
	const { data: studyData, isLoading: isLoadingStudy } =
		useOne<Study>( {
			resource: 'studies',
			id: studyId,
		} );
	const study = studyData?.data;


	// get participant with memberships
	const { queryResult } =
		useShow<ParticipantWithMemberships>( {} );

	const { data: formData, status, isLoading } = queryResult;

	const [ participant, setParticipant ] = useState( formData?.data );
	const [ groupMap, setGroupMap ] = useState<Record<string, SafeGroup>>( {} );

	useEffect( () => {
		const participant = queryResult.data?.data;
		setParticipant( participant );
	}, [ queryResult ] );
	useEffect( () => {
		setGroupMap( participant?.memberships?.reduce( ( map, m ) => {
			map[m.group.id] = m.group;
			return map;
		}, {} as typeof groupMap ) || {} );

	}, [ participant ] );


	// get responses
	const { tableProps: responseTableProps } =
		useTable<StudyResponse>( {
			resource: 'responses',
			filters: { permanent: [ { field: 'participantId', operator: 'eq', value: participantId } ] },
		} );


	const [ selectedResponse, setSelectedResponse ] = useState<StudyResponse>();

	function showResponse( response?:StudyResponse ){
		setSelectedResponse( response );
	}

	return (
		<>
			<Modal open={ !!selectedResponse } onCancel={ () => showResponse() } onOk={ () => showResponse() }
				   centered width={ 600 }
				   cancelButtonProps={ { style: { display: 'none' } } }
				   title={ 'Response Details' }
			>
				{ !selectedResponse
				  ? <></>
				  : <Space direction={ 'vertical' } className={ 'stretch' }>
					  <Descriptions size={ 'small' } bordered={ true } layout={ 'vertical' }>
						  <Descriptions.Item label={ 'Type' }>
							  { selectedResponse.type }
						  </Descriptions.Item>
						  <Descriptions.Item label={ 'Slot Key' }>
							  { selectedResponse.slotKey }
						  </Descriptions.Item>
						  <Descriptions.Item label={ 'Created' }>
							  { typeof selectedResponse.createdAt === 'string' ? selectedResponse.createdAt : dayjs( selectedResponse.createdAt ).format( 'YYYY-MM-DD HH:mm:ss' ) }
						  </Descriptions.Item>
						  <Descriptions.Item label={ 'Group' }>
							  { groupMap[selectedResponse.groupId || '']?.name || selectedResponse.groupId }
						  </Descriptions.Item>
					  </Descriptions>
					  <Descriptions size={ 'small' } bordered={ true } layout={ 'vertical' }>
						  <Descriptions.Item label={ 'Data' }>
							  <code style={ { whiteSpace: 'pre-wrap' } }>{ JSON.stringify( selectedResponse.data, null, 4 ) }</code>
						  </Descriptions.Item>
					  </Descriptions>
				  </Space>
				}
			</Modal>


			<Show isLoading={ isLoading }
				  contentProps={ { className: 'card-transparent' } }
				  canEdit={ false }
			>

				<Space direction="vertical" className={ 'stretch' } size={ 'middle' }>

					{ !participant ? <Empty /> : <>

						<Card>
							<DetailsHeader study={ study! } participant={ participant } />
							<Divider />

							<Descriptions bordered={ true } column={ 4 }>
								<Descriptions.Item label={ 'Key' } labelStyle={ { width: 140 } }>{ participant.key }</Descriptions.Item>
								<Descriptions.Item label={ 'State' } labelStyle={ { width: 140 } }>{ participant.state }</Descriptions.Item>
								<Descriptions.Item label={ 'Created' } labelStyle={ { width: 140 } }>
									{ participant.createdAt ? dayjs( participant.createdAt ).format( 'YYYY-MM-DD HH:mm' ) : '' }
								</Descriptions.Item>

								{/*{ content.notes &&
								<Descriptions.Item label={ 'Notes' } span={ 3 } labelStyle={ { width: 140 } }>
									<p>{ content.notes }</p>
								</Descriptions.Item>
							}*/ }

							</Descriptions>

						</Card>


						<Row gutter={ [ 20, 20 ] } style={ { marginBlockStart: 20 } }>

							<Col xs={ 24 } lg={ 12 } xxl={ 8 }>
								<Card title={ 'Study Groups' }>

									<Table
										rowKey="id"
										dataSource={ participant.memberships }
										pagination={ false }
									>
										<Table.Column title="Study" dataIndex={ [ 'study', 'name' ] }
													  width={ 1 }
													  render={ ( _, membership:ParticipantWithMemberships['memberships'][number] ) =>
														  <Space style={ { whiteSpace: 'nowrap' } }>
															  <span>{ membership.study.name }</span>
															  <Link
																  to={ getToPath( {
																	  resource: resources.study,
																	  meta: { id: membership.studyId },
																	  action: 'show',
																  } ) || '#' }
															  ><LinkOutlined /></Link>
														  </Space>
													  }
										/>
										<Table.Column title="Group" dataIndex={ [ 'group', 'name' ] }
													  width={ 1 }
													  render={ ( _, membership:ParticipantWithMemberships['memberships'][number] ) =>
														  <Space style={ { whiteSpace: 'nowrap' } }>
															  <span>{ membership.group.name }</span>
															  <Link
																  to={ getToPath( {
																	  resource: resources.group,
																	  meta: { id: membership.groupId, studyId: membership.studyId },
																	  action: 'show',
																  } ) || '#' }
															  ><LinkOutlined /></Link>
														  </Space>
													  }
										/>
										<Table.Column dataIndex="badge" title="Badge" />
										<Table.Column dataIndex="state" title="State" />
									</Table>

								</Card>
							</Col>

							<Col xs={ 24 } lg={ 12 } xxl={ 16 }>
								<Card title={ 'Responses' }>

									<Table { ...responseTableProps } rowKey="id">
										<Table.Column title="Recorded on"
													  dataIndex="createdAt"
													  width={ 1 }
													  render={ date => <span style={ { whiteSpace: 'nowrap' } }>{ dayjs( date ).format( 'YYYY-MM-DD HH:mm:ss' ) }</span> }
										/>
										<Table.Column title="Group"
													  dataIndex="groupId"
													  width={ 1 }
													  render={ groupId => <span style={ { whiteSpace: 'nowrap' } }>{ groupMap[groupId]?.name || groupId }</span> }
										/>
										<Table.Column dataIndex="type" title="Type" />
										<Table.Column
											title="Actions"
											dataIndex="actions"
											width={ 1 }
											render={ ( _, response:StudyResponse ) => (
												<Space>
													<Button size={ 'small' }
															onClick={ () => showResponse( response ) }
													><EyeOutlined /></Button>
												</Space>
											) }
										/>
									</Table>

								</Card>
							</Col>

						</Row>


					</> }
				</Space>

			</Show>
		</>

	);
};
