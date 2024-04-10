import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormInputType } from '../../../../../../../../libs/core/src';
import { AbstractInput } from './abstract-input';


@Component( {
	selector: 'nutri-text-input',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<div [formGroup]="formGroup" *ngIf="item" class="form-control">
			<mat-form-field>
				@if (item.config.variant === 'string') {

					<input matInput
						   [id]="ctrlId" [attr.aria-labelledby]="labelId"
						   [formControlName]="item.key"

						   [minLength]="item.config.minLength ?? null"
						   [maxLength]="item.config.maxLength ?? null"

					/>

				} @else {

					<textarea
						matInput
						[id]="ctrlId" [attr.aria-labelledby]="labelId"
						[formControlName]="item.key"

						[minLength]="item.config.minLength ?? null"
						[maxLength]="item.config.maxLength ?? null"
					></textarea>

				}
			</mat-form-field>
		</div>
	`,
} )
export class TextInput extends AbstractInput<FormInputType.Text>{
}
