import { Header } from '@components/header';
import { ThemedLayoutV2, ThemedSiderV2 } from '@refinedev/antd';
import { WelcomePage } from '@refinedev/core';
import type { LoaderArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { authProvider } from '~/authProvider';


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

/**
 * We're checking if the current session is authenticated.
 * If not, we're redirecting the user to the login page.
 * This is applied for all routes that are nested under this layout (_protected).
 */
export async function loader( { request }:LoaderArgs ){
	const { authenticated, redirectTo } = await authProvider.check( request );
	console.log( '!!load', authenticated );

	if( !authenticated ){
		throw redirect( redirectTo ?? '/login' );
	}

	return {};
}
