import type { Prisma } from '@nutritious/core';
import { DatePicker, Form, FormItemProps, Space, Switch } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import React from 'react';


export type TimeFrameProps = {
	name:string;
};

export type TimeFrameFormValue = {
	state:Prisma.TimeFrameCreateInput['state'] | boolean,
	from?:Dayjs,
	until?:Dayjs
};

export const timeFrameOnFinish = ( frameValues:TimeFrameFormValue ) => {
	if( !frameValues )
		return undefined;

	return ( {
		...frameValues,
		state: frameValues['state'] ? 'ENABLED' : 'DISABLED',
		from: frameValues?.from?.toISOString(),
		until: frameValues?.until?.toISOString(),
	} ) as Prisma.TimeFrameCreateInput;
};

export const timeFrameOnLoad = <T extends Record<string, unknown>>( formData:T, keys:( keyof T )[] ) => {
	if( !formData )
		return;

	for( const key of keys ){
		if( !formData[key] || typeof formData[key] !== 'object' )
			continue;

		const frame = formData[key] as TimeFrameFormValue;

		if( frame.state !== 'ENABLED' )
			frame.state = false;

		for( const frameKey of [ 'from', 'until' ] as ( keyof Pick<TimeFrameFormValue, 'from' | 'until'> )[] )
			if( frame[frameKey] && typeof frame[frameKey] === 'string' )
				frame[frameKey] = dayjs( frame[frameKey] );

	}
};

export const TimeFrame:React.FC<FormItemProps & TimeFrameProps> = ( { name } ) => {
	return (
		<Space>
			<Form.Item name={ [ name, 'state' ] }>
				<Switch title={ 'Enabled' } />
			</Form.Item>
			<Form.Item name={ [ name, 'from' ] }>
				<DatePicker
					placeholder={ 'From always' }
					showTime={ true }
				/>
			</Form.Item>
			<Form.Item name={ [ name, 'until' ] }>
				<DatePicker
					placeholder={ 'until forever' }
					showTime={ true }
				/>
			</Form.Item>
		</Space>
	);
};

