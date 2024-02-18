import { Header } from '@components/header';
import { ThemedLayoutV2, ThemedSiderV2 } from '@refinedev/antd';
import { Outlet } from '@remix-run/react';


export default function BaseLayout(){

	return (
		<>
			<ThemedLayoutV2
				Header={ () => <Header sticky /> }
				Sider={ ( props ) => <ThemedSiderV2 { ...props } fixed /> }
			>
				<Outlet />
			</ThemedLayoutV2>
		</>
	);
}
