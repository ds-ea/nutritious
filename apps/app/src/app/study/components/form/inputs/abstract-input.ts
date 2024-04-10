import { ChangeDetectorRef, Directive, Input, OnChanges, SimpleChanges } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { FormInputTypes, FormQuestion } from '../../../../../../../../libs/core/src';


@Directive()
export class AbstractInput<TInputType extends FormInputTypes = FormInputTypes> implements OnChanges{
	@Input()
	formGroup!:FormGroup;

	@Input()
	item:FormQuestion<TInputType> | undefined;

	get ctrlId(){
		return 'in-' + this.item?.key;
	}

	get labelId(){
		return 'inlbl-' + this.item?.key;
	}

	public ctrl:AbstractControl | undefined;

	constructor(
		protected cdr:ChangeDetectorRef,
	){
	}

	public ngOnChanges( changes:SimpleChanges ):void{
		if( this.formGroup && this.item )
			this.ctrl = this.formGroup.controls[this.item.key];
	}



}
