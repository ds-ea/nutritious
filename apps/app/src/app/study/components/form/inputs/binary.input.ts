import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormInputType } from '../../../../../../../../libs/core/src';
import { AbstractInput } from './abstract-input';


@Component( {
	selector: 'nutri-binary-input',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<div [formGroup]="formGroup" *ngIf="item" class="form-control">
			<mat-slide-toggle
				[id]="ctrlId" [attr.aria-labelledby]="labelId"
				[formControlName]="item.key"
			/>
		</div>
	`,
} )
export class BinaryInput extends AbstractInput<FormInputType.Binary>{
}
