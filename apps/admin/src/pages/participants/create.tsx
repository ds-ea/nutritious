import { IResourceComponentsProps } from '@refinedev/core';
import { Alert } from 'antd';
import React from 'react';


export const ParticipantCreate:React.FC<IResourceComponentsProps> = () => {

	return (
		<Alert
			message="Error"
			description="Participant creation is not supported yet."
			type="error"
			showIcon
		/>
	);
};
