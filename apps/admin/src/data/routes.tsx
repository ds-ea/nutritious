import BentoIcon from '@mui/icons-material/Bento';
import IcecreamIcon from '@mui/icons-material/Icecream';
import { ThemedLayoutV2, ThemedSiderV2, ThemedTitleV2 } from '@refinedev/antd';
import { Authenticated } from '@refinedev/core';
import { CatchAllNavigate, NavigateToResource } from '@refinedev/react-router-v6';
import { Outlet } from 'react-router-dom';
import type { RouteObject } from 'react-router/dist/lib/context';
import { Header } from '../components';
import Login from '../pages/auth/login';
import { PageEdit, PagesCreate, PageShow, PagesList } from '../pages/pages';
import { StudiesCreate, StudiesList, StudyEdit, StudyShow } from '../pages/studies';
import { FormCreate, FormEdit, FormShow } from '../pages/studies/forms';
import { GroupCreate, GroupEdit, GroupShow } from '../pages/studies/groups';
import { ScheduleEdit, SchedulesCreate, ScheduleShow } from '../pages/studies/schedules';
import { UserCreate, UserEdit, UserList, UserShow } from '../pages/users';


const authRoutes:RouteObject[] = [
	{ path: '/login', element: <Login /> },
];

const primaryRoutes:RouteObject[] = [
	{ index: true, element: <NavigateToResource resource={ 'studies' } /> },


	{
		path: '/users', children: [
			{ index: true, element: <UserList /> },
			{ path: 'create', element: <UserCreate /> },
			{ path: 'edit/:id', element: <UserEdit /> },
			{ path: 'show/:id', element: <UserShow /> },
		],
	},
	{
		path: '/pages', children: [
			{ index: true, element: <PagesList /> },
			{ path: 'create', element: <PagesCreate /> },
			{ path: 'edit/:id', element: <PageEdit /> },
			{ path: 'show/:id', element: <PageShow /> },
		],
	},

	{
		path: '/studies', children: [
			{ index: true, element: <StudiesList /> },
			{ path: 'create', element: <StudiesCreate /> },
			{ path: 'edit/:id', element: <StudyEdit /> },
			{ path: 'show/:id', element: <StudyShow /> },

			{
				path: ':studyId/groups', children: [
					{ path: 'create', element: <GroupCreate /> },
					{ path: 'show/:id', element: <GroupShow /> },
					{ path: 'edit/:id', element: <GroupEdit /> },
				],
			},


			{
				path: ':studyId/schedules', children: [
					{ path: 'create', element: <SchedulesCreate /> },
					{ path: 'show/:id', element: <ScheduleShow /> },
					{ path: 'edit/:id', element: <ScheduleEdit /> },
				],
			},

			{
				path: ':studyId/forms', children: [
					{ path: 'create', element: <FormCreate /> },
					{ path: 'show/:id', element: <FormShow /> },
					{ path: 'edit/:id', element: <FormEdit /> },
				],
			},

		],
	},

];



const combinedRoutes:RouteObject[] = [
	{
		element:
			<Authenticated key="authenticated-inner" fallback={ <CatchAllNavigate to="/login" /> }>
				<ThemedLayoutV2
					Header={ () => <Header sticky /> }
					Sider={ ( props ) =>
						<ThemedSiderV2 { ...props } fixed
									   Title={ ( { collapsed } ) => (
										   <ThemedTitleV2
											   collapsed={ collapsed }
											   icon={ collapsed ? <IcecreamIcon /> : <BentoIcon /> }
											   text={ <>
												   <div>{ import.meta.env.VITE_PROJECT_NAME ?? 'Nutritious' }</div>
												   <small>{ import.meta.env.MODE ?? 'unknown version' }</small>
											   </> }
										   />
									   ) }
						/>
					}
				>
					<Outlet />
				</ThemedLayoutV2>
			</Authenticated>,

		children: [
			...primaryRoutes,
		],
	},
	{
		element:
			<Authenticated key="authenticated-outer" fallback={ <Outlet /> }>
				<NavigateToResource />
			</Authenticated>,

		children: [
			...authRoutes,
		],
	},
];



export default combinedRoutes;
