import { AuthPage } from '@refinedev/antd';


export default function Login(){
	return (
		<AuthPage
			type="login"
			formProps={ {
				initialValues: { email: 'z@dsea.net', password: 'test' },
			} }
			registerLink={ false }
		/>
	);
}
