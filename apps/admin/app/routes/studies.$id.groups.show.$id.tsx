import { CommonLayout } from '@components/common-layout';
import type { Group, Participant, Prisma, Study } from '@nutritious/core';
import { Show, TextField } from '@refinedev/antd';
import { IResourceComponentsProps, useOne, useParsed, useShow } from '@refinedev/core';
import { LinksFunction } from '@remix-run/node';
import { Alert, Button, Card, Col, QRCode, Row, Space, Statistic, Typography } from 'antd';
import React from 'react';

import styles from '~/styles/shared.css';


const { Title } = Typography;

export const links:LinksFunction = () => [ { rel: 'stylesheet', href: styles } ];

export const GroupShow:React.FC<IResourceComponentsProps> = () => {
	const { id: groupId, params } = useParsed<{ studyId?:string }>();
	// get study
	const studyId = params?.studyId;
	const { data: studyData, isLoading: isLoadingStudy } =
		useOne<Study>( {
			resource: 'studies',
			id: studyId,
		} );
	const study = studyData?.data;


	// get group -> show
	const { queryResult } =
		useShow<Group>( {
			meta: {
				fields: [ 'id', 'name', 'state', 'signupPeriod', 'responsePeriod' ],
				operation: 'groups',
			},
		} );

	const { data: groupData, status, isLoading } = queryResult;
	const group = groupData?.data;

	const qrcValue = group?.regKey && group?.regPass
					 ? group.regKey + ':' + group.regPass
					 : undefined;


	// get participants
	/*const { tableProps: groupTableProps } =
		useTable( {
			syncWithLocation: true,
			resource: 'groupmembers',
			meta: {
				fields: [ 'id', 'name', 'state' ],
				operation: 'groupmembers',
			},
			filters: {
				permanent: [ { field: 'groupId', operator: 'eq', value: groupId } ],
			},
		} );*/

	const downloadQRCodePNG = () => {
		const canvas = document.getElementById( 'signupQRCode' )?.querySelector<HTMLCanvasElement>( 'canvas' );
		if( canvas ){
			const url = canvas.toDataURL();
			const a = document.createElement( 'a' );
			a.href = url;
			a.download = 'Signup QR Code ' + study?.name + ' - ' + group!.name + '.png';
			document.body.appendChild( a );
			a.click();
			document.body.removeChild( a );
		}
	};

	const downloadQRCodeSVG = () => {
		const svgEl = document.getElementById( 'signupQRCode' )?.querySelector<SVGElement>( 'svg' );
		if( svgEl ){
			svgEl.setAttribute( 'xmlns', 'http://www.w3.org/2000/svg' );
			const svgData = svgEl.outerHTML;
			const preface = '<?xml version="1.0" standalone="no"?>\r\n';
			const svgBlob = new Blob( [ preface, svgData ], { type: 'image/svg+xml;charset=utf-8' } );
			const svgUrl = URL.createObjectURL( svgBlob );
			const downloadLink = document.createElement( 'a' );
			downloadLink.href = svgUrl;
			downloadLink.download = 'Signup QR Code ' + study?.name + ' - ' + group!.name + '.svg';
			document.body.appendChild( downloadLink );
			downloadLink.click();
			document.body.removeChild( downloadLink );
		}
	};

	return (
		<CommonLayout>

			<Show isLoading={ isLoading }>
				<Title level={ 5 }>Study</Title>
				<TextField value={ study?.name } />

				<Title level={ 5 }>Id</Title>
				<TextField value={ group?.id } />
				{/*<Title level={ 5 }>Created At</Title>
			<DateField value={ record?.createdAt } />
			<Title level={ 5 }>Updated At</Title>
			<DateField value={ record?.updatedAt } />*/ }
				<Title level={ 5 }>State</Title>
				<TextField value={ group?.state } />
				<Title level={ 5 }>Name</Title>
				<TextField value={ group?.name } />
			</Show>

			<Row gutter={ [ 20, 20 ] } style={ { marginBlockStart: 20 } }>
				<Col xs={ 24 } lg={ { span: 6, order: 2 } }>
					<Card
						title={ 'Signup Info' }
						className={ 'group-signup-card' }
						extra={ qrcValue ? (
							<Space>
								download
								<Button type="default" onClick={ downloadQRCodePNG }>PNG</Button>
								<Button type="default" onClick={ downloadQRCodeSVG }>SVG</Button>
							</Space>
						) : undefined }
					>

						{ qrcValue && group ? ( <>
							<Space direction={ 'vertical' } size={ 20 } style={ { width: '100%' } }>
								<div id="signupQRCode">
									<QRCode
										type={ 'canvas' } style={ { display: 'none' } }
										bgColor={ '#fff' }
										size={ 800 }
										errorLevel={ 'Q' }
										value={ qrcValue }
									/>
									<QRCode
										type={ 'svg' }
										size={ '100%' }
										errorLevel={ 'Q' }
										value={ qrcValue }
									/>
								</div>

								<Row gutter={ [ 40, 20 ] } wrap={ true } className={ 'signup-credentials-wrap' }>
									<Col xs={ 24 } md={ 12 }>
										<Statistic title="Key" value={ group.regKey! } />
									</Col>
									<Col xs={ 24 } md={ 12 }>
										<Statistic title="Password" value={ group.regPass! } />
									</Col>
								</Row>
							</Space>
						</> ) : ( <>
							<Alert type={ 'warning' } message={ 'Signup Key and or Password are missing.' } />
						</> ) }

					</Card>
				</Col>

				<Col xs={ 24 } lg={ 18 }>

					<Card title={ 'Participants' }>
						{/*
						<Table { ...groupTableProps } rowKey="id">
							<Table.Column dataIndex="name" title="Name" />
							<Table.Column
								title="Actions"
								dataIndex="actions"
								width={ 1 }
								render={ ( _, participant:Participant ) => (
									<Space>
										<EditButton
											hideText
											size="small"
											resource={ 'groups' }
											recordItemId={ participant.id }
											meta={ { studyId, groupId } }
										/>
										<ShowButton
											hideText
											size="small"
											resource={ 'participants' }
											recordItemId={ participant.id }
											meta={ { studyId, groupId } }
										/>
									</Space>
								) }
							/>
						</Table>
						*/ }
					</Card>

				</Col>
			</Row>


		</CommonLayout>
	);
};
export default GroupShow;
