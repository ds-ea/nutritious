import { StateSelect } from '@components/form/StateSelect';
import { TimeFrame } from '@components/form/TimeFrame';
import type { Study } from '@nutritious/core';
import { TextField } from '@refinedev/antd';
import { Col, Divider, Form, Input, Row, Space, Typography } from 'antd';
import React from 'react';


export const GroupEditElements:React.FC<{ study:Study, isCreate?:boolean }> = ( { study, isCreate } ) => {

	return (
		<>
			<Typography.Title level={ 5 }>Study</Typography.Title>
			<TextField value={ study?.name } />

			{ isCreate ? undefined : (
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
			) }


			<StateSelect />

			<Row gutter={ [ 50, 50 ] }>
				<Col xs={ 24 } lg={ 12 }>
					<Form.Item
						label="Name" name={ [ 'name' ] }
						rules={ [ { required: true } ] }
					>
						<Input autoFocus={ !!isCreate } />
					</Form.Item>
				</Col>
				<Col xs={ 24 } lg={ 12 }>
					<Form.Item label="Notes (private)"
							   name={ 'notes' }
					>
						<Input.TextArea
							autoSize={ true } style={ { minHeight: 50 } }
						/>
					</Form.Item>
				</Col>
			</Row>

			<Divider />

			<Typography.Title level={ 2 }>Signup</Typography.Title>
			<Row gutter={ [ 50, 50 ] }>
				<Col xs={ 24 } lg={ 12 }>

					<Form.Item
						label="Registration Key" name={ [ 'regKey' ] }
						rules={ [ { required: true } ] }
					>
						<Input />
					</Form.Item>

					<Form.Item
						label="Registration Password" name={ [ 'regPass' ] }
						rules={ [ { required: true } ] }
					>
						<Input />
					</Form.Item>

					<Form.Item label="Registration Instructions"
							   name={ 'instructions' }
					>
						<Input.TextArea
							autoSize={ true }
							allowClear={ true }
							style={ { minHeight: 80 } }
							placeholder={ 'Shown to the user before signup (after scanning the QR code)' }
						/>
					</Form.Item>

				</Col>


				<Col xs={ 24 } lg={ 12 }>
					<Space.Compact>
						<Form.Item label="Registration Limit"
								   name={ [ 'regLimit' ] }
						>
							<Input type={ 'number' }
								   addonAfter={ 'participants' }
								   placeholder={ 'unlimited' }
								   min={ 1 }
								   allowClear={ true }
							/>
						</Form.Item>
					</Space.Compact>

					<Form.Item label="Study Signup Override">
						<Space direction="vertical">
							<div className={ 'note' }>These override the study's settings when used</div>
							<TimeFrame name={ 'signupPeriod' } />
						</Space>
					</Form.Item>

					<Form.Item label="Study Response Override">
						<Space direction="vertical">
							<div className={ 'note' }>These override the study's settings when used</div>
							<TimeFrame name={ 'responsePeriod' } />
						</Space>
					</Form.Item>
				</Col>
			</Row>
		</>
	);
};
