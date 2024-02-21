import AccountBox from '@mui/icons-material/AccountBox';
import Article from '@mui/icons-material/Article';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import SettingsIcon from '@mui/icons-material/Settings';

import { ResourceProps } from '@refinedev/core/src/interfaces/bindings/resource';


export const resources:Record<string, ResourceProps> = {
	entityState: {
		name: 'EntityState',
		meta: {
			hide: true,
		},
	},

	nutritious: {
		name: 'nutritious',
		meta: {
			label: 'Nutritious',
			icon: <LibraryBooksIcon />,
			dataProviderName: undefined,
		},
	},



	study: {
		name: 'studies',
		list: '/studies',
		create: '/studies/create',
		edit: '/studies/edit/:id',
		show: '/studies/show/:id',
		meta: {
			//			parent: 'nutritious',
			label: 'Studies',
			icon: <HistoryEduIcon />,
		},
	},

	group: {
		name: 'groups',
		list: '/studies/show/:studyId',
		create: '/studies/:studyId/groups/create',
		edit: '/studies/:studyId/groups/edit/:id',
		show: '/studies/:studyId/groups/show/:id',
		meta: {
			parent: 'studies',
			hide: true,
		},
	},

	participants: {
		name: 'participants',
		list: '/studies/show/:studyId',
		create: '/studies/:studyId/groups/:groupId/participants/create',
		edit: '/studies/:studyId/groups/:groupId/participants/edit/:id',
		show: '/studies/:studyId/groups/:groupId/participants/show/:id',
		meta: {
			parent: 'studies',
			hide: true,
		},
	},

	schedules: {
		name: 'schedules',
		list: '/studies/show/:studyId',
		create: '/studies/:studyId/schedules/create',
		edit: '/studies/:studyId/schedules/edit/:id',
		show: '/studies/:studyId/schedules/show/:id',
		meta: {
			parent: 'studies',
			hide: true,
		},
	},


	system: {
		name: 'system',
		meta: {
			label: 'System',
			icon: <SettingsIcon />,
			dataProviderName: undefined,
		},
	},


	user: {
		name: 'users',
		list: '/users',
		create: '/users/create',
		edit: '/users/edit/:id',
		show: '/users/show/:id',
		meta: {
			parent: 'system',
			label: 'Users',
			icon: <AccountBox />,
		},
	},

	page: {
		name: 'pages',
		list: '/pages',
		create: '/pages/create',
		edit: '/pages/edit/:id',
		show: '/pages/show/:id',
		meta: {
			parent: 'system',
			label: 'Pages',
			icon: <Article />,
		},
	},


};

export default Object.values( resources );
