import { ChangeDetectionStrategy, Component, QueryList, ViewChildren } from '@angular/core';
import { MatCheckbox, MatCheckboxChange } from '@angular/material/checkbox';
import { FormInputType } from '../../../../../../../../libs/core/src';
import { AbstractInput } from './abstract-input';


@Component( {
	selector: 'nutri-choices-input',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<div [formGroup]="formGroup" *ngIf="item" class="form-control">
			@if (item && config) {

				@if (config.limit == 1) {

					<mat-form-field>
						<mat-select
							[id]="ctrlId" [attr.aria-labelledby]="labelId"
							[formControlName]="item.key"
						>
							@for (option of config.options; track option.value) {
								<mat-option [value]="option.value">{{ option.label }}</mat-option>
							}
						</mat-select>
					</mat-form-field>

					<!--<mat-radio-group
						[id]="ctrlId" [attr.aria-labelledby]="labelId"
						[formControlName]="item.key"
					>
						@for (option of config.options; track option.value ) {
							<mat-radio-button [value]="option.value">{{option.label}}</mat-radio-button>
						}
					</mat-radio-group>-->
				} @else {

					<ul class="form-choice-checkboxes">
						@for (option of config.options; track option.value; let num = $index) {
							<li>
								<!-- [color]="ctrl?.valid ? 'accent' : 'warn'" -->
								<mat-checkbox #valueWrapCheck
											  [checked]="selected.includes(option.value)"
											  (change)="checkChange($event)"
											  [attr.data-option-value]="option.value"
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
	@ViewChildren( 'valueWrapCheck', { read: MatCheckbox } ) checkboxes:QueryList<MatCheckbox> | undefined;

	public selected:string[] = [];


	public checkChange( change:MatCheckboxChange ){
		const limit = this.config?.limit != null ? +this.config?.limit : 0;
		if( change.checked && limit && this.selected.length >= limit ){
			change.source.checked = false;
			return;
		}

		const selected:string[] = [];
		if( this.checkboxes?.length )
			for( const checkbox of this.checkboxes ){
				if( checkbox.checked ){
					const value = checkbox._elementRef.nativeElement.dataset['optionValue'];
					if( value != null )
						selected.push( value );
				}
			}

		this.selected = selected;
		this.ctrl?.setValue( selected );

		this.cdr.markForCheck();
	}



}
