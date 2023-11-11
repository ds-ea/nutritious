import { ChangeDetectionStrategy, ChangeDetectorRef, Component, forwardRef, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { StudyCatalogQuestion, StudyCatalogQuestionConfigSlider } from '../../../../interfaces/study.interface';


@Component( {
	            selector: 'nutri-question-slider',
	            changeDetection: ChangeDetectionStrategy.OnPush,
	            providers: [
		            {
			            provide: NG_VALUE_ACCESSOR,
			            useExisting: forwardRef( () => QuestionSliderComponent ),
			            multi: true,
		            },
	            ],
	            template: `
					<ng-container *ngIf="question">
					
					</ng-container>
	            `,
            } )
export class QuestionSliderComponent implements OnInit{ // ControlValueAccessor
	
	@Input() question:StudyCatalogQuestion<StudyCatalogQuestionConfigSlider> | undefined;
	
	public config:StudyCatalogQuestionConfigSlider = {
	
	};
	
	public value:any;
	
	constructor(
		protected cdr:ChangeDetectorRef,
	){ }
	
	ngOnInit():void{
		this.config = this.question?.config as StudyCatalogQuestionConfigSlider;
		this.cdr.markForCheck();
	}
	
	/*
	onChange:any = () => {};
	onTouch:any = () => {};
	
	public writeValue( obj:any ):void{
	}
	
	public registerOnChange( fn:any ):void{
	}
	
	public registerOnTouched( fn:any ):void{
	}
	
	public setDisabledState( isDisabled:boolean ):void{
	}
	
	
	*/
}
