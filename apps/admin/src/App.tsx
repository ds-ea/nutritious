import { useNotificationProvider } from '@refinedev/antd';
import '@refinedev/antd/dist/reset.css';
import { Refine } from '@refinedev/core';
import { DevtoolsProvider } from '@refinedev/devtools';
import { RefineKbar, RefineKbarProvider } from '@refinedev/kbar';
import routerBindings, { DocumentTitleHandler, UnsavedChangesNotifier } from '@refinedev/react-router-v6';
import { App as AntdApp } from 'antd';
import { useEffect } from 'react';
import { BrowserRouter, useRoutes } from 'react-router-dom';
import { ColorModeContextProvider } from './contexts/color-mode';


import resources from './data/resources';
import routes from './data/routes';
import { authProvider, restDataProvider, restoreAuth } from './services/services';


function App(){
	useEffect( () => {
		restoreAuth();
	}, [] );

	const Router = () => useRoutes( routes );


	return (
		<BrowserRouter basename={ 'admin' }>
			<RefineKbarProvider>
				<ColorModeContextProvider>
					<AntdApp>
						<DevtoolsProvider>
							<Refine
								dataProvider={ restDataProvider }
								notificationProvider={ useNotificationProvider }
								routerProvider={ routerBindings }
								authProvider={ authProvider }
								resources={ resources }
								options={ {
									syncWithLocation: true,
									warnWhenUnsavedChanges: true,
									useNewQueryKeys: true,
									disableTelemetry: true,
									projectId: 'p8Q6UV-cOiBz0-ZzPRVD',
									//                  projectId: "XTXxAW-8hagMy-bfrEMR",
								} }
							>

								<Router />

								<RefineKbar />
								<UnsavedChangesNotifier />
								<DocumentTitleHandler />
							</Refine>
							{/*<DevtoolsPanel />*/ }
						</DevtoolsProvider>
					</AntdApp>
				</ColorModeContextProvider>
			</RefineKbarProvider>
		</BrowserRouter>
	);
}

export default App;
