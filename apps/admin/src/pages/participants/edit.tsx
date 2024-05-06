import { IResourceComponentsProps } from '@refinedev/core';
import { Alert } from 'antd';
import React from 'react';


export const ParticipantEdit:React.FC<IResourceComponentsProps> = () => {


	return (
		<Alert
			message="Error"
			description="Participant editing is not supported yet."
			type="error"
			showIcon
		/>

	);
};
