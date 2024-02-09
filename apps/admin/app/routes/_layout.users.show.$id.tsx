import { AntdShowInferencer } from '@refinedev/inferencer/antd';


export default function UsersEdit(){
	return <AntdShowInferencer meta={ {
		user: {
			getOne: {
				fields: [ 'id', 'name', 'email', 'settings' ],
				operation: 'user',
				type: 'UserWhereUniqueInput',
			},
		},
	} } />;
}
