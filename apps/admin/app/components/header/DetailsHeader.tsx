import type { Group, Schedule, Study, StudyContent, StudyForm } from '@nutritious/core';
import { Descriptions, Space } from 'antd';
import React from 'react';


type DetailsHeaderRecordTypes =
	| { schedule:Schedule | undefined }
	| { group:Group | undefined }
	| { form:StudyForm | undefined }
	| { content:StudyContent | undefined }
	;

type DetailsHeaderProps = { study?:Study, } & Partial<DetailsHeaderRecordTypes>

type KeysOfUnion<T> = T extends T ? keyof T : never;

export const DetailsHeader:React.FC<DetailsHeaderProps> = ( { study, ...props } ) => {

	const recordType = [ 'schedule', 'group', 'form', 'content' ].filter( type => type in props )?.[0] as KeysOfUnion<DetailsHeaderRecordTypes>;
	//@ts-ignore
	const record:Schedule | Group | StudyForm | StudyContent = props[recordType];


	return (
		<>
			<Descriptions size={ 'small' } bordered={ true }>

				{ record &&
					<Descriptions.Item
						label={ recordType } labelStyle={ { fontWeight: 'bold', textTransform: 'capitalize' } }
						span={ 2 }
					>
						<Space size={ 'small' } wrap={ true }>
							<div style={ { fontWeight: 'bold' } }>{ record.name ?? record.id }</div>
							<div>{ record.name && <small>( { record.id } )</small> }</div>
						</Space>
					</Descriptions.Item>
				}

				{ study &&
					<Descriptions.Item label={ 'Study' }>{ study?.name ?? study?.id }</Descriptions.Item>
				}
			</Descriptions>
		</>
	);
};
