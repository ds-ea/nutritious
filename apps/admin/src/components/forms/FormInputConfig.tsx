import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { FormInputConfiguration, FormInputType } from '@nutritious/core';
import { Alert, Button, Card, Flex, Form, FormListFieldData, Input, List, Popconfirm, Radio, Segmented, Space } from 'antd';
import React from 'react';


export type FormInputConfigProps<T = FormInputConfiguration> = {
	inputType:FormInputType | string,

	/** MUST be the relative NamePath to the config object */
	name:string | number | ( string | number )[]
	/** MUST be the absolute NamePath to the config object */
	configPath:string | number | ( string | number )[]
	//	formProps:FormProps<Prisma.StudyFormUncheckedCreateInput> | FormProps<Prisma.StudyFormUncheckedUpdateInput>,
	//	name:number | string,
};

export const FormInputConfig:React.FC<FormInputConfigProps> = ( { inputType, ...props } ) => {

	const name = Array.isArray( props.name ) ? props.name : [ props.name ];
	const configPath = Array.isArray( props.configPath ) ? props.configPath : [ props.configPath ];

	const form = Form.useFormInstance();
	const inputConfig:Record<string, unknown> = Form.useWatch( configPath, form );
	//	const inputType:FormInputType = Form.useWatch( [ 'setup', 'items', name, 'input' ], formProps.form );
	//	const config = Form.useWatch( [ 'setup', 'items', itemName, 'config' ], formProps.form );


	const addOption = () => {
		const options = form.getFieldValue( [ ...configPath, 'options' ] ) || [];
		options.push( { value: '', label: '' } );
		form.setFieldValue( [ ...configPath, 'options' ], options );
	};

	const removeOption = ( index:number ) => {
		const options = form.getFieldValue( [ ...configPath, 'options' ] ) || [];

		if( options[index].id )
			options[index]['_remove'] = !options[index]['_remove'];
		else
			options.splice( index, 1 );

		form.setFieldValue( [ ...configPath, 'options' ], options );
	};


	const renderOptions = ( fields:FormListFieldData[] ) =>
		<Card title="Options"
			  extra={
				  <Button type={ 'primary' }
						  icon={ <PlusCircleOutlined /> }
						  onClick={ addOption }
				  >{ 'add option' }</Button>
			  }
		>
			<Space direction="vertical" size="middle" className={ 'stretch' }>
				<Flex gap={ 'middle' }>
					<div className="ant-form-item-label" style={ { width: 140 } }>
						<label className="ant-form-item-required">Value</label>
					</div>
					<div className="ant-form-item-label" style={ { flexGrow: 1 } }>
						<label className="ant-form-item-required">Label</label>
					</div>
				</Flex>
			</Space>
			<Space direction="vertical" size="middle" className={ 'stretch' }>
				{ fields.map( ( { key, name: optionFieldName, ...restField } ) =>
					<List.Item key={ key }>
						<Flex gap={ 'middle' }>
							<Form.Item name={ [ optionFieldName, 'value' ] } rules={ [ { required: true, message: 'Value needed' } ] }>
								<Input placeholder={ '' } allowClear style={ { width: 140 } } />
							</Form.Item>

							<Form.Item name={ [ optionFieldName, 'label' ] }
									   rules={ [ { required: true, message: 'Label required' } ] }
									   style={ { flexGrow: 1 } }
							>
								<Input placeholder={ '' } allowClear />
							</Form.Item>

							<div>
								<Popconfirm
									title="Remove Option"
									description="Are you sure you want to remove this option?"
									onConfirm={ () => removeOption( key ) }
									okText="Yes"
									cancelText="No"
								>
									<Button type={ 'text' } icon={ <MinusCircleOutlined /> }></Button>
								</Popconfirm>
							</div>
						</Flex>
					</List.Item>,
				) }
			</Space>
		</Card>;

	return (
		<Space direction={ 'vertical' } size={ 20 } className={ 'stretch' }>

			{ inputType === 'slider' && ( <>
				<Space>
					<Form.Item name={ [ ...name, 'min' ] } label={ 'Min Value' }>
						<Input type={ 'number' } placeholder={ 'no minimum' } allowClear style={ { width: 140 } } />
					</Form.Item>
					<Form.Item name={ [ ...name, 'labelMin' ] } label={ 'Min Label' }>
						<Input placeholder={ 'no label' } allowClear />
					</Form.Item>
				</Space>
				<Space>
					<Form.Item name={ [ ...name, 'max' ] } label={ 'Max Value' }>
						<Input type={ 'number' } placeholder={ 'no maximum' } allowClear style={ { width: 140 } } />
					</Form.Item>

					<Form.Item name={ [ ...name, 'labelMax' ] } label={ 'Max Label' }>
						<Input.TextArea autoSize={ true } placeholder={ 'no label' } allowClear />
					</Form.Item>
				</Space>
				<Space>
					<Form.Item name={ [ ...name, 'step' ] } label={ 'Step Size' }>
						<Input type={ 'number' } placeholder={ '1' } allowClear style={ { width: 140 } } />
					</Form.Item>
				</Space>
			</> ) }

			{ inputType === 'number' && ( <>
				<Space>
					<Form.Item name={ [ ...name, 'min' ] } label={ 'Min Value' }>
						<Input type={ 'number' } placeholder={ 'no minimum' } allowClear style={ { width: 140 } } />
					</Form.Item>
					<Form.Item name={ [ ...name, 'max' ] } label={ 'Max Value' }>
						<Input type={ 'number' } placeholder={ 'no maximum' } allowClear style={ { width: 140 } } />
					</Form.Item>
				</Space>
				<Space>
					<Form.Item name={ [ ...name, 'prefix' ] } label={ 'prefix' }>
						<Input placeholder={ 'no prefix' } allowClear />
					</Form.Item>
					<Form.Item name={ [ ...name, 'suffix' ] } label={ 'Suffix' }>
						<Input placeholder={ 'no suffix' } allowClear />
					</Form.Item>
				</Space>
			</> ) }

			{ inputType === 'text' && ( <>
				<Space>
					<Form.Item name={ [ ...name, 'minLength' ] } label={ 'Min Length' }>
						<Input type={ 'number' } placeholder={ 'no minimum' } allowClear style={ { width: 140 } } />
					</Form.Item>
					<Form.Item name={ [ ...name, 'maxLength' ] } label={ 'Max Length' }>
						<Input type={ 'number' } placeholder={ 'no maximum' } allowClear style={ { width: 140 } } />
					</Form.Item>
				</Space>
				<Form.Item name={ [ ...name, 'variant' ] } label={ 'Variant' }>
					<Radio.Group>
						<Space direction="vertical">
							<Radio value={ 'string' }>one line</Radio>
							<Radio value={ 'text' }>multiple lines</Radio>
						</Space>
					</Radio.Group>
				</Form.Item>
			</> ) }

			{ inputType === 'binary' && ( <>
				<Space>
					<Form.Item name={ [ ...name, 'labelOff' ] } label={ 'Neg. Label' }>
						<Input placeholder={ 'no' } allowClear style={ { width: 140 } } />
					</Form.Item>
					<Form.Item name={ [ ...name, 'labelOn' ] } label={ 'Pos. Label' }>
						<Input placeholder={ 'yes' } allowClear style={ { width: 140 } } />
					</Form.Item>
				</Space>
			</> ) }

			{ inputType === 'choices' && ( <Space direction={ 'vertical' } style={ { width: '100%' } }>
				<Form.Item name={ [ ...name, 'limit' ] } label={ 'Number of Choices' }>
					<Input type={ 'number' } placeholder={ 'no limit' } allowClear style={ { width: 140 } } min={ 0 } />
				</Form.Item>
				<Form.List name={ [ ...name, 'options' ] }>
					{ renderOptions }
				</Form.List>
			</Space> ) }

			{ inputType === 'rating' && ( <Space direction={ 'vertical' } style={ { width: '100%' } }>
				<Form.Item name={ [ ...name, 'behavior' ] } label={ 'Behavior' }>
					<Segmented options={ [
						{ label: 'Stepped Buttons', value: 'stepped' },
						{ label: 'Linear Slider', value: 'linear' },
						{ label: 'Star Rating', value: 'stars' },
					] } />
				</Form.Item>

				{ ( !inputConfig?.behavior || inputConfig?.behavior === 'stepped' ) &&
					<Form.List name={ [ ...name, 'options' ] }>
						{ renderOptions }
					</Form.List>
				}
				{ inputConfig?.behavior === 'linear' &&
					<Space direction={ 'vertical' } style={ { width: '100%' } }>
						<Space>
							<Form.Item name={ [ ...name, 'min' ] } label={ 'Min Value' }>
								<Input type={ 'number' } placeholder={ 'no minimum' } allowClear style={ { width: 140 } } />
							</Form.Item>
							<Form.Item name={ [ ...name, 'labelMin' ] } label={ 'Min Label' }>
								<Input placeholder={ 'no label' } allowClear />
							</Form.Item>
						</Space>
						<Space>
							<Form.Item name={ [ ...name, 'max' ] } label={ 'Max Value' }>
								<Input type={ 'number' } placeholder={ 'no maximum' } allowClear style={ { width: 140 } } />
							</Form.Item>

							<Form.Item name={ [ ...name, 'labelMax' ] } label={ 'Max Label' }>
								<Input.TextArea autoSize={ true } placeholder={ 'no label' } allowClear />
							</Form.Item>
						</Space>
						<Space>
							<Form.Item name={ [ ...name, 'step' ] } label={ 'Step Size' }>
								<Input type={ 'number' } placeholder={ '1' } allowClear style={ { width: 140 } } />
							</Form.Item>
						</Space>
						<Alert message="Currently this is functionally identical to using the slider" type="info" showIcon />
					</Space>
				}
			</Space> ) }

		</Space>
	);
};
