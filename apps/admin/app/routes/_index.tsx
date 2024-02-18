import { Header } from '@components/header';
import { ThemedLayoutV2, ThemedSiderV2 } from '@refinedev/antd';
import { WelcomePage } from '@refinedev/core';


export default function Index(){
	return <>
		<ThemedLayoutV2
			Header={ () => <Header sticky /> }
			Sider={ ( props ) => <ThemedSiderV2 { ...props } fixed /> }
		>
			<WelcomePage></WelcomePage>;
		</ThemedLayoutV2>
	</>;
	//	return <NavigateToResource resource="User" />;
}

