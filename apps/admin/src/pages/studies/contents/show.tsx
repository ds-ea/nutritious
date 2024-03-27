import type { ContentContainer, Study, StudyContent } from '@nutritious/core';
import { Show } from '@refinedev/antd';
import { IResourceComponentsProps, useOne, useParsed, useShow } from '@refinedev/core';
import MDEditor from '@uiw/react-md-editor';
import { Card, Descriptions, Divider, Empty, Space, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import { DetailsHeader } from '../../../components/header/DetailsHeader';


const { Title } = Typography;



export const ContentShow:React.FC<IResourceComponentsProps> = () => {
	const { id: formId, params } = useParsed<{ studyId?:string }>();

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
		useShow<StudyContent>( {} );

	const { data: formData, status, isLoading } = queryResult;
	let content = formData?.data;
	const [ md, setMd ] = useState<string>( '' );

	useEffect( () => {
		content = queryResult.data?.data;
		const contentData = content?.content as ContentContainer;
		setMd( contentData?.md?.data ?? '' );
	}, [ queryResult ] );

	return (
		<Show isLoading={ isLoading } contentProps={ { className: 'card-transparent' } }>
			<Space direction="vertical" className={ 'stretch' } size={ 'middle' }>

				{ !content ? <Empty /> : <>

					<Card>
						<DetailsHeader study={ study! } content={ content } />
						<Divider />

						<Descriptions bordered={ true } column={ 4 }>
							{ content.notes &&
								<Descriptions.Item label={ 'Notes' } span={ 3 } labelStyle={ { width: 140 } }>
									<p>{ content.notes }</p>
								</Descriptions.Item>
							}

						</Descriptions>

					</Card>

					<Card title={ 'Content' }>
						<Title>{ content.title }</Title>
						<MDEditor.Markdown
							source={ md ?? '' }
							wrapperElement={ { 'data-color-mode': 'light' } }
						/>
					</Card>

				</> }
			</Space>

		</Show>
	);
};
