import { toPlural } from '@refinedev/inferencer';
import { Flex, Form, InputNumber, Segmented } from 'antd';
import { FormItemProps } from 'antd/es/form/FormItem';
import { SegmentedOptions } from 'antd/lib/segmented';
import React, { useEffect, useState } from 'react';

// TODO: make more flexible and refactor GracePicker to use this (also find a better name and better form integration)
type LimitSegments = 'none' | 'zero' | 'value';
export const LimitPicker:React.FC<FormItemProps & {
	unit?:string | [ string, string ],
	direction:'up' | 'down',
	min?:number,
	max?:number,
	zeroCase?:string,
	defaultLimit?:number,
}> = ( { name, unit, direction, zeroCase, defaultLimit, ...props } ) => {
	const form = Form.useFormInstance();

	const min = props.min ?? 1;
	const max = props.max ?? undefined;

	const unitLabel:[ string, string ] | undefined = unit ? ( Array.isArray( unit ) ? unit : [ unit, toPlural( unit ) ] ) : undefined;

	const [ limitingBehavior, setLimitingBehavior ] = useState<LimitSegments>();
	const value = Form.useWatch( name );

	useEffect( () => {
		if( value == null )
			setLimitingBehavior( 'none' );
		else if( value === 0 )
			setLimitingBehavior( 'zero' );
		else if( value > 0 )
			setLimitingBehavior( 'value' );

	}, [ value ] );

	const selectSegment = ( limit:LimitSegments ) => {
		setLimitingBehavior( limit );
		if( limit === 'none' )
			form.setFieldValue( name, undefined );
		else if( limit === 'zero' )
			form.setFieldValue( name, 0 );
		else if( limit === 'value' )
			form.setFieldValue( name, value ?? defaultLimit ?? min ?? 1 );

	};

	const segmentedOptions = [
		{ label: 'unrestricted', value: 'none' },
		zeroCase ? { label: zeroCase, value: 'zero' } : undefined,
		{ label: 'limit to', value: 'value' },
	].filter( opt => !!opt ) as SegmentedOptions<LimitSegments>;

	return <Flex vertical align={ 'flex-start' } gap={ 12 }>
		<Segmented
			value={ limitingBehavior }
			options={ segmentedOptions }
			onChange={ selectSegment }
		/>

		<Form.Item name={ name } hidden={ limitingBehavior !== 'value' }>
			<InputNumber
				min={ limitingBehavior === 'value' ? min : undefined }
				max={ limitingBehavior === 'value' ? max : undefined }
				addonBefore={ direction === 'up' ? 'at least' : 'not more than' }
				addonAfter={ !unitLabel ? undefined : value === 1 ? unitLabel[0] : unitLabel[1] }
			/>
		</Form.Item>
	</Flex>
		;
};
