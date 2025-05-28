import { EntityState, minutesToTime, Schedule, Slot, StudyContent, StudyForm } from '@nutritious/core';
import { TimeLineItemProps } from 'antd/lib/timeline/TimelineItem';
import React from 'react';
import { dayData } from '../shared';
import { SlotItemContent, SlotWithListData } from './ScheduleFormElements';


export const humanReadableDays = ( days?:number[] ):string[] | undefined => {
	if( !days?.length )
		return undefined;

	if( days.length === 2 && days.includes( 0 ) && days.includes( 6 ) )
		return [ 'Weekend' ];

	if( days.length === 5 && !days.includes( 0 ) && !days.includes( 6 ) )
		return [ 'Weekdays' ];

	return days.map( day => dayData[day].short );
};

export const parseSchedule = (
	daySetup:Schedule['daySetup'],
	plainSlots:Slot[] | SlotWithListData[],
	createCount:number = 0,
	formMap?:Record<string, StudyForm> | undefined,
	contentMap?:Record<string, StudyContent> | undefined,
	onEditSlot?:( slot:SlotWithListData ) => void,
) => {
	const items:{ item:TimeLineItemProps, time:number, type:'spacer' | 'slot' | 'boundary' | 'plain' }[] = [];

	//	const daySetup:Schedule['daySetup'] = formProps?.form?.getFieldValue( 'daySetup' );
	const dayStart = daySetup?.[0].start ?? 0;
	const dayEnd = daySetup?.[0].end ?? 24 * 60;


	// add day boundaries if not overlapping with day start/end
	if( dayStart !== 0 )
		items.push( {
			type: 'boundary',
			time: 0,
			item: { label: '00:00', color: 'gray', className: 'day-boundary' },
		} );

	if( dayEnd !== 0 && dayEnd !== 24 * 60 )
		items.push( {
			type: 'boundary',
			time: 24 * 60,
			item: { label: '23:59', color: 'gray', className: 'day-boundary' },
		} );

	// day start + end
	items.push( {
		type: 'plain',
		time: dayStart,
		item: {
			label: ( dayStart / 60 ).toString().padStart( 2, '0' ) + ':00',
			children: 'Start of Day',
			color: 'blue', className: 'day-start',
		},
	} );

	items.push( {
		type: 'plain',
		time: dayEnd < dayStart ? dayEnd + 24 * 60 : dayEnd,
		item: {
			label: !dayEnd || dayEnd === 24 * 60 ? '23:59' : ( dayEnd / 60 ).toString().padStart( 2, '0' ) + ':00',
			children: 'End of Day',
			color: 'blue', className: 'day-end',
		},
	} );


	// slots
	const allDaySlots:SlotWithListData[] = [];
	const scheduleSlots = [];
	const slots:SlotWithListData[] = [];
	const removedSlots:SlotWithListData[] = [];

	for( const plainSlot of plainSlots ){
		const onlyOnDays = humanReadableDays( plainSlot.availability?.days );

		const slot:SlotWithListData = {
			...plainSlot,
			_listId: ( ( '_listId' in plainSlot && plainSlot._listId ) ? plainSlot._listId : plainSlot.id ?? ( 'new_' + ++createCount ) ),
			_onlyOnDays: onlyOnDays,
		};

		if( plainSlot.state && plainSlot.state !== EntityState.Enabled ){
			removedSlots.push( slot );
			continue;
		}

		slots.push( slot );

		if( !slot.availability || slot.availability.allDay ){
			allDaySlots.push( slot );
		}else{
			scheduleSlots.push( slot );

			const item:typeof items[number] = {
				type: 'slot',
				time: slot?.availability?.start! + dayStart,
				item: {
					color: 'green', className: 'slot',
					label: <>
						{/*{ onlyOnDays && <small style={ { marginInlineEnd: 12 } }>{ onlyOnDays.join( ', ' ) }</small> }*/ }
						{ minutesToTime( slot?.availability?.start! + dayStart ) }
					</>,
				},
			};

			if( onEditSlot )
				item.item.children = <SlotItemContent slot={ slot } onEdit={ onEditSlot } contentMap={ contentMap } formMap={ formMap } />;
			else
				item.item.children = <SlotItemContent slot={ slot } contentMap={ contentMap } formMap={ formMap } />;

			items.push( item );

		}
	}



	const timelineItems:TimeLineItemProps[] = [];
	// leading spacer
	timelineItems.push( { label: '', children: <></>, className: 'leading-trail' } );

	timelineItems.push( ...items
		.sort( ( a, b ) => a.time - b.time )
		.map( item => item.item ),
	);

	// trailing spacer
	timelineItems.push( { label: '', className: 'trailing-trail' } );
	timelineItems.push( { label: '', dot: <></> } );

	const uniqueSlotChecks = slots.map( ( { key, name, availability, _listId } ) => ( {
		key,
		name,
		time: availability?.allDay ? undefined : availability?.start ?? undefined,
		_listId,
	} ) );

	return { dayStart, dayEnd, allDaySlots, timelineItems, uniqueSlotChecks, removedSlots };
};
