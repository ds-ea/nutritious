import { MinusCircleOutlined } from '@ant-design/icons';
import { FormInputConfig } from '@components/forms/FormInputConfig';
import { FormContent, FormInputNecessity, FormInputType, FormItem, FormQuestion, FormSetup, Prisma, Study } from '@nutritious/core';
import { Button, Descriptions, Flex, Form, FormProps, Input, List, Segmented, Select, Space } from 'antd';
import { DefaultOptionType } from 'rc-select/lib/Select';
import React, { useEffect } from 'react';


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


	return (
		<>
			<Form.List name={ [ 'setup', 'items' ] }>
				{ ( fields, { add, move, remove } ) =>
					<Space direction="vertical" size="middle" className={ 'stretch' }>
						{ fields.map( ( { key, name, ...restField } ) =>
							<List.Item key={ key }>
								{ formProps?.form?.getFieldValue( [ 'setup', 'items', name, 'type' ] ) === 'content'
								  ? <>
									  <Descriptions bordered={ true } className={ 'label-top' } column={ 4 }>
										  <Descriptions.Item key={ name + '-title' } label={ 'Title' } labelStyle={ { width: 170 } } span={ 4 }>
											  <Form.Item name={ [ name, 'title' ] }>
												  <Input.TextArea autoSize={ true } />
											  </Form.Item>
										  </Descriptions.Item>

										  <Descriptions.Item key={ name + '-content' } label={ 'Content' } span={ 4 }>
											  <Form.Item name={ [ name, 'content', 'plain' ] }
														 rules={ [ { required: true, message: 'Content needs at least a bit of text' } ] }
											  >
												  <Input.TextArea rows={ 2 } autoSize={ true } placeholder={ 'optional description for the user' } />
											  </Form.Item>
										  </Descriptions.Item>
									  </Descriptions>
								  </>
								  : <>
									  <Descriptions bordered={ true } className={ 'label-top' } column={ 4 }>
										  <Descriptions.Item key={ name + '-key' } label={ 'Key' } labelStyle={ { width: 170 } } span={ 4 }>
											  <Flex gap={ 'middle' } justify={ 'space-between' } align={ 'center' }>
												  <Form.Item name={ [ name, 'key' ] } className={ 'nopad' }
															 rules={ [ { required: true, message: 'A key is required for data export and association.' } ] }
												  >
													  <Input />
												  </Form.Item>

												  <Button type={ 'text' } icon={ <MinusCircleOutlined /> } />
											  </Flex>
										  </Descriptions.Item>

										  <Descriptions.Item key={ name + '-label' } label={ 'Question' } span={ 4 }>
											  <Form.Item name={ [ name, 'label' ] }
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
																 <Flex gap={ 'small' } align={ 'center' } justify={ 'space-between' }>
																	 <span>Input</span>
																	 <Form.Item name={ [ name, 'input' ] }
																				rules={ [ { required: true } ] }
																				style={ { marginBlockEnd: 0 } }
																	 >
																		 <Select size={ 'small' } options={ Object.values( FormInputType ).map( t => ( { label: t, value: t } as DefaultOptionType ) ) } />
																	 </Form.Item>
																 </Flex>
															 }
										  >
											  <FormInputConfig formProps={ formProps } name={ name } />
										  </Descriptions.Item>
									  </Descriptions>

								  </>
								}


							</List.Item> )
						}
					</Space> }
			</Form.List>

		</>
	);
};
