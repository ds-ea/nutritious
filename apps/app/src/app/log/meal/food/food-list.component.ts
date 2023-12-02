import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy, ViewChild, Input, EventEmitter, Output } from '@angular/core';
import { AlertController, PopoverController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, ReplaySubject, Subject } from 'rxjs';
import { catchError, debounce, debounceTime, takeUntil, tap } from 'rxjs/operators';

import Fuse from 'fuse.js';
import * as fuzzysort from 'fuzzysort';
import { FoodLibraryItem, MealItem } from '../../../../interfaces/log.interface';
import { FoodListMealItemEditorComponent } from './food-list-meal-item-editor.component';



@Component( {
	            selector: 'app-food-list',
	            changeDetection: ChangeDetectionStrategy.OnPush,
	            template: `
					<ion-list class="meal-items">
						<ion-item-sliding *ngFor="let item of mealItems" (click)="editFood(item, $event)">
							<div class="meal-item">
								<span class="name">{{ item._food?.[ this.langKey ] || item.foodKey }}</span>
								<span class="quantity">
									<span class="value">{{ item.quantity }}</span>
									<span class="unit">{{ item.unit || '' }}</span>
								</span>
							</div>
						</ion-item-sliding>
					</ion-list>

					<ion-skeleton-text animated *ngIf="busy"></ion-skeleton-text>

					<div class="search" *ngIf="available?.length">
						<div class="results-anchor">
							<div class="search-results" *ngIf="matches?.length">
								<ion-list>
									<ion-item *ngFor="let food of matches"
											  (click)="selectFood(food)"
									>
										<ion-label> {{ food[ langKey ] }} </ion-label>
									</ion-item>
								</ion-list>
								<!--
								<cdk-virtual-scroll-viewport itemSize="30" >
								    <ion-item *cdkVirtualFor="let food of matches"></ion-item>
								</cdk-virtual-scroll-viewport>-->
							</div>
						</div>

						<ion-searchbar #searchBar
									   autocorrect="off" mode="ios"
									   [(ngModel)]="searchTerm"
									   (ionChange)="searchTrigger.next($event)"
									   (keyup)="searchTrigger.next($event)"
									   (ionClear)="resetSearch()"
									   [placeholder]="'LOG.MEAL.LOOKUP_FOOD_PHOLD'|translate"
						></ion-searchbar>
					</div>

					<div class="alert" *ngIf="!busy && !available?.length">
						{{'LOG.MEAL.FOOD_LIBRARY_UNAVAILABLE_ERR' | translate}}
					</div>

	            `,
            } )
export class FoodListComponent implements OnInit, OnDestroy{
	private _destroyed$ = new ReplaySubject<boolean>( 1 );

	@ViewChild( 'editPopover' ) editPopover:any;
	@ViewChild( 'searchBar' ) searchBar:any;

	@Input() focusSearch:Subject<any> | undefined;

	public busy = false;
	public langKey:'de' | 'en' = 'en';

	@Input() mealItems:MealItem[] = [];
	@Output() mealItemsChange = new EventEmitter<MealItem[]>();

	public available:FoodLibraryItem[] = [];
	public matches:FoodLibraryItem[] = [];

	public fuse:Fuse<FoodLibraryItem> | undefined;
	public fuzzyPrepared:any | undefined;

	public searchTrigger = new Subject<any>();
	public searchTerm = '';
	public searchLimit = 50;

	public selectedMealItem:MealItem | undefined;


	constructor(
		private http:HttpClient,
		private translate:TranslateService,
		private cdr:ChangeDetectorRef,
		public popoverController:PopoverController,
		public alertController:AlertController,
	){
	}


	public ngOnDestroy():void{
		this._destroyed$.next( true );
		this._destroyed$.unsubscribe();
	}

	public ngOnInit():void{
		if( this.focusSearch )
			this.focusSearch
				.pipe( takeUntil( this._destroyed$ ) )
				.subscribe( () => {
					setTimeout( () => {
						this.searchBar.setFocus();
						this.cdr.detectChanges();
					}, 300 );
				} );

		this.langKey = this.translate.currentLang === 'de' ? 'de' : 'en';
		this.translate.onLangChange
			.pipe( takeUntil( this._destroyed$ ) )
			.subscribe( change => {
				this.langKey = change.lang === 'de' ? 'de' : 'en';
			} );

		this.searchTrigger
			.pipe(
				takeUntil( this._destroyed$ ),
				debounceTime( 100 ),
				tap(e=>console.log('se', e))
			)
			.subscribe( () => this.search( this.searchTerm ) );

		this.loadData();

		if( !this.mealItems )
			this.mealItems = [];
	}

	private async loadData(){
		this.busy = true;
		this.cdr.markForCheck();
		const data = await this.http.get<FoodLibraryItem[]>( 'assets/data/food.json' )
			.pipe( catchError( err => {
				console.error( 'unable to load food library', err );
				return [];
			} ) )
			.toPromise();

		if( !data ){
			console.error('no food library data');
			return;
		}

		// exported food list might not include english desc, in which case we fall back to German
		if( this.langKey === 'en' && data && data[ 0 ].en === undefined )
			this.langKey = 'de';

		this.fuse = new Fuse<FoodLibraryItem>( data, {
			keys: [ this.langKey ],
			includeScore: true,
			findAllMatches: true,
			threshold: .4,
			shouldSort: true,
		} );

		this.fuzzyPrepared = data.forEach( item => item._fuzzy = fuzzysort.prepare( item[ this.langKey ] as any ) );

		this.available = data ?? [];
		this.busy = false;
		this.cdr.markForCheck();
	}

	public resetSearch(){
		this.searchTerm = '';
		this.search( undefined );
	}

	public search( term:string | undefined ){
		term = term?.trim();
		if( !term || term.length < 2 ){
			this.matches = [];
			return;
		}

		if( false ){
			const result = this.fuse?.search( <string> term );
			this.matches = result?.slice( 0, this.searchLimit ).map( r => r.item ) || [];
		}else{
			const result = fuzzysort.go( term, this.available, { key: '_fuzzy' } );
			this.matches = result?.slice( 0, this.searchLimit ).map( r => r.obj );
		}

		this.cdr.markForCheck();
	}

	public selectFood( food:FoodLibraryItem ){
		this.resetSearch();
		const item:MealItem = {
			foodID: food.id,
			foodKey: food.key,
			quantity: undefined,

			_food: food,
		};
		this.mealItems.push( item );
		this.mealItems.sort( ( a, b ) => {
			const aName = a._food?.[ this.langKey ] || a.foodKey;
			const bName = b._food?.[ this.langKey ] || b.foodKey;
			return aName?.localeCompare( bName );
		} );


		this.editFood( item );
		this.mealItemsChange.next( this.mealItems );
	}

	public async editFood( item:MealItem, event?:Event ){
		this.selectedMealItem = item;
		let popover:HTMLIonPopoverElement;

		popover = await this.popoverController.create( {
			                                               component: FoodListMealItemEditorComponent,
			                                               componentProps: {
				                                               langKey: this.langKey,
				                                               mealItem: item,
			                                               },
			                                               event,
			                                               size: 'cover',
		                                               } );

		await popover.present();
		const result = await popover.onDidDismiss();
		if( result.data?.remove ){
			this.removeFood( result.data.item );
		}

		this.cdr.markForCheck();
		this.mealItemsChange.next( this.mealItems );

	}

	public async removeFood( itemToRemove:MealItem ){
		const alert = await this.alertController.create( {
			                                                 message: this.translate.instant(
				                                                 'LOG.MEAL.CONFIRM_REMOVE_MEAL_ITEM_MSG',
				                                                 { name: itemToRemove._food?.[ this.langKey ] || itemToRemove.foodKey },
			                                                 ),
			                                                 buttons: [ 'Cancel', 'OK' ],
		                                                 } );

		await alert.present();
		const { role } = await alert.onDidDismiss();
		if( role === 'cancel' )
			return;

		this.mealItems = this.mealItems.filter( item => item !== itemToRemove );
		this.cdr.markForCheck();
		this.mealItemsChange.next( this.mealItems );
	}
}
