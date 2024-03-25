import { ThemedLayoutV2, ThemedSiderV2 } from '@refinedev/antd';
import React from 'react';
import { Header } from './header';


export const CommonLayout:React.FC<React.PropsWithChildren> = ( { children } ) => {
	return (
		<>
			<ThemedLayoutV2
				Header={ () => <Header sticky /> }
				Sider={ ( props ) => <ThemedSiderV2 { ...props } fixed /> }
			>
				{ children }
			</ThemedLayoutV2>
		</>
	);
};
