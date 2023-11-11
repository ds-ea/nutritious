import { Component, HostBinding, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from './core/api.service';
import { ConfigService } from './core/config.service';
import { CoreService } from './core/core.service';
import { StudyService } from './study/study.service';


@Component( {
	            selector: 'app-root',
	            template: `
					<ion-app>
						<ion-router-outlet id="main"></ion-router-outlet>
						
						<ion-menu side="end" menuId="first" contentId="main" class="nutri-main-menu" type="overlay">
							<ion-content>
								<ion-list lines="none">
									<ion-item routerLink="/" *ngIf="core.user">
										{{'NAV.DASHBOARD' | translate}}
									</ion-item>
									<ion-item [href]="config.get('SUPPORT_URL')" target="_blank">
										{{'NAV.HELP' | translate}}
									</ion-item>
									<ion-item [href]="config.get('PRIVACY_URL')" target="_blank">
										{{'NAV.LEGAL' | translate}}
									</ion-item>
								</ion-list>
								<ion-list lines="none">
									<ion-item class="lang-switcher">
										<a *ngFor="let lang of ['de','en']"
										   (click)="translate.use(lang)"
										   [class.active]="lang === translate.currentLang"
										>{{ lang }}</a>
									</ion-item>
									<ion-item *ngIf="core.user">
										<a (click)="logout()" >
											{{'NAV.LOGOUT' | translate}}
										</a>
									</ion-item>
								</ion-list>
							</ion-content>
						</ion-menu>
						
						
						<ion-header id="app-header" >
							<ion-toolbar>
								<ion-buttons slot="start">
									<ion-button>
										<ion-img src="assets/icon/logo-outlined.svg" slot="icon-only"></ion-img>
									</ion-button>
								</ion-buttons>
								
								<ion-buttons slot="end">
									<ion-menu-button autoHide="false" (click)="openMenu()"></ion-menu-button>
								</ion-buttons>
							</ion-toolbar>
						</ion-header>
						
						
					</ion-app>
					<div class="scanner-ui">
						<ng-template [cdkPortalOutlet]="core.scannerUIPortal"></ng-template>
					</div>
	            `,
            } )
export class AppComponent implements OnInit{
	
	constructor(
		public core:CoreService,
		public api:ApiService,
		private router:Router,
		private studyService:StudyService,
		public config:ConfigService,
		public translate:TranslateService,
		private menu: MenuController
	){
	}
	
	public async ngOnInit(){
		const user = await this.core.restoreAuth();
		if( user ){
			await this.studyService.restoreStudy();
			this.router.navigate( [ '/study' ] );
		}else{
			this.router.navigate( [ '/login' ] );
		}
	}
	
	public logout(){
		this.menu.close();
		this.core.logout();
	}
	
	public openMenu(){
		this.menu.open();
	}
	
	
}
