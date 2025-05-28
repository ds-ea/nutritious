import { Divider, Flex, Space } from 'antd';
import React, { PropsWithChildren } from 'react';


export const GroupDivider:React.FC<PropsWithChildren> = ( { children } ) => {
	return <Flex className={ 'group-divider' }>
		<Divider type={ 'vertical' } />
		<Space.Compact direction={ 'vertical' } size={ 'small' }>
			{ children }
		</Space.Compact>
	</Flex>;
};
