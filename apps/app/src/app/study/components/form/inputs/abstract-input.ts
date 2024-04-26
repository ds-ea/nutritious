import { ChangeDetectorRef, Directive, Input, OnChanges, SimpleChanges } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { FormInputTypes, FormQuestion, InputRelatedConfig, MatchedSlot } from '../../../../../../../../libs/core/src';


@Directive()
export class AbstractInput<TInputType extends FormInputTypes = FormInputTypes> implements OnChanges{
	@Input()
	formGroup!:FormGroup;

	@Input()
	item:FormQuestion<TInputType> | undefined;

	@Input()
	refs:MatchedSlot['refs'] | undefined;

	config:InputRelatedConfig<TInputType> | undefined;

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
		if( this.item ){
			this.config = this.item.config;
			if( this.item.preset ){
				const preset = this.refs?.inputPresets?.[this.item.preset];
				if( preset?.config )
					this.config = preset.config as InputRelatedConfig<TInputType>;
			}
		}
	}



}
