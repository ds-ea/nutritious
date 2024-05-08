import { EyeOutlined, IdcardOutlined, LinkOutlined, UserAddOutlined, UsergroupDeleteOutlined, UserSwitchOutlined } from '@ant-design/icons';
import { EntityState, ExportableResponse, Group, GroupMember, ParticipantWithMemberships, PublicStudy, SafeGroup, Study, StudyResponse } from '@nutritious/core';
import { Show, useTable } from '@refinedev/antd';
import { IResourceComponentsProps, useApiUrl, useCustomMutation, useExport, useGetToPath, useGo, useList, useNotification, useOne, useParsed, useShow } from '@refinedev/core';
import { Button, Card, Col, Descriptions, Divider, Empty, Input, List, Modal, Row, Space, Spin, Table, Tag } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DetailsHeader } from '../../components/header/DetailsHeader';
import { ExportButton } from '../../components/header/ExportButton';
import { resources } from '../../data/resources';
import { responseExportOptions } from '../../services/exporter';


type GroupAssignmentState = 'add' | 'remove';
type GroupAssignment = {
	study:PublicStudy,
	groups:{
		group:SafeGroup;
		membership?:GroupMember;
		change?:GroupAssignmentState;
		badge?:string;
	}[]
};


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
	const [ memberships, setMemberships ] = useState( formData?.data?.memberships );
	const [ groupMap, setGroupMap ] = useState<Record<string, SafeGroup>>( {} );

	useEffect( () => {
		const participant = queryResult.data?.data;
		setParticipant( participant );
	}, [ queryResult ] );

	useEffect( () => {
		setGroupMap( memberships?.reduce( ( map, m ) => {
			map[m.group.id] = m.group;
			return map;
		}, {} as typeof groupMap ) || {} );
	}, [ memberships ] );


	// get responses
	const { tableProps: responseTableProps } =
		useTable<StudyResponse>( {
			resource: 'responses',
			filters: { permanent: [ { field: 'participantId', operator: 'eq', value: participantId } ] },
		} );

	const [ exportSettings, setExportSettings ] = useState<ReturnType<typeof responseExportOptions>>();
	useEffect( () => {
		if( !participant )
			return;

		setMemberships( participant?.memberships || [] );
		setExportSettings( responseExportOptions( { participant } ) );
	}, [ participant ] );

	const { triggerExport, isLoading: exportPending } = useExport<ExportableResponse>( exportSettings );


	const [ selectedResponse, setSelectedResponse ] = useState<StudyResponse>();

	function showResponse( response?:StudyResponse ){
		setSelectedResponse( response );
	}

	const [ groupAssignments, setGroupAssignments ] = useState<GroupAssignment[] | undefined>();

	const { data: availableGroups } = useList<Group & { study:PublicStudy }>( {
		resource: 'groups',
		pagination: { mode: 'off' },
		filters: [ { field: 'state', operator: 'eq', value: 'ENABLED' } ],
		meta: { join: [ 'study' ] },
	} );


	const openGroupAssignments = async () => {
		const assignments:Record<string, GroupAssignment> = {};
		for( const group of availableGroups?.data || [] ){
			if( !group.studyId || !group.study )
				continue;

			if( !assignments[group.studyId] )
				assignments[group.studyId] = { study: group.study, groups: [] };

			const membership = memberships?.find( member => member.groupId === group.id );
			assignments[group.studyId].groups.push( { group, membership, badge: membership?.badge || undefined } );
		}

		const groupAssignments = Object.values( assignments );
		setGroupAssignments( groupAssignments );
	};


	function setAssignmentBadge( groupId:string, value:string ){
		const assignments = groupAssignments ? [ ...groupAssignments ] : [];
		for( const st of assignments || [] )
			for( const gru of st.groups )
				if( gru.group.id === groupId ){
					gru.badge = value;
					break;
				}

		setGroupAssignments( assignments );
	}

	function changeGroupAssignments( groupId:string, state?:GroupAssignmentState ){
		const assignments = groupAssignments ? [ ...groupAssignments ] : [];
		const changedStudies = [];

		for( const st of assignments || [] )
			for( const gru of st.groups )
				if( gru.group.id === groupId ){
					if( state === 'add' ){
						if( gru.membership?.state !== EntityState.Enabled )
							gru.change = 'add';
						else
							gru.change = undefined;

					}else if( state === 'remove' ){
						if( gru.membership?.state === EntityState.Enabled )
							gru.change = 'remove';
						else
							gru.change = undefined;
					}

					changedStudies.push( st );
					break;
				}

		// toggle conflicting group assignments
		if( changedStudies.length ){
			if( state === 'add' ){
				for( const st of changedStudies )
					for( const gru of st.groups )
						if( gru.group.id === groupId ){

						}else if( gru.membership?.state === EntityState.Enabled || gru.change === 'add' )
							gru.change = gru.membership ? 'remove' : undefined;

			}else if( state === 'remove' ){
				for( const st of changedStudies )
					for( const gru of st.groups )
						if( gru.group.id === groupId ){

						}else if( gru.membership?.state === EntityState.Enabled || gru.change === 'add' )
							gru.change = gru.membership?.state === EntityState.Enabled ? 'remove' : undefined;
			}

			setGroupAssignments( assignments );

		}
	}

	const apiUrl = useApiUrl();
	const { mutate: commitAssignments, isLoading: isUpdatingAssignments } = useCustomMutation<ParticipantWithMemberships>();
	const { open, close } = useNotification();


	function finishGroupAssignments( commit?:boolean ){
		if( !participantId )
			throw new Error( 'participant id is not set' );

		if( isUpdatingAssignments )
			return;

		if( !commit )
			return setGroupAssignments( undefined );

		const changes = [];
		for( const st of groupAssignments || [] )
			for( const gru of st.groups )
				if( gru.change || gru.badge !== gru.membership?.badge ){
					if( gru.change === 'add' && !gru.badge?.length ){
						// open notification
						open?.( {
							type: 'error',
							message: `${ st.study.name } → ${ gru.group.name }`,
							description: 'No badge assigned',
						} );
						return;
					}

					changes.push( { studyId: st.study.id, groupId: gru.group.id, change: gru.change, badge: gru.badge } );
				}

		if( !changes.length )
			return setGroupAssignments( undefined );

		commitAssignments( {
			url: apiUrl + '/participants/' + participantId + '/assign-groups',
			method: 'post',
			values: changes,
		}, {
			onSuccess: data => {
				const participant = data?.data;
				setMemberships( participant?.memberships || [] );
				setGroupAssignments( undefined );
			},
		} );
	}

	return (
		<>
			<Modal open={ !!groupAssignments }
				   onCancel={ () => finishGroupAssignments() }
				   onOk={ () => finishGroupAssignments( true ) }
				   centered width={ 600 }
				   title={ 'Change Group Assignments' }
			>
				{ !groupAssignments?.length
				  ? <Empty />
				  :
				  <Spin tip="Loading..." spinning={ isUpdatingAssignments }>
					  <Space direction={ 'vertical' } className={ 'stretch' }>
						  { groupAssignments.map( item =>
							  <List dataSource={ item.groups }
									key={ item.study.id }
									header={ item.study.name }
									bordered
									split={ false }
									className={ 'group-assignments' }
									renderItem={ ( assignment ) =>
										<List.Item key={ assignment.group.id }
												   actions={
													   ( assignment.membership?.state === EntityState.Enabled && assignment.change !== 'remove' ) || assignment.change === 'add'
													   ? [
															   <Button size="small" icon={ <UsergroupDeleteOutlined /> }
																	   onClick={ () => changeGroupAssignments( assignment.group.id, 'remove' ) }
															   >remove</Button>,
														   ]
													   : [
															   <Button size="small" icon={ <UserAddOutlined /> }
																	   onClick={ () => changeGroupAssignments( assignment.group.id, 'add' ) }
															   >assign</Button>,
														   ]
												   }
										>
											<List.Item.Meta
												title={ assignment.group.name }
												description={
													assignment.change === 'add'
													? <Tag color="success" icon={ <UserAddOutlined /> }>participant will be added to this group</Tag>
													: assignment.change === 'remove'
													  ? <Tag color="error" icon={ <UsergroupDeleteOutlined /> }>participant will be removed from this group</Tag>
													  : undefined
												}
											/>
											{
												( assignment.membership || assignment.change === 'add' ) &&
												<Space.Compact>
													<Input placeholder="Badge" addonBefore={ <IdcardOutlined title={ 'Participant Badge' } /> }
														   variant="filled"
														   value={ assignment.badge }
														   size={ 'small' }
														   onChange={ event => setAssignmentBadge( assignment.group.id, event.target.value ) }
													/>
												</Space.Compact>
											}
										</List.Item>
									}
							  />,
						  ) }
					  </Space>
				  </Spin>
				}
			</Modal>

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
				  headerButtons={ ( { defaultButtons } ) => (
					  <>
						  <ExportButton triggerExport={ triggerExport } exportContext={ 'participant' } />
						  <Space direction="vertical"></Space>
						  { defaultButtons }
					  </>
				  ) }
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
								<Card title={ 'Study Groups' }
									  extra={
										  <Button icon={ <UserSwitchOutlined /> }
												  onClick={ () => openGroupAssignments() }
										  >change group assignments</Button>
									  }
								>

									<Table
										rowKey="id"
										dataSource={ memberships }
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
