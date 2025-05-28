import { CaretDownOutlined, CaretUpOutlined, MinusCircleOutlined } from '@ant-design/icons';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import QuizIcon from '@mui/icons-material/Quiz';
import { FormContent, FormInputNecessity, FormInputPreset, FormInputType, FormItem, FormQuestion, FormSetup, InputPreset, Prisma, Study } from '@nutritious/core';
import { useList } from '@refinedev/core';
import { Button, Descriptions, Divider, Flex, Form, FormProps, Input, List, Popconfirm, Segmented, Select, Skeleton, Space } from 'antd';
import capitalize from 'antd/lib/_util/capitalize';
import { DefaultOptionType } from 'rc-select/lib/Select';
import React, { useEffect, useState } from 'react';
import { FormInputConfig } from './FormInputConfig';
import { FormItemInput } from './FormItemInput';



type ItemTypes = 'question' | 'content';

export const FormEditor:React.FC<{
	formProps:FormProps<Prisma.StudyFormUncheckedCreateInput> | FormProps<Prisma.StudyFormUncheckedUpdateInput>,
	study:Study,
	setup?:FormSetup,
	addItem?:{ type:ItemTypes },
	onChange?:( setup:FormSetup ) => void,
}> = ( {
	study, setup, addItem,
	formProps,
	...props
} ) => {

	const { data: inputPresetsData, isLoading: isLoadingInputPresets } = useList<FormInputPreset & InputPreset>( {
		resource: 'form-input-presets',
	} );

	useEffect( () => {
		if( !addItem?.type || !formProps?.form )
			return;

		const items:FormItem[] = formProps?.form?.getFieldValue( [ 'setup', 'items' ] );
		let item:FormItem;
		if( addItem.type === 'question' ){
			item = {
				type: addItem.type,
				key: 'q_' + ( items.filter( q => q.type === 'question' ).length + 1 ).toString().padStart( 2, '0' ),
				required: 'should',
				input: 'slider',
				config: {},
			} as FormQuestion;

		}else{
			item = {
				type: addItem.type,
			} as FormContent;
		}

		items.push( item );
		formProps?.form?.setFieldValue( [ 'setup', 'items' ], items );

	}, [ addItem ] );


	const staticInputTypeOptions = Object.values( FormInputType ).map( t => ( { label: capitalize( t ), value: t } as DefaultOptionType ) );
	const [ inputTypeOptions, setInputTypeOptions ] = useState( staticInputTypeOptions );

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

	const removeItem = ( index:number ) => {
		const items = formProps?.form?.getFieldValue( [ 'setup', 'items' ] ) || [];

		if( items[index].id )
			items[index]['_remove'] = !items[index]['_remove'];
		else
			items.splice( index, 1 );

		formProps?.form?.setFieldValue( [ 'setup', 'items' ], items );
	};

	return (
		<>
			{ isLoadingInputPresets ? <Skeleton active /> :
			  <Form.List name={ [ 'setup', 'items' ] }>
				  { ( fields, { add, move, remove } ) =>
					  <Space direction="vertical" size="middle" className={ 'stretch' }>
						  { fields.map( ( { key, name, ...restField } ) => {
							  const itemType = formProps?.form?.getFieldValue( [ 'setup', 'items', name, 'type' ] );
							  //						const itemType = Form.useWatch( [ 'setup', 'items', name, 'type' ] );
							  const inputType = formProps?.form?.getFieldValue( [ 'setup', 'items', name, 'input' ] );
							  const selectedPresetId = formProps?.form?.getFieldValue( [ 'setup', 'items', name, 'preset' ] );
							  const selectedPreset = selectedPresetId ? inputPresets[selectedPresetId] : undefined;

							  return <List.Item key={ key }>
								  <Flex align={ 'center' } gap={ 10 }>
									  { itemType === 'content' ? <NewspaperIcon /> : <QuizIcon /> }

									  <span>
										  { name.toString().padStart( 2, '0' ) } - { formProps?.form?.getFieldValue( [ 'setup', 'items', name, 'heading' ] ) }
									  </span>

									  <Divider style={ { flexGrow: 1, width: 'auto', minWidth: 'initial' } } />

									  <Space>
										  <Button type={ 'text' } size={ 'middle' } disabled={ name < 1 } onClick={ () => move( name, name - 1 ) }><CaretUpOutlined /></Button>
										  <Button type={ 'text' } size={ 'middle' } disabled={ name >= fields.length - 1 } onClick={ () => move( name, name + 1 ) }><CaretDownOutlined /></Button>
									  </Space>

									  <Popconfirm
										  title="Remove Item"
										  description="Are you sure you want to remove this item?"
										  onConfirm={ () => removeItem( key ) }
										  okText="Yes" cancelText="No"
									  >
										  <Button type={ 'text' } icon={ <MinusCircleOutlined /> } />
									  </Popconfirm>
								  </Flex>

								  { itemType === 'content'
									? <>
										<Descriptions size={ 'small' } bordered={ true } className={ 'label-top' } column={ 4 }>
											<Descriptions.Item key={ name + '-heading' } label={ 'Heading' } labelStyle={ { width: 170 } } span={ 4 }>
												<Form.Item name={ [ name, 'heading' ] }>
													<Input.TextArea autoSize={ true } />
												</Form.Item>
											</Descriptions.Item>

											<Descriptions.Item key={ name + '-content' } label={ 'Content' } span={ 4 }>
												<Form.Item name={ [ name, 'content', 'plain', 'data' ] }
														   rules={ [ { required: true, message: 'Content needs at least a bit of text' } ] }
												>
													<Input.TextArea rows={ 2 } autoSize={ true } placeholder={ 'optional description for the user' } />
												</Form.Item>
											</Descriptions.Item>
										</Descriptions>
									</>
									: <>
										<Descriptions size={ 'small' } bordered={ true } className={ 'label-top' } column={ 4 }>
											<Descriptions.Item key={ name + '-key' } label={ 'Key' } labelStyle={ { width: 170 } } span={ 4 }>
												<Form.Item name={ [ name, 'key' ] } className={ 'nopad' }
														   rules={ [ { required: true, message: 'A key is required for data export and association.' } ] }
												>
													<Input />
												</Form.Item>
											</Descriptions.Item>

											<Descriptions.Item key={ name + '-heading' } label={ 'Question' } span={ 4 }>
												<Form.Item name={ [ name, 'heading' ] }
														   rules={ [ { required: true, message: 'Please add the question here.' } ] }
												>
													<Input.TextArea autoSize={ true } />
												</Form.Item>
											</Descriptions.Item>

											<Descriptions.Item key={ name + '-desc' } label={ 'Description' } span={ 4 }>
												<Form.Item name={ [ name, 'description' ] }
														   rules={ [ { required: false } ] }
												>
													<Input.TextArea rows={ 2 } autoSize={ true } placeholder={ 'optional description for the user' } />
												</Form.Item>
											</Descriptions.Item>

											<Descriptions.Item key={ name + '-required' } label={ 'Necessity' } span={ 4 }>
												<Form.Item name={ [ name, 'required' ] }
														   rules={ [ { required: true, message: 'Please select whether this question must or should be answered, or is ignored when missing.' } ] }
												>
													<Segmented size={ 'small' } options={ Object.values( FormInputNecessity ).map( l => ( { label: l, value: l } ) ) } />
												</Form.Item>
											</Descriptions.Item>

											<Descriptions.Item key={ name + '-input' } span={ 4 }
															   label={
																   <Flex gap={ 'small' } align={ 'stretch' } justify={ 'flex-start' } vertical>
																	   <span>Input</span>
																	   <Form.Item name={ [ name, 'input' ] }
																				  rules={ [ { required: true } ] }
																				  style={ { marginBlockEnd: 0 } }
																	   >
																		   <Select size={ 'small' }
																				   options={ inputTypeOptions }
																		   />
																	   </Form.Item>

																	   { inputPresetsOptions[inputType]?.length &&
																		   <>
																			   <span>Preset</span>
																			   <Form.Item name={ [ name, 'preset' ] }
																						  style={ { marginBlockEnd: 0 } }
																			   >
																				   <Select size={ 'small' }
																						   options={ inputPresetsOptions[inputType] }
																						   allowClear
																						   style={ { maxWidth: 138 } }
																				   />
																			   </Form.Item>
																		   </>
																	   }

																   </Flex>
															   }
											>
												{ selectedPreset
												  ? <FormItemInput input={ inputType } config={ selectedPreset.config } />
												  : <FormInputConfig inputType={ inputType } name={ [ name, 'config' ] } configPath={ [ 'setup', 'items', name, 'config' ] } />
												}
											</Descriptions.Item>
										</Descriptions>

									</>
								  }


							  </List.Item>;
						  } )
						  }
					  </Space> }
			  </Form.List>

			}


		</>
	);
};
