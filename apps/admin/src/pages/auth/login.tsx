import BentoIcon from '@mui/icons-material/Bento';
import { AuthPage, ThemedTitleV2 } from '@refinedev/antd';


export default function Login(){
	return (
		<AuthPage
			type="login"
			formProps={ {
				//				initialValues: { email: '', password: '' },
			} }
			registerLink={ false }
			title={ <ThemedTitleV2
				collapsed={ false }
				icon={ <BentoIcon /> }
				text={ <>
					<span>{ import.meta.env.VITE_PROJECT_NAME ?? 'Nutritious' }</span>
					&nbsp;
					<small>({ import.meta.env.MODE ?? 'unknown version' })</small>
				</> }
			/> }

		/>
	);
}
