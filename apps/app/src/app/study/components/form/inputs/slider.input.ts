import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormInputType } from '../../../../../../../../libs/core/src';
import { AbstractInput } from './abstract-input';


@Component( {
	selector: 'nutri-slider-input',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<div [formGroup]="formGroup" *ngIf="item" class="form-control">
			<mat-slider
				[min]="config?.min ?? null"
				[max]="config?.max ?? null"
				[step]="config?.step ?? null"

				[showTickMarks]="true"
				[discrete]="true"
			>
				<input matSliderThumb
					   [id]="ctrlId" [attr.aria-labelledby]="labelId"
					   [formControlName]="item.key"
				/>
			</mat-slider>
			@if (config?.labelMin || config?.labelMax) {
				<div class="slider-labels">
					<span class="min">{{ config?.labelMin ?? '' }}</span>
					<span class="max">{{ config?.labelMax ?? '' }}</span>
				</div>
			}
		</div>
	`,
} )
export class SliderInput extends AbstractInput<FormInputType.Slider>{
}
