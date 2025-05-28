import BlockIcon from '@mui/icons-material/Block';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

import InventoryIcon from '@mui/icons-material/Inventory';

import { EntityState } from '@nutritious/core';
import { TableColumnProps, Tag } from 'antd';
import React from 'react';


export const StateColumnRenderer:TableColumnProps<unknown>['render'] = ( value:EntityState ) => {
	const stateMap:Record<EntityState, { icon:React.ReactNode, label:string }> = {
		[EntityState.Archived]: { label: 'Archived', icon: <InventoryIcon /> },
		[EntityState.Enabled]: { label: 'Enabled', icon: <CheckIcon /> },
		[EntityState.Disabled]: { label: 'Disabled', icon: <CloseIcon /> },
		[EntityState.Deleted]: { label: 'Deleted', icon: <DeleteOutlineIcon /> },
		[EntityState.Locked]: { label: 'Locked', icon: <BlockIcon /> },
		[EntityState.Pending]: { label: 'Pending', icon: <HourglassEmptyIcon /> },
	};

	if( !value )
		return <></>;

	const unknownState = !( value in stateMap );
	const state = unknownState ? { label: value, icon: <HelpOutlineOutlinedIcon /> } : stateMap[value];

	return (
		<div
			style={ { display: 'flex', justifySelf: 'center', alignSelf: 'center', placeItems: 'center', placeContent: 'center' } }
			title={ state.label }
		>
			{ unknownState
			  ? <Tag icon={ state.icon } color="default">{ state.label }</Tag>
			  : state.icon
			}
		</div>
	);
};
