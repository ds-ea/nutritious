import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormInputType } from '../../../../../../../../libs/core/src';
import { AbstractInput } from './abstract-input';


@Component( {
	selector: 'nutri-choices-input',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<div [formGroup]="formGroup" *ngIf="item" class="form-control">
			@if (item) {

				@if (item.config.limit == 1) {

					<mat-form-field>
						<mat-select
							[id]="ctrlId" [attr.aria-labelledby]="labelId"
							[formControlName]="item.key"
						>
							@for (option of item.config.options; track option.value) {
								<mat-option [value]="option.value">{{ option.label }}</mat-option>
							}
						</mat-select>
					</mat-form-field>

					<!--<mat-radio-group
						[id]="ctrlId" [attr.aria-labelledby]="labelId"
						[formControlName]="item.key"
					>
						@for (option of item.config.options; track option.value ) {
							<mat-radio-button [value]="option.value">{{option.label}}</mat-radio-button>
						}
					</mat-radio-group>-->
				} @else {

					<ul class="form-choice-checkboxes">
						@for (option of item.config.options; track option.value) {
							<li>
								<!-- [color]="ctrl?.valid ? 'accent' : 'warn'" -->
								<mat-checkbox
									[formControlName]="item.key"
									[value]="option.value"
								>{{ option.label }}
								</mat-checkbox>
							</li>
						}
					</ul>

				}
			}

		</div>
	`,
} )
export class ChoicesInput extends AbstractInput<FormInputType.Choices>{
}
