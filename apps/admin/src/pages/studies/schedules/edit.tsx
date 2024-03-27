import type { Prisma, Schedule, Study } from '@nutritious/core';
import { Edit, useForm } from '@refinedev/antd';
import { HttpError, IResourceComponentsProps, useOne, useParsed } from '@refinedev/core';
import { Form } from 'antd';
import React, { useEffect, useState } from 'react';
import { ScheduleFormElements, SlotWithListId } from '../../../../src/components/schedule/ScheduleFormElements';


export const ScheduleEdit:React.FC<IResourceComponentsProps> = () => {
	const { id: scheduleId, params } = useParsed<{ studyId?:string }>();
	// get study
	const studyId = params?.studyId;
	const { data: studyData, isLoading: isLoadingStudy } =
		useOne<Study>( {
			resource: 'studies',
			id: studyId,
		} );

	const [ study, setStudy ] = useState<Study>();
	useEffect( () => {
		if( !studyData?.data )
			return;
		setStudy( studyData?.data );
	}, [ studyData ] );


	const {
		formProps,
		saveButtonProps,
		queryResult,
		onFinish,
	} =
		useForm<Schedule, HttpError, Prisma.ScheduleUpdateInput>( {
			redirect: 'show',
		} );


	const handleOnFinish = ( values:Prisma.ScheduleUpdateInput ) => {

		const data:Prisma.ScheduleUpdateInput & { id?:string, slots:Partial<SlotWithListId>[] } = {
			...values,
			slots: formProps?.form?.getFieldValue( 'slots' ),
		};

		if( data.id )
			delete data.id;

		if( data.slots?.length )
			for( const slot of data.slots ){
				if( slot.steps?.length )
					for( const step of slot.steps )
						delete step._listId;

				delete slot._listId;
			}

		return onFinish( data );
	};



	return (
		<Edit saveButtonProps={ saveButtonProps }
			  contentProps={ { className: 'card-transparent' } }
			  isLoading={ isLoadingStudy }
		>

			{ study &&
				<Form { ...formProps }
					  onFinish={ handleOnFinish }
					  layout="vertical"
				>
					<ScheduleFormElements study={ study } formProps={ formProps } />
				</Form>
			}
		</Edit>
	);
};

export default ScheduleEdit;
