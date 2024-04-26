import { Flex, Form, InputNumber, Segmented } from 'antd';
import { FormItemProps } from 'antd/es/form/FormItem';
import React, { useEffect, useState } from 'react';


type GraceLimitingBehaviors = 'none' | 'exact' | 'time';
export const GracePicker:React.FC<FormItemProps & { graceType:'before' | 'after' }> = ( { name, graceType } ) => {
	const form = Form.useFormInstance();

	const [ limitingBehavior, setLimitingBehavior ] = useState<GraceLimitingBehaviors>();
	const value = Form.useWatch( name );

	useEffect( () => {
		if( value == null )
			setLimitingBehavior( 'none' );
		else if( value === 0 )
			setLimitingBehavior( 'exact' );
		else if( value > 0 )
			setLimitingBehavior( 'time' );

	}, [ value ] );

	const updateLimitingBehavior = ( limit:GraceLimitingBehaviors ) => {
		setLimitingBehavior( limit );
		if( limit === 'none' )
			form.setFieldValue( name, undefined );
		else if( limit === 'exact' )
			form.setFieldValue( name, 0 );
		else if( limit === 'time' )
			form.setFieldValue( name, 60 );

	};

	return <Form.Item label={ graceType }>
		<Flex vertical align={ 'flex-start' } gap={ 12 }>
			<Segmented
				value={ limitingBehavior }
				options={ [
					{ label: 'unrestricted', value: 'none' },
					{ label: 'at exact time', value: 'exact' },
					{ label: 'flexible', value: 'time' },
				] }
				onChange={ updateLimitingBehavior }
			/>

			<Form.Item name={ name } hidden={ limitingBehavior !== 'time' }>
				<InputNumber
					min={ limitingBehavior === 'time' ? 1 : undefined }
					addonAfter={ 'minutes ' + graceType }
				/>
			</Form.Item>
		</Flex>
	</Form.Item>;
};
