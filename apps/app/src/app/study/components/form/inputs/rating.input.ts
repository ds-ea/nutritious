import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormInputType } from '../../../../../../../../libs/core/src';
import { AbstractInput } from './abstract-input';


@Component( {
	selector: 'nutri-rating-input',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<div [formGroup]="formGroup" *ngIf="item" class="form-control">
			@if (item && config) {

				@if (config.behavior === 'linear') {

					<mat-slider
						[min]="config.min ?? null"
						[max]="config.max ?? null"
						[step]="config.step ?? null"

						[showTickMarks]="true"
					>
						<input matSliderThumb
							   [id]="ctrlId" [attr.aria-labelledby]="labelId"
							   [formControlName]="item.key"
						/>
					</mat-slider>
					@if (config.labelMin || config.labelMax) {
						<div class="slider-labels">
							<span class="min">{{ config.labelMin ?? '' }}</span>
							<span class="max">{{ config.labelMax ?? '' }}</span>
						</div>
					}


				} @else if (config.behavior === 'stars') {

					<div>STARS</div>

				} @else if (config.behavior === 'stepped' || true) {

					<mat-radio-group
						[id]="ctrlId" [attr.aria-labelledby]="labelId"
						[formControlName]="item.key"
					>
						@for (option of config.options; track option.value) {
							<mat-radio-button [value]="option.value">{{ option.label }}</mat-radio-button>
						}
					</mat-radio-group>

					<!--	<ul class="form-choice-checkboxes">
							@for (option of config.options; track option.value) {
								<li>
									&lt;!&ndash; [color]="ctrl?.valid ? 'accent' : 'warn'" &ndash;&gt;
									<mat-checkbox
										[formControlName]="item.key"
										[value]="option.value"

									>{{ option.label }}
									</mat-checkbox>
								</li>
							}
						</ul>-->

				} @else {
					unsupported rating setup
				}
			}

		</div>
	`,
} )
export class RatingInput extends AbstractInput<FormInputType.Rating>{

}
