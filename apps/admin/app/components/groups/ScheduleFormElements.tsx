import { ClockCircleOutlined } from '@ant-design/icons';
import { WeekdayPicker } from '@components/form/WeekdayPicker';
import type { Study } from '@nutritious/core';
import { TextField } from '@refinedev/antd';
import { Card, Col, Divider, Form, FormProps, Input, Row, Select, Space, Typography } from 'antd';
import { DefaultOptionType } from 'rc-select/lib/Select';
import React from 'react';


export const ScheduleFormElements:React.FC<{ formProps:FormProps, study:Study, isCreate?:boolean }> = ( { study, isCreate, formProps } ) => {

	const startOfWeek = formProps?.form?.getFieldValue( [ 'weekSetup', 'startOfWeek' ] );

	const dayHoursOptions:DefaultOptionType[] = Array.from(
		{ length: 24 },
		( v, h ) => ( {
			label: h.toString().padStart( 2, '0' ) + ':00',
			value: h * 60,
		} ),
	);

	const graceOptions:DefaultOptionType[] = [
		{ label: 'no grace period', value: 0 },
		...Array.from(
			{ length: 48 },
			( v, h ) => ( {
				label: `${ h + 1 } hour${ h ? 's' : '' }`,
				value: ( h + 1 ) * 60,
			} ),
		),
	];

	return (
		<Space direction={ 'vertical' } className={ 'stretch' }>

			<Card title={ 'Schedule' }>
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
			</Card>

			<Card title={ 'Week' }>
				<Space direction={ 'vertical' }>

					<Space align={ 'start' }>

						<Form.Item
							label="Week Starts on" name={ [ 'weekSetup', 'startOfWeek' ] }
							rules={ [ { required: true } ] }
						>
							<Select options={ [ { label: 'Sunday', value: 0 }, { label: 'Monday', value: 1 } ] } />
						</Form.Item>

						<Divider type={ 'vertical' } />


						<Form.List name="daySetup">
							{ ( fields, { add, remove } ) => (
								<>
									{ fields.map( ( { key, name, ...restField } ) => (
										<Space key={ key } style={ { display: 'flex', marginBottom: 8 } } align="baseline">

											<Form.Item { ...restField }
													   label={ 'On days:' }
													   name={ [ name, 'days' ] }
													   rules={ [ { required: true } ] }
											>
												<WeekdayPicker startOfWeek={ startOfWeek } readOnly />
											</Form.Item>

											<Form.Item
												{ ...restField }
												label={ 'Day begins' }
												name={ [ name, 'start' ] }
											>
												<Select
													options={ dayHoursOptions }
													allowClear={ true }
													placeholder={ 'at midnight' }
													suffixIcon={ <ClockCircleOutlined /> }
												/>
											</Form.Item>

											<Form.Item
												{ ...restField }
												label={ 'Day ends' }
												name={ [ name, 'end' ] }
											>
												<Select options={ dayHoursOptions } allowClear={ true } placeholder={ 'at midnight' } />
											</Form.Item>

											<Form.Item
												{ ...restField }
												label={ 'Response grace period' }
												name={ [ name, 'grace' ] }
											>
												<Select options={ graceOptions } allowClear={ true } placeholder={ 'no limit (forever)' } />
											</Form.Item>

											{/*<MinusCircleOutlined onClick={ () => remove( name ) } />*/ }
										</Space>
									) ) }

									{/*<Form.Item>
										<Button type="dashed" onClick={ () => add() } block icon={ <PlusOutlined /> }>
											Add field
										</Button>
									</Form.Item>*/ }
								</>
							) }
						</Form.List>
					</Space>

				</Space>

				<Row gutter={ [ 50, 50 ] }>
					<Col xs={ 24 } lg={ 12 }>

					</Col>

					<Col xs={ 24 } lg={ 12 }>

					</Col>
				</Row>
			</Card>

			<Card title={ 'Schedule' }>

			</Card>

		</Space>
	);
};
