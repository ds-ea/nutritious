import { ColorModeContextProvider } from '@contexts';
import { useNotificationProvider } from '@refinedev/antd';
import resetStyle from '@refinedev/antd/dist/reset.css';

import { Refine } from '@refinedev/core';
import { DevtoolsProvider } from '@refinedev/devtools';

import { RefineKbar, RefineKbarProvider } from '@refinedev/kbar';
import dataProvider from '@refinedev/nestjsx-crud';
//import dataProvider, { GraphQLClient } from '@refinedev/nestjs-query';
import routerProvider, { UnsavedChangesNotifier } from '@refinedev/remix-router';

import type { MetaFunction } from '@remix-run/node';
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react';
import { App as AntdApp } from 'antd';
import { authProvider } from '~/authProvider';
import resources from '~/data/resources';


const API_URL = 'http://localhost:7880';
const restDataProvider = dataProvider( API_URL );

export const meta:MetaFunction = () => [
	{
		title: 'New Remix + Refine App',
	},
];

export default function App(){
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body>
				<RefineKbarProvider>
					<ColorModeContextProvider>
						<AntdApp>
							<DevtoolsProvider>
								<Refine
									routerProvider={ routerProvider }
									dataProvider={ restDataProvider }
									notificationProvider={ useNotificationProvider }
									authProvider={ authProvider }
									options={ {
										syncWithLocation: true,
										warnWhenUnsavedChanges: true,
										useNewQueryKeys: true,
										disableTelemetry: true,
										projectId: 'p8Q6UV-cOiBz0-ZzPRVD',
									} }
									resources={ resources }
								>
									<>
										<Outlet />
										<UnsavedChangesNotifier />
										<RefineKbar />
									</>
								</Refine>
								{/*<DevtoolsPanel />*/ }
							</DevtoolsProvider>
						</AntdApp>
					</ColorModeContextProvider>
				</RefineKbarProvider>
				<ScrollRestoration />
				<Scripts />
				<LiveReload />
			</body>
		</html>
	);
}

export function links(){
	return [ { rel: 'stylesheet', href: resetStyle } ];
}
