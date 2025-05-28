import { DownloadOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import React, { MouseEventHandler } from 'react';


export const ExportButton:React.FC<{
	triggerExport:MouseEventHandler<HTMLElement>,
	exportContext:'group' | 'study' | 'participant'
}> = ( { triggerExport, exportContext } ) => {
	return (
		<Button onClick={ triggerExport } icon={ <DownloadOutlined /> }>
			export { exportContext } responses
		</Button>
	);
};
