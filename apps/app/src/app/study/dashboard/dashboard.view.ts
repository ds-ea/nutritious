import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PreparedStudy, SafeSlot } from '../../../../../../libs/core/src';
import { StudyService } from '../study.service';


@Component( {
	selector: 'app-dashboard',
	template: `
		<ion-content class="content-centered">

			<div class="view-content" *ngIf="!busy && studies?.length; else nostudy">

				@for (study of studies; track study.study.id) {

					<mat-card>
						<mat-card-subtitle>{{ 'STUDY.CURRENT_STUDY_MSG' | translate }}</mat-card-subtitle>
						<mat-card-title>
							<h1>{{ study.study.name }}</h1>
						</mat-card-title>


						<ul>
							@for (slot of slots; track slot['key']) {
								<li>{{ slot['key'] }}: {{ slot['availability'] | json }}</li>
							}
						</ul>

					</mat-card>
				}

				<footer class="view-footer">
					<a routerLink="/log/new"
					   mat-flat-button color="accent"
					>{{ 'STUDY.ENTER_DATA_BTN' | translate }}
					</a>
				</footer>
			</div>

			<ng-template #nostudy>
				<div class="callout mat-primary">{{ 'STUDY.NO_STUDY_ERR' | translate }}</div>
			</ng-template>

		</ion-content>
	`,
	styles: [],
	changeDetection: ChangeDetectionStrategy.OnPush,
} )
export class DashboardView implements OnInit{
	public busy = false;
	private loader!:HTMLIonLoadingElement;

	public studies:PreparedStudy[] | undefined;
	public slots:SafeSlot[] | undefined;

	constructor(
		private studyService:StudyService,
		public loading:LoadingController,
		public router:Router,
		public cdr:ChangeDetectorRef,
	){

	}

	async ngOnInit(){
		this.loader = await this.loading.create( { spinner: 'crescent' } );
		this.refreshStudy()
			.subscribe( () => {
				// check if can add new entry
				//				this.router.navigate(['/log/new'])
			} );
	}

	public refreshStudy():Observable<PreparedStudy[]>{
		this.busy = true;
		this.loader.present();
		this.cdr.markForCheck();

		return this.studyService.refreshStudies()
			.pipe(
				tap( studies => {
					this.studies = studies;

					this.processSlots();

					this.busy = false;
					this.cdr.markForCheck();
					this.loader.dismiss();
				} ),
			);

	}

	private processSlots(){
		const slots:SafeSlot[] = [];

		if( this.studies )
			for( const study of this.studies ){
				if( study.schedule?.slots?.length )
					for( const slot of study.schedule.slots ){
						if( slot.steps?.length )
							slots.push( slot );
					}
			}

		this.slots = slots;
	}


}
