import { ExpandAltOutlined, ShrinkOutlined } from '@ant-design/icons';
import { FormContent, FormInputPreset, FormQuestion, FormSetup, InputPreset, Study, StudyForm } from '@nutritious/core';
import { Show } from '@refinedev/antd';
import { IResourceComponentsProps, useList, useOne, useParsed, useShow } from '@refinedev/core';
import { Alert, Button, Card, Collapse, Descriptions, Divider, Empty, Flex, Space, Typography } from 'antd';
import capitalize from 'antd/lib/_util/capitalize';
import { DefaultOptionType } from 'rc-select/lib/Select';
import React, { useEffect, useState } from 'react';
import { FormItemInput } from '../../../components/forms/FormItemInput';
import { DetailsHeader } from '../../../components/header/DetailsHeader';


const { Title } = Typography;



export const FormShow:React.FC<IResourceComponentsProps> = () => {
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
		useShow<StudyForm>( {} );

	const { data: formData, status, isLoading } = queryResult;
	const form = formData?.data;

	const [ items, setItems ] = useState<( FormQuestion | FormContent )[]>( [] );
	useEffect( () => {
		const setup:FormSetup = ( form?.setup ? typeof form.setup === 'string' ? JSON.parse( form.setup ) : form.setup : {} ) ?? {};

		if( !setup.items )
			return;

		setItems( setup.items );

	}, [ form ] );

	const { data: inputPresetsData, isLoading: isLoadingInputPresets } = useList<FormInputPreset & InputPreset>( {
		resource: 'form-input-presets',
	} );
	const [ inputPresets, setInputPresets ] = useState( {} as Record<string, InputPreset> );
	const [ inputPresetsOptions, setInputPresetsOptions ] = useState( {} as Record<string, DefaultOptionType[]> );

	useEffect( () => {
		const byId:typeof inputPresets = {};
		const byTypeAsOptions:typeof inputPresetsOptions = {};

		if( inputPresetsData?.data )
			for( const preset of inputPresetsData.data ){
				if( !byTypeAsOptions[preset.inputType] )
					byTypeAsOptions[preset.inputType] = [];

				byId[preset.id] = preset;
				byTypeAsOptions[preset.inputType].push( { label: preset.name ?? preset.id, value: preset.id } );
			}

		setInputPresets( byId );
		setInputPresetsOptions( byTypeAsOptions );

	}, [ inputPresetsData ] );


	const [ activeKey, setActiveKey ] = useState<string[]>( [] );
	const toggleExpanded = ( keys?:string | string[] ) => {
		if( keys && Array.isArray( keys ) )
			setActiveKey( keys );
		else if( activeKey.length != items.length )
			setActiveKey( items.map( ( value, index ) => index + '' ) );
		else
			setActiveKey( [] );
	};

	return (
		<Show isLoading={ isLoading } contentProps={ { className: 'card-transparent' } }>
			<Space direction="vertical" className={ 'stretch' } size={ 'middle' }>

				{ !form ? <Empty /> : <>

					<Card>
						<DetailsHeader study={ study! } form={ form } />
						<Divider />

						<Descriptions bordered={ true } column={ 4 }>
							{ form.notes &&
								<Descriptions.Item label={ 'Notes' } span={ 3 } labelStyle={ { width: 140 } }>
									<p>{ form.notes }</p>
								</Descriptions.Item>
							}

						</Descriptions>


						<Divider orientation={ 'left' }>Public</Divider>
						<Descriptions bordered={ true } column={ 4 }>
							<Descriptions.Item label={ 'Title' }>{ form.title }</Descriptions.Item>
							<Descriptions.Item label={ 'Intro' }>{ form.intro }</Descriptions.Item>
						</Descriptions>

					</Card>

					<Card title={ 'Form' }
						  extra={
							  <Button onClick={ () => toggleExpanded() }>
								  { activeKey?.length === items.length ? <ShrinkOutlined /> : <ExpandAltOutlined /> }
							  </Button>
						  }
					>
						<Space direction={ 'vertical' }>

							<Collapse activeKey={ activeKey } onChange={ toggleExpanded }>
								{ items?.map( ( item, num ) =>
									<Collapse.Panel key={ num }
													header={ ( num + 1 ) + ' - ' + ( 'heading' in item ? item.heading : '' ) }
									>
										{ item.type === 'content'
										  ? <>
											  <Descriptions size={ 'small' } bordered={ true } className={ 'label-top' } column={ 4 }>
												  <Descriptions.Item label={ 'Content' } span={ 4 }>
													  { item.content?.plain?.data }
												  </Descriptions.Item>
											  </Descriptions>
										  </>
										  : <>
											  <Descriptions bordered={ true } className={ 'label-top' } column={ 4 }>
												  <Descriptions.Item key={ num + '-key' } label={ 'Key' } labelStyle={ { width: 170 } } span={ 4 }>
													  { item.key }
												  </Descriptions.Item>

												  <Descriptions.Item key={ num + '-desc' } label={ 'Description' } span={ 4 }>
													  { item.description }
												  </Descriptions.Item>

												  <Descriptions.Item key={ num + '-required' } label={ 'Necessity' } span={ 4 }>
													  { item.required }
												  </Descriptions.Item>

												  <Descriptions.Item key={ num + '-input' } span={ 4 }
																	 label={
																		 <Flex gap={ 'small' } align={ 'center' } justify={ 'space-between' }>
																			 <span>Preview</span>
																		 </Flex>
																	 }
												  >
													  <FormItemInput input={ item.input } config={ item.preset && inputPresets[item.preset] ? inputPresets[item.preset].config : item.config } />
												  </Descriptions.Item>

												  <Descriptions.Item key={ num + '-config' } span={ 4 }
																	 label={
																		 <Flex gap={ 'small' } align={ 'stretch' } justify={ 'flex-start' } vertical>
																			 <span>Config</span>
																			 <span><strong>{ capitalize( item.input ) }</strong></span>

																			 { item.preset &&
																				 <>
																					 <span>Preset</span>
																					 <strong>{ inputPresets[item.preset]?.name ?? item.preset }</strong>
																				 </>
																			 }
																		 </Flex>
																	 }
												  >
													  <code>
														  <small>{ JSON.stringify( item.preset && inputPresets[item.preset] ? inputPresets[item.preset].config : item.config ) }</small>
													  </code>
												  </Descriptions.Item>

											  </Descriptions>

										  </>
										}

									</Collapse.Panel>,
								) }
							</Collapse>

							<Alert type={ 'info' } message={ 'Note: Input previews are currently not representative of all configuration properties, and differs visually from what participants see in the app.' } />
						</Space>

					</Card>

				</> }
			</Space>

		</Show>
	);
};
