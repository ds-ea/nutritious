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


import { CommonLayout } from '@components/common-layout';
import { StateSelect } from '@components/form/StateSelect';
import { Create, useForm } from '@refinedev/antd';
import { IResourceComponentsProps } from '@refinedev/core';
import { Form, Input } from 'antd';
import React from 'react';


export const PagesCreate:React.FC<IResourceComponentsProps> = () => {
	const { formProps, saveButtonProps, queryResult } = useForm();

	return (
		<CommonLayout>
			<Create saveButtonProps={ saveButtonProps }>
				<Form { ...formProps } layout="vertical">
					<StateSelect />

					<Form.Item
						label="Name"
						name={ [ 'name' ] }
						rules={ [
							{
								required: true,
							},
						] }
					>
						<Input />
					</Form.Item>
					<Form.Item
						label="Alias"
						name={ [ 'alias' ] }
						rules={ [
							{
								required: true,
							},
						] }
					>
						<Input />
					</Form.Item>
					<Form.Item
						label="Body"
						name="body"
						rules={ [
							{
								required: true,
							},
						] }
					>
						<Input.TextArea rows={ 5 } />
					</Form.Item>
				</Form>
			</Create>
		</CommonLayout>
	);
};
export default PagesCreate;
