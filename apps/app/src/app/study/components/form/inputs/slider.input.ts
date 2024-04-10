import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormInputType } from '../../../../../../../../libs/core/src';
import { AbstractInput } from './abstract-input';


@Component( {
	selector: 'nutri-slider-input',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<div [formGroup]="formGroup" *ngIf="item" class="form-control">
			<mat-slider


				[min]="item.config.min ?? null"
				[max]="item.config.max ?? null"
				[step]="item.config.step ?? null"

				[showTickMarks]="true"
			>
				<input matSliderThumb
					   [id]="ctrlId" [attr.aria-labelledby]="labelId"
					   [formControlName]="item.key"
				/>
			</mat-slider>
		</div>
	`,
} )
export class SliderInput extends AbstractInput<FormInputType.Slider>{
}
