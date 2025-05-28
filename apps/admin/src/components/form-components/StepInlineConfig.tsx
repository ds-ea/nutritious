import { Step, StudyStepType } from '@nutritious/core';
import { Form, Select, Space } from 'antd';
import { FormItemProps } from 'antd/es/form/FormItem';
import React from 'react';



export const StepInlineConfig:React.FC<FormItemProps & {
	type:Step['type'],
	name:string | number | ( string | number )[],

	value?:string,
	onChange?:() => void,
}> = ( { name, ...props } ) => {

	if( props.type === StudyStepType.BlsFood )
		return <Space direction={ 'vertical' } className={ 'stretch' }>

			<Form.Item name={ [ ...name, 'mealSelect' ] }>
				<Select
					allowClear
					value={ props.value } onChange={ props.onChange }
					placeholder={ 'allow meal selection (ignore slot)' }
					options={ [
						{ label: 'allow meal selection + slot', value: 'allow' },
						{ label: 'ignore slot', value: 'noslot' },
						{ label: 'use slot\'s key', value: 'slot' },
					] } />
			</Form.Item>
			<Form.Item name={ [ ...name, 'lockDate' ] } label={ 'Date selection' }>
				<Select
					allowClear
					value={ props.value } onChange={ props.onChange }
					placeholder={ 'allowed' }
					options={ [
						{ label: 'allow full date and time selection', value: 'allow' },
						{ label: 'select date only', value: 'date' },
						{ label: 'select time only', value: 'time' },
						{ label: 'locked', value: 'locked' },
					] } />
			</Form.Item>

		</Space>;


};

