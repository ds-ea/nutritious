import { FormControlLabel, FormGroup, RadioGroup } from '@mui/material';
import Slider from '@mui/material/Slider';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import { FormInputConfigBinary, FormInputConfigChoices, FormInputConfigNumber, FormInputConfigSlider, FormInputConfigText, FormInputConfiguration, FormInputTypes } from '@nutritious/core';
import { Checkbox, Radio, Space } from 'antd';



export const FormItemInput:React.FC<{
	input:FormInputTypes;
	config:FormInputConfiguration;
}> = ( { input, ...props } ) => {

	if( input === 'text' ){
		const config = props.config as FormInputConfigText;
		return <Space direction={ 'vertical' } className={ 'stretch' }>
			<TextField variant="outlined" multiline={ config.variant === 'text' } />
		</Space>;
	}

	if( input === 'number' ){
		const config = props.config as FormInputConfigNumber;
		return <Space direction={ 'vertical' } className={ 'stretch' }>
			<TextField type={ 'number' } variant="outlined" />
		</Space>;
	}

	if( input === 'choices' ){
		const config = props.config as FormInputConfigChoices;

		return <Space direction={ 'vertical' } className={ 'stretch' }>
			{ config.limit === 1 &&
				<RadioGroup>
					{ config.options.map( ( option, i ) =>
						<FormControlLabel control={ <Radio /> } value={ option.value }
										  label={ <>
											  <strong>{ option.label }</strong>
											  <small>({ option.value })</small>
										  </> }
						/>,
					) }
				</RadioGroup> }

			{ config.limit !== 1 &&
				<FormGroup>
					{ config.options.map( ( option, i ) =>
						<FormControlLabel control={ <Checkbox /> } value={ option.value }
										  label={ <>
											  <strong>{ option.label }</strong>
											  <small>({ option.value })</small>
										  </> }
						/>,
					) }
				</FormGroup>
			}
		</Space>;


	}

	if( input === 'slider' ){
		const config = props.config as FormInputConfigSlider;
		return <Space direction={ 'vertical' } className={ 'stretch' }>
			<Slider />
		</Space>;
	}

	if( input === 'binary' ){
		const config = props.config as FormInputConfigBinary;
		return <Space direction={ 'vertical' } className={ 'stretch' }>
			<Switch />
		</Space>;
	}



	return (
		<>unknown input</>
	);
};
