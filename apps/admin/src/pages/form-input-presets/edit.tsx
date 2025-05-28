/*
import { AntdEditInferencer } from '@refinedev/inferencer/antd';


export default function PagesEdit(){
	return <AntdEditInferencer meta={ {
		pages: {
			getOne: {
				//				fields: [ 'id', 'name', 'email', 'settings' ],
				operation: 'users',
			},
		},
	} } />;
}
*/


import { FormInputType } from '@nutritious/core';
import { Edit, useForm } from '@refinedev/antd';
import { IResourceComponentsProps } from '@refinedev/core';
import { Alert, Card, Col, Form, Input, Row, Select, Space } from 'antd';
import capitalize from 'antd/lib/_util/capitalize';
import { DefaultOptionType } from 'rc-select/lib/Select';
import React, { useState } from 'react';
import { FormInputConfig } from '../../components/forms/FormInputConfig';


export const FormInputPresetsEdit:React.FC<IResourceComponentsProps> = () => {
	const {
		form, formProps, saveButtonProps, queryResult, onFinish,
	} = useForm( {
		redirect: 'edit',
	} );

	const staticInputTypeOptions = Object.values( FormInputType ).map( t => ( { label: capitalize( t ), value: t } as DefaultOptionType ) );
	const [ inputTypeOptions, setInputTypeOptions ] = useState( staticInputTypeOptions );

	const inputType = Form.useWatch( 'inputType', form );

	return (
		<Edit saveButtonProps={ saveButtonProps }
			  contentProps={ { className: 'card-transparent' } }
		>
			<Form { ...formProps } layout="vertical">

				<Space direction={ 'vertical' } className={ 'stretch' }>
					<Alert message="Attention!"
						   description={ <>
							   <p>
								   Updating this preset will result in all forms being affected. This can lead to inconsistent response data.
								   <br />
								   <strong>Only change this preset if you're sure nothing will break or destroy studies' results.</strong>
							   </p>
						   </> }
						   type="warning" showIcon
					/>

					<Card>
						<Form.Item
							label="Id"
							name={ [ 'id' ] }
							rules={ [
								{
									required: true,
								},
							] }
						>
							<Input readOnly disabled />
						</Form.Item>


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
						<FormInputConfig inputType={ inputType } name={ [ 'config' ] } configPath={ [ 'config' ] } />
					</Card>

				</Space>

			</Form>
		</Edit>
	);
};
export default FormInputPresetsEdit;
