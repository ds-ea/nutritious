import type { Prisma, Study } from '@nutritious/core';
import MDEditor from '@uiw/react-md-editor';
import { Card, Col, Descriptions, Form, FormProps, Input, Row, Space } from 'antd';
import React from 'react';



export const ContentFormElements:React.FC<{
	formProps:FormProps<Prisma.StudyContentUncheckedCreateInput> | FormProps<Prisma.StudyContentUncheckedUpdateInput>,
	study:Study,
	isCreate?:boolean,
}> = ( { study, isCreate, formProps } ) => {

	return ( <>
		<Space direction={ 'vertical' } className={ 'stretch' }>

			<Card title={ 'Content ' + ( isCreate ? 'New' : ` ( ${ formProps?.form?.getFieldValue( 'id' ) } )` ) }
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

					</Col>

					<Col xs={ 24 } lg={ 12 }>
						<Form.Item label="Notes (private)" name={ 'notes' }>
							<Input.TextArea
								autoSize={ true } style={ { minHeight: 50 } }
							/>
						</Form.Item>

					</Col>
				</Row>

				<Row>
					<Col xs={ 24 }>
						<Form.Item label="Title" name={ [ 'title' ] }>
							<Input />
						</Form.Item>
					</Col>
					<Col xs={ 24 }>
						<Form.Item label="Content" name={ [ 'content', 'md', 'data' ] }>
							<MDEditor data-color-mode="light" height="100%" />
						</Form.Item>
					</Col>
				</Row>

			</Card>
		</Space>
	</> );
};
