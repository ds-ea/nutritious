import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormInputType } from '../../../../../../../../libs/core/src';
import { AbstractInput } from './abstract-input';


@Component( {
    selector: 'nutri-binary-input',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
		<div [formGroup]="formGroup" *ngIf="item" class="form-control">
			<!--<mat-slide-toggle
				[id]="ctrlId" [attr.aria-labelledby]="labelId"
				[formControlName]="item.key"
			/>-->

			<mat-button-toggle-group [formControlName]="item.key" [id]="ctrlId" [attr.aria-labelledby]="labelId">
				<mat-button-toggle value="0">{{ config?.labelOff ?? ('FORM.BINARY_LBL_OFF' | translate) }}</mat-button-toggle>
				<mat-button-toggle value="1">{{ config?.labelOn ?? ('FORM.BINARY_LBL_ON' | translate) }}</mat-button-toggle>
			</mat-button-toggle-group>

		</div>
	`,
    standalone: false
} )
export class BinaryInput extends AbstractInput<FormInputType.Binary>{
}
