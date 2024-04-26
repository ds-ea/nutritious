import { Step, StudyContent, StudyForm, StudyStepType } from '@nutritious/core';
import { Select } from 'antd';
import { FormItemProps } from 'antd/es/form/FormItem';
import { DefaultOptionType } from 'rc-select/lib/Select';
import React, { useEffect, useState } from 'react';


export const StepReferencePicker:React.FC<FormItemProps & {
	type:Step['type'],
	value?:string,
	onChange?:() => void,
	forms:StudyForm[] | undefined,
	contents:StudyContent[] | undefined,
}> = ( props ) => {

	if( props.type === StudyStepType.BlsFood )
		return <></>;

	const [ options, setOptions ] = useState<DefaultOptionType[]>( [] );

	useEffect( () => {
		let opts:{ label:string, value:string }[] = [];

		if( props.type === 'form' && props.forms?.length )
			opts = props.forms?.map( opt => ( { label: opt.name, value: opt.id } ) );
		else if( props.type === 'content' && props.contents?.length )
			opts = props.contents?.map( opt => ( { label: opt.name, value: opt.id } ) );

		opts = opts.sort( ( a, b ) => a.label!.localeCompare( b.label ) );
		setOptions( opts );

	}, [ props.type ] );

	return <Select options={ options } value={ props.value } onChange={ props.onChange } />;
};

