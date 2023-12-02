import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef, AfterContentInit, AfterViewChecked } from '@angular/core';
import { MealItem } from '../../../../interfaces/log.interface';


@Component( {
	            selector: 'nutri-food-list-meal-item-editor',
	            template: `
					<form (ngSubmit)="done()">
						<mat-card class="meal-item-editor" *ngIf="mealItem">
							<mat-card-header>
								<mat-card-subtitle>{{'LOG.MEAL.EDIT_MEAL_ITEM_HEADING' | translate}}</mat-card-subtitle>
								<mat-card-title>{{mealItem._food?.[ langKey ] || mealItem.foodKey}}</mat-card-title>
							</mat-card-header>
							<mat-card-content>
								<mat-form-field appearance="standard">
									<!--<mat-label>Standard form field</mat-label>-->
									<input class="in-quantity" #inQuantity
										   matInput type="number"
									       required
										   [(ngModel)]="mealItem.quantity" [ngModelOptions]="{standalone:true}"
										   [placeholder]="'LOG.MEAL.DEFAULT_QUANTITY_PHOLD' | translate"
									/>

									<span matSuffix>{{'LOG.MEAL.DEFAULT_QUANTITY' | translate}}</span>
									<!--<mat-hint>Hint</mat-hint>-->
								</mat-form-field>

							</mat-card-content>
							<mat-card-actions class="card-actions-spaced">
								<a mat-button (click)="removeItem()" color="hint">
									<mat-icon>delete</mat-icon>
									{{'LOG.MEAL.EDIT_MEAL_ITEM_REMOVE_BTN' | translate}}
								</a>

								<a mat-button color="primary" (click)="done()">
									{{'GENERIC.DONE_BTN' | translate}}
									<mat-icon>done</mat-icon>
								</a>
							</mat-card-actions>
						</mat-card>
					</form>
	            `,
	            styles: [],
	            changeDetection: ChangeDetectionStrategy.OnPush,
            } )
export class FoodListMealItemEditorComponent implements AfterViewInit{
	public popover:HTMLIonPopoverElement|any|undefined;

	@ViewChild('inQuantity', {read:ElementRef}) inQuantity:ElementRef|undefined;

	@Input() langKey:'en'|'de' = 'en';
	@Input() mealItem:MealItem | undefined;

	@Output() remove  = new EventEmitter<MealItem|undefined>();

	constructor(
		private cdr:ChangeDetectorRef
	){}

	public ngAfterViewInit():void{
		// TODO: do this properly
		setTimeout(()=>{
			this.inQuantity?.nativeElement.focus();
			this.cdr.detectChanges();
		}, 500);
	}

	public removeItem(){
		this.remove.next(this.mealItem);
		if( this.popover ){
			this.popover.dismiss( {item: this.mealItem, remove: true } );
		}
	}

	public done(){
		if( !this.mealItem?.quantity )
			return;

		if( this.popover ){
			this.popover.dismiss( {item: this.mealItem } );
		}
	}
}
