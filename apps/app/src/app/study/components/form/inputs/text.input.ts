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

						   [minlength]="config?.minLength ?? ''"
						   [maxlength]="config?.maxLength ?? ''"

					/>

				} @else {

					<textarea matInput
							  [id]="ctrlId" [attr.aria-labelledby]="labelId"
							  [formControlName]="item.key"
							  [minlength]="config?.minLength ?? ''"
							  [maxlength]="config?.maxLength ?? ''"
							  [rows]="4"
							  cdkTextareaAutosize
					></textarea>

				}
			</mat-form-field>
		</div>
	`,
} )
export class TextInput extends AbstractInput<FormInputType.Text>{
}
