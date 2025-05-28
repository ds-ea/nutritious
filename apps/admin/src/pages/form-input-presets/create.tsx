/*
import { AntdInferencer } from '@refinedev/inferencer/antd';


export default function PagesCreate(){
	return <AntdInferencer
		action="create"
		resource="pages"
		meta={ {
			pages: {},
		} }
	/>;
}
*/


import { FormInputType } from '@nutritious/core';
import { Create, useForm } from '@refinedev/antd';
import { IResourceComponentsProps } from '@refinedev/core';
import { Card, Col, Empty, Form, Input, Row, Select, Space } from 'antd';
import capitalize from 'antd/lib/_util/capitalize';
import { DefaultOptionType } from 'rc-select/lib/Select';
import React, { useState } from 'react';
import { FormInputConfig } from '../../components/forms/FormInputConfig';


export const FormInputPresetsCreate:React.FC<IResourceComponentsProps> = () => {
	const { form, formProps, saveButtonProps, queryResult } = useForm();

	const staticInputTypeOptions = Object.values( FormInputType ).map( t => ( { label: capitalize( t ), value: t } as DefaultOptionType ) );
	const [ inputTypeOptions, setInputTypeOptions ] = useState( staticInputTypeOptions );

	const inputType = Form.useWatch( 'inputType', form );

	return (
		<Create saveButtonProps={ saveButtonProps }
				contentProps={ { className: 'card-transparent' } }
		>
			<Form { ...formProps } layout="vertical">
				{/*<StateSelect />*/ }


				<Space direction={ 'vertical' } className={ 'stretch' }>

					<Card>

						<Row gutter={ [ 50, 50 ] }>
							<Col xs={ 24 } lg={ 12 }>

								<Form.Item
									label="Name" name={ [ 'name' ] }
									rules={ [ { required: true } ] }
								>
									<Input autoFocus />
								</Form.Item>

								<Form.Item
									name={ 'inputType' }
									label={ 'Input Type' }
									rules={ [ { required: true } ] }
								>
									<Select options={ inputTypeOptions } />
								</Form.Item>
							</Col>
							<Col xs={ 24 } lg={ 12 }>
								<Form.Item label="Notes" name={ 'notes' }>
									<Input.TextArea
										autoSize={ true } style={ { minHeight: 80 } }
									/>
								</Form.Item>
							</Col>
						</Row>

					</Card>

					<Card title={ 'Input Configuration' }>
						{ !inputType ? <Empty description={ 'No input type selected' } image={ Empty.PRESENTED_IMAGE_SIMPLE } /> :
						  <FormInputConfig inputType={ inputType } name={ [ 'config' ] } configPath={ [ 'config' ] } />
						}
					</Card>
				</Space>

			</Form>
		</Create>
	);
};
export default FormInputPresetsCreate;
