import { PlusCircleOutlined } from '@ant-design/icons';
import type { FormSetup, Prisma, Study } from '@nutritious/core';
import { Button, Card, Col, Descriptions, Form, FormProps, Input, Row, Space } from 'antd';
import React, { useState } from 'react';
import { FormEditor } from './FormEditor';



export const FormFormElements:React.FC<{
	formProps:FormProps<Prisma.StudyFormUncheckedCreateInput> | FormProps<Prisma.StudyFormUncheckedUpdateInput>,
	study:Study,
	isCreate?:boolean,
}> = ( { study, isCreate, formProps } ) => {


	const [ addFormItem, setAddFormItem ] = useState<{ axolotl:number, type:'question' | 'content' } | undefined>();
	const addItem = ( type:'content' | 'question' ) => setAddFormItem( prev => ( {
		type,
		axolotl: ( prev?.axolotl ?? 0 ) + 1,
	} ) );

	const updateFormSetup = ( setup:FormSetup ) => {
		formProps?.form?.setFieldValue( 'setup', setup );
	};

	return ( <>
		<Space direction={ 'vertical' } className={ 'stretch' }>

			<Card title={ 'Form ' + ( isCreate ? 'New' : ` ( ${ formProps?.form?.getFieldValue( 'id' ) } )` ) }
				  extra={
					  <Descriptions size={ 'small' } bordered={ true }
									items={ [ { label: 'Study', children: study?.name } ] }
					  />
				  }>


				<Row gutter={ [ 50, 50 ] }>
					<Col xs={ 24 } lg={ 12 }>

						<Form.Item
							label="Name (private)" name={ [ 'name' ] }
							rules={ [ { required: true } ] }
						>
							<Input autoFocus={ isCreate } />
						</Form.Item>
						<Form.Item label="Notes (private)" name={ 'notes' }>
							<Input.TextArea
								autoSize={ true } style={ { minHeight: 50 } }
							/>
						</Form.Item>
					</Col>

					<Col xs={ 24 } lg={ 12 }>
						<Form.Item label="Title" name={ [ 'title' ] }>
							<Input />
						</Form.Item>
						<Form.Item label="Intro" name={ 'intro' }>
							<Input.TextArea
								autoSize={ true } style={ { minHeight: 50 } }
							/>
						</Form.Item>
					</Col>
				</Row>

				<Row gutter={ [ 50, 50 ] }>
					<Col xs={ 24 } lg={ 12 }>

					</Col>
					<Col xs={ 24 } lg={ 12 }>

					</Col>
				</Row>

			</Card>


			<Card title={ 'Form Data' }
				  styles={ { header: { position: 'sticky', top: 63, background: 'white', zIndex: 20, borderBlockEnd: '2px solid blue' } } }
				  extra={ <Space>
					  <Button icon={ <PlusCircleOutlined /> } onClick={ () => addItem( 'question' ) }>Question</Button>
					  <Button icon={ <PlusCircleOutlined /> } onClick={ () => addItem( 'content' ) }>Content</Button>
				  </Space> }
			>
				<Form.Item name={ 'setup' }>
					<FormEditor
						formProps={ formProps }
						setup={ formProps?.form?.getFieldValue( 'setup' ) }
						study={ study }
						addItem={ addFormItem }
						onChange={ updateFormSetup }
					/>
				</Form.Item>

			</Card>

		</Space>
	</> );
};
