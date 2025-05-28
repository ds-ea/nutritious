import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormInputType } from '../../../../../../../../libs/core/src';
import { AbstractInput } from './abstract-input';


@Component( {
	selector: 'nutri-number-input',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<div [formGroup]="formGroup" *ngIf="item" class="form-control">
			<mat-form-field>
				<span matTextPrefix *ngIf="config?.prefix">{{ config?.prefix }}</span>
				<input matInput
					   type="number"

					   [min]="config?.min ?? null"
					   [max]="config?.max ?? null"

					   [id]="ctrlId" [attr.aria-labelledby]="labelId"
					   [formControlName]="item.key"
				/>

				<span matTextSuffix *ngIf="config?.suffix">{{ config?.suffix }}</span>

			</mat-form-field>
		</div>
	`,
} )
export class NumberInput extends AbstractInput<FormInputType.Number>{
}
