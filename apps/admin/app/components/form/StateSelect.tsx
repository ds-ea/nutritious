import { Form, Select } from 'antd';
import React from 'react';


export const StateSelect:React.FC = () => {
	return <Form.Item
		label="State"
		name={ [ 'state' ] }
		rules={ [
			{
				required: true,
			},
		] }
	>
		<Select options={ [ { label: 'Enabled', value: 'ENABLED' }, { label: 'Disabled', value: 'DISABLED' } ] } />
	</Form.Item>;
};
