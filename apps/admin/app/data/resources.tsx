import AccountBox from '@mui/icons-material/AccountBox';
import { ResourceProps } from '@refinedev/core/src/interfaces/bindings/resource';


export const resources:Record<string, ResourceProps> = {
	user: {
		name: 'users',
		list: '/users',
		create: '/users/create',
		edit: '/users/edit/:id',
		show: '/users/show/:id',
		meta: {
			label: 'Users',
			icon: <AccountBox />,
		},
	},
	entityState: {
		name: 'EntityState',
		meta: {
			hide: true,
		},
	},
};

export default Object.values( resources );
