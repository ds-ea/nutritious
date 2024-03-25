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


import type { Prisma } from '@nutritious/core';
import { Edit, useForm } from '@refinedev/antd';
import { IResourceComponentsProps } from '@refinedev/core';
import { Form, Input, Switch } from 'antd';
import React from 'react';
import { StateSelect } from '../../../src/components/form/StateSelect';


export const PageEdit:React.FC<IResourceComponentsProps> = () => {
	const {
		formProps,
		saveButtonProps,
		queryResult, onFinish,
	} = useForm( {
		//		meta: { operation: 'users' },
	} );

	const pagesData = queryResult?.data?.data as Prisma.PageCreateInput;
	//	if( pagesData?.['nav']?.length )
	//		pagesData['nav'] = true;

	const handleOnFinish = ( values:Record<string, unknown> ) => {
		onFinish( {
			...values,
			nav: values?.['nav'] === true ? 'main' : null,
		} );
	};

	return (
		<Edit saveButtonProps={ saveButtonProps }>
			<Form { ...formProps } onFinish={ handleOnFinish } layout="vertical">
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
					label="Menu"
					name={ [ 'nav' ] }
				>
					<Switch />
				</Form.Item>
				<Form.Item
					label="Body"
					name={ [ 'body' ] }
					rules={ [
						{
							required: true,
						},
					] }
				>
					<Input.TextArea autoSize={ true } />
				</Form.Item>
			</Form>
		</Edit>
	);
};
export default PageEdit;
