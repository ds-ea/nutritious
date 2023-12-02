import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { finalize, publish, share, take, tap } from 'rxjs/operators';
import { Study, StudyDTO } from '../../../interfaces/study.interface';
import { StudyService } from '../study.service';


@Component( {
	            selector: 'app-dashboard',
	            template: `
					<ion-content class="content-centered">
			
						<div class="view-content" *ngIf="!busy && study; else nostudy">
							
							<mat-card >
								<mat-card-subtitle>{{'STUDY.CURRENT_STUDY_MSG' | translate}}</mat-card-subtitle>
								<mat-card-title>
									<h1>{{ study.study.name }}</h1>
								</mat-card-title>
							</mat-card>
							
							<footer class="view-footer">
								<a routerLink="/log/new"
								   mat-flat-button color="accent"
								>{{'STUDY.ENTER_DATA_BTN' | translate}}</a>
							</footer>
						</div>
			
						<ng-template #nostudy>
							<div class="callout mat-primary">{{'STUDY.NO_STUDY_ERR' | translate}}</div>
						</ng-template>
		
					</ion-content>
	            `,
	            styles: [],
	            changeDetection: ChangeDetectionStrategy.OnPush,
            } )
export class DashboardView implements OnInit{
	public busy = false;
	private loader!:HTMLIonLoadingElement;
	
	public study:StudyDTO | undefined;
	
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
	
	public refreshStudy():Observable<StudyDTO>{
		this.busy = true;
		this.loader.present();
		this.cdr.markForCheck();
		
		return this.studyService.refreshStudy()
			.pipe(
				tap( study => {
					this.study = study;
					this.busy = false;
					this.cdr.markForCheck();
					this.loader.dismiss();
				} ),
			);
		
	}
	
	
}
