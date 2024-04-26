import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormInputType } from '../../../../../../../../libs/core/src';
import { AbstractInput } from './abstract-input';


@Component( {
	selector: 'nutri-text-input',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<div [formGroup]="formGroup" *ngIf="item" class="form-control">
			<mat-form-field>
				@if (config?.variant === 'string') {

					<input matInput
						   [id]="ctrlId" [attr.aria-labelledby]="labelId"
						   [formControlName]="item.key"

						   [minLength]="config?.minLength ?? null"
						   [maxLength]="config?.maxLength ?? null"

					/>

				} @else {

					<textarea
						matInput
						[id]="ctrlId" [attr.aria-labelledby]="labelId"
						[formControlName]="item.key"

						[minLength]="config?.minLength ?? null"
						[maxLength]="config?.maxLength ?? null"
					></textarea>

				}
			</mat-form-field>
		</div>
	`,
} )
export class TextInput extends AbstractInput<FormInputType.Text>{
}
