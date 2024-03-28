import { Group, Schedule, Study, xorEncryptDecrypt } from '@nutritious/core';
import { Show } from '@refinedev/antd';
import { IResourceComponentsProps, useOne, useParsed, useShow } from '@refinedev/core';
import { Alert, Button, Card, Col, Descriptions, Divider, Empty, QRCode, Row, Space, Statistic, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import { DetailsHeader } from '../../../components/header/DetailsHeader';


const { Title } = Typography;



function getShortenedDomain( url:string ){
	const [ scheme, domain ] = url.split( '://' );
	return ( scheme === 'https' ? '1' : '0' ) + domain;
}

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
		useShow<Group & { schedule?:Schedule }>( {
			meta: {
				fields: [ 'id', 'name', 'state', 'signupPeriod', 'responsePeriod' ],
				operation: 'groups',
			},
		} );

	const { data: groupData, status, isLoading } = queryResult;
	const group = groupData?.data;

	const domain = import.meta.env['VITE_API_URL'];

	const [ includeDomain, setIncludeDomain ] = useState<boolean>( true );
	const [ qrcValue, setQrcValue ] = useState<string | null>( null );

	useEffect( () => {
		let code:string | null = null;

		const qrKey = import.meta.env['VITE_QR_CODE_HASH'];
		const qrSalt = 'asdoufawejasdifya0w3y-r8werfwe7gbR&#_(*&H#Q0u';

		if( group?.regKey && group?.regPass ){
			const crypt = true;
			code = [
				'0' + ( crypt ? 'x' : '' ),
				...[
					group.regKey,
					group.regPass,
					getShortenedDomain( domain ),
				].map( v => crypt ? xorEncryptDecrypt( v, qrKey, qrSalt ) : v ),
			].join( '█' );
		}

		setQrcValue( code );

	}, [ group, includeDomain ] );

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
		<Show isLoading={ isLoading } contentProps={ { className: 'card-transparent' } }>
			<Space direction="vertical" className={ 'stretch' } size={ 'middle' }>

				<Card>
					<DetailsHeader study={ study! } group={ group } />
					<Divider />

					{ group &&
						<Descriptions bordered={ true } column={ 4 } size={ 'small' }>

							<Descriptions.Item label={ 'Schedule' } span={ 4 } labelStyle={ { width: 140 } }>
								{ group.schedule?.name }
							</Descriptions.Item>

							{ group.notes &&
								<Descriptions.Item label={ 'Notes' } span={ 4 } labelStyle={ { width: 140 } }>
									{ group.notes }
								</Descriptions.Item>
							}
						</Descriptions>
					}

				</Card>


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
											size={ '100%' as any }
											errorLevel={ 'Q' }
											value={ qrcValue }
										/>
									</div>
									{ qrcValue }
									<Row gutter={ [ 40, 20 ] } wrap={ true } className={ 'signup-credentials-wrap' }>
										<Col xs={ 24 } md={ 12 }>
											<Statistic title="Key" value={ group.regKey! } />
										</Col>
										<Col xs={ 24 } md={ 12 }>
											<Statistic title="Password" value={ group.regPass! } />
										</Col>
										<Col xs={ 24 }>
											<Statistic title="Domain" value={ domain } />
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
							<Empty description={ 'no registered participants' } />
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

			</Space>
		</Show>
	);
};
export default GroupShow;
