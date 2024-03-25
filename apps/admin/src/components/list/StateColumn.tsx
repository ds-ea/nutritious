import React from 'react';


export const StateColumn:React.FC = ( { ...all } ) => {
	return <>
		{ 'state' }: { { all } }
	</>;
};
