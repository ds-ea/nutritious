import AccountBox from '@mui/icons-material/AccountBox';
import Article from '@mui/icons-material/Article';
import BallotIcon from '@mui/icons-material/Ballot';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import SettingsIcon from '@mui/icons-material/Settings';
import { ResourceProps } from '@refinedev/core';



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
	'group-members': {
		name: 'group-members',
		list: '/studies/show/:studyId/group/show/:groupId',
		//		create: '/studies/:studyId/groups/create',
		edit: '/studies/:studyId/groups/members/:groupId/edit/:id',
		show: '/studies/:studyId/groups/members/:groupId/show/:id',
		meta: {
			parent: 'groups',
			hide: true,
		},
	},

	participants: {
		name: 'participants',
		list: '/studies/show/:studyId',
		create: '/participants/create',
		edit: '/participants/edit/:id',
		show: '/participants/show/:id',
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

	'study-forms': {
		name: 'study-forms',
		list: '/studies/show/:studyId',
		create: '/studies/:studyId/forms/create',
		edit: '/studies/:studyId/forms/edit/:id',
		show: '/studies/:studyId/forms/show/:id',
		meta: {
			parent: 'studies',
			hide: true,
		},
	},


	'study-contents': {
		name: 'study-contents',
		list: '/studies/show/:studyId',
		create: '/studies/:studyId/contents/create',
		edit: '/studies/:studyId/contents/edit/:id',
		show: '/studies/:studyId/contents/show/:id',
		meta: {
			parent: 'studies',
			hide: true,
		},
	},


	responses: {
		name: 'responses',
		list: '/studies/:studyId/responses',
		//		create: '/studies/:studyId/responses/create',
		//		edit: '/studies/:studyId/responses/edit/:id',
		show: '/studies/:studyId/responses/show/:id',
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


	'form-input-presets': {
		name: 'form-input-presets',
		list: '/form-input-presets',
		create: '/form-input-presets/create',
		edit: '/form-input-presets/edit/:id',
		show: '/form-input-presets/show/:id',
		meta: {
			parent: 'system',
			label: 'Input Presets',
			icon: <BallotIcon />,
		},
	},


};

export default Object.values( resources );
