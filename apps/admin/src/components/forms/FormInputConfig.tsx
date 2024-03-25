import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import type { FormInputConfiguration, Prisma } from '@nutritious/core';
import { Button, Card, Flex, Form, FormProps, Input, List, Popconfirm, Radio, Space } from 'antd';
import React from 'react';


export type FormInputConfigProps<T = FormInputConfiguration> = {
	formProps:FormProps<Prisma.StudyFormUncheckedCreateInput> | FormProps<Prisma.StudyFormUncheckedUpdateInput>,
	name:number | string,
};

export const FormInputConfig:React.FC<FormInputConfigProps> = ( { formProps, name } ) => {

	const inputType = Form.useWatch( [ 'setup', 'items', name, 'input' ], formProps.form );
	//	const config = Form.useWatch( [ 'setup', 'items', itemName, 'config' ], formProps.form );


	const addOption = () => {
		const options = formProps?.form?.getFieldValue( [ 'setup', 'items', name, 'config', 'options' ] ) || [];
		options.push( {
			config: { options: [ { label: '', value: '' } ] },
		} );
		formProps?.form?.setFieldValue( [ 'setup', 'items', name, 'config', 'options' ], options );
	};

	const removeOption = ( index:number ) => {
		const options = formProps?.form?.getFieldValue( [ 'setup', 'items', name, 'config', 'options' ] ) || [];

		if( options[index].id )
			options[index]['_remove'] = !options[index]['_remove'];
		else
			options.splice( index, 1 );

		formProps?.form?.setFieldValue( [ 'setup', 'items', name, 'config', 'options' ], options );
	};

	return (
		<Space direction={ 'vertical' } size={ 20 } className={ 'stretch' }>

			{ inputType === 'slider' && ( <>
				<Space>
					<Form.Item name={ [ name, 'config', 'min' ] } label={ 'Min Value' }>
						<Input type={ 'number' } placeholder={ 'no minimum' } allowClear style={ { width: 140 } } />
					</Form.Item>
					<Form.Item name={ [ name, 'config', 'labelMin' ] } label={ 'Min Label' }>
						<Input placeholder={ 'no label' } allowClear />
					</Form.Item>
				</Space>
				<Space>
					<Form.Item name={ [ name, 'config', 'max' ] } label={ 'Max Value' }>
						<Input type={ 'number' } placeholder={ 'no maximum' } allowClear style={ { width: 140 } } />
					</Form.Item>

					<Form.Item name={ [ name, 'config', 'labelMax' ] } label={ 'Max Label' }>
						<Input.TextArea autoSize={ true } placeholder={ 'no label' } allowClear />
					</Form.Item>
				</Space>
				<Space>
					<Form.Item name={ [ name, 'config', 'step' ] } label={ 'Step Size' }>
						<Input type={ 'number' } placeholder={ '1' } allowClear style={ { width: 140 } } />
					</Form.Item>
				</Space>
			</> ) }

			{ inputType === 'number' && ( <>
				<Space>
					<Form.Item name={ [ name, 'config', 'min' ] } label={ 'Min Value' }>
						<Input type={ 'number' } placeholder={ 'no minimum' } allowClear style={ { width: 140 } } />
					</Form.Item>
					<Form.Item name={ [ name, 'config', 'max' ] } label={ 'Max Value' }>
						<Input type={ 'number' } placeholder={ 'no maximum' } allowClear style={ { width: 140 } } />
					</Form.Item>
				</Space>
				<Space>
					<Form.Item name={ [ name, 'config', 'prefix' ] } label={ 'prefix' }>
						<Input placeholder={ 'no prefix' } allowClear />
					</Form.Item>
					<Form.Item name={ [ name, 'config', 'suffix' ] } label={ 'Suffix' }>
						<Input placeholder={ 'no suffix' } allowClear />
					</Form.Item>
				</Space>
			</> ) }

			{ inputType === 'text' && ( <>
				<Space>
					<Form.Item name={ [ name, 'config', 'minLength' ] } label={ 'Min Length' }>
						<Input type={ 'number' } placeholder={ 'no minimum' } allowClear style={ { width: 140 } } />
					</Form.Item>
					<Form.Item name={ [ name, 'config', 'maxLength' ] } label={ 'Max Length' }>
						<Input type={ 'number' } placeholder={ 'no maximum' } allowClear style={ { width: 140 } } />
					</Form.Item>
				</Space>
				<Form.Item name={ [ name, 'config', 'variant' ] } label={ 'Variant' }>
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
					<Form.Item name={ [ name, 'config', 'labelOff' ] } label={ 'Neg. Label' }>
						<Input placeholder={ 'no' } allowClear style={ { width: 140 } } />
					</Form.Item>
					<Form.Item name={ [ name, 'config', 'labelOn' ] } label={ 'Pos. Label' }>
						<Input placeholder={ 'yes' } allowClear style={ { width: 140 } } />
					</Form.Item>
				</Space>
			</> ) }

			{ inputType === 'choices' && ( <>
				<Form.Item name={ [ name, 'config', 'limit' ] } label={ 'Number of Choices' }>
					<Input type={ 'number' } placeholder={ 'no limit' } allowClear style={ { width: 140 } } />
				</Form.Item>
				<Form.List name={ [ name, 'config', 'options' ] }>
					{ ( fields, { add, move, remove } ) =>
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
								{ fields.map( ( { key, name, ...restField } ) =>
									<List.Item key={ key }>
										<Flex gap={ 'middle' }>
											<Form.Item name={ [ name, 'value' ] } rules={ [ { required: true, message: 'Value needed' } ] }>
												<Input placeholder={ '' } allowClear style={ { width: 140 } } />
											</Form.Item>

											<Form.Item name={ [ name, 'label' ] }
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
						</Card>
					}
				</Form.List>
			</> ) }

		</Space>
	);
};
