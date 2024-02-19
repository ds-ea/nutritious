import AccountBox from '@mui/icons-material/AccountBox';
import Article from '@mui/icons-material/Article';
import SettingsIcon from '@mui/icons-material/Settings';

import { ResourceProps } from '@refinedev/core/src/interfaces/bindings/resource';


export const resources:Record<string, ResourceProps> = {
	entityState: {
		name: 'EntityState',
		meta: {
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
