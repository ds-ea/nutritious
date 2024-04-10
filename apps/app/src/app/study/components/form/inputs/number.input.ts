import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormInputType } from '../../../../../../../../libs/core/src';
import { AbstractInput } from './abstract-input';


@Component( {
	selector: 'nutri-number-input',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<div [formGroup]="formGroup" *ngIf="item" class="form-control">
			<mat-form-field>
				<input matInput
					   type="number"

					   [min]="item.config.min ?? null"
					   [max]="item.config.max ?? null"

					   [id]="ctrlId" [attr.aria-labelledby]="labelId"
					   [formControlName]="item.key"
				/>
			</mat-form-field>
		</div>
	`,
} )
export class NumberInput extends AbstractInput<FormInputType.Number>{
}
