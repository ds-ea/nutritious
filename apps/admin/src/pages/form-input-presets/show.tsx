import type { FormInputPreset, FormInputTypes } from '@nutritious/core';
import { Show } from '@refinedev/antd';
import { IResourceComponentsProps, useShow } from '@refinedev/core';
import { Alert, Card, Descriptions, Divider, Empty, Flex, Space } from 'antd';
import React from 'react';
import { FormItemInput } from '../../components/forms/FormItemInput';
import { DetailsHeader } from '../../components/header/DetailsHeader';


type InputPreset = FormInputPreset &
	{
		inputType:FormInputTypes;
		config:Record<string, unknown>;
	};

export const FormInputPresetsShow:React.FC<IResourceComponentsProps> = () => {
	const { queryResult } = useShow( {
		meta: {
			fields: [ 'id', 'name', 'email', 'settings' ],
			operation: 'form-input-presets',
		},
	} );
	const { data, isLoading } = queryResult;

	const record = data?.data as Partial<InputPreset>;

	return (
		<Show isLoading={ isLoading } contentProps={ { className: 'card-transparent' } }>
			<Space direction="vertical" className={ 'stretch' } size={ 'middle' }>
				{ !record ? <Empty /> : <>

					<Card>
						<DetailsHeader record={ record } />
						<Divider />

						<Descriptions bordered={ true } column={ 4 }>
							{ record.notes &&
								<Descriptions.Item label={ 'Notes' } span={ 3 } labelStyle={ { width: 140 } }>
									<p>{ record.notes }</p>
								</Descriptions.Item>
							}

							<Descriptions.Item label={ 'Input Type' }>{ record.inputType }</Descriptions.Item>
						</Descriptions>
					</Card>


					<Card>


						<Descriptions bordered={ true } className={ 'label-top' } column={ 4 }>
							<Descriptions.Item key={ 'input-preview' } span={ 4 }
											   label={
												   <Flex gap={ 'small' } align={ 'center' } justify={ 'space-between' }>
													   <span>Preview</span>
												   </Flex>
											   }
							>
								<Space direction={ 'vertical' }>
									<Alert type={ 'info' } message={ 'Previews are currently not representative of all configuration properties, and differs visually from what participants see in the app.' } />
									{ !( record.inputType && record.config ) ? <Empty /> :
									  <FormItemInput input={ record.inputType } config={ record.config } />
									}
								</Space>

							</Descriptions.Item>
							<Descriptions.Item key={ 'config' } span={ 4 }
											   label={ 'Config' }
							>
								<code>
									<small>{ JSON.stringify( record.config ) }</small>
								</code>
							</Descriptions.Item>

						</Descriptions>

					</Card>
				</>
				}
			</Space>

		</Show>
	);
};
export default FormInputPresetsShow;
