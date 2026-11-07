import { Component, OnInit } from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { de, enGB } from 'date-fns/locale';
import { DateFnsConfigurationService } from 'ngx-date-fns';
import { ApiService } from './core/api.service';
import { ConfigService } from './core/config.service';
import { CoreService } from './core/core.service';
import { StudyService } from './study/study.service';


@Component( {
	selector: 'app-root',
	template: `
		<ion-app [ngClass]="'env-'+deployENV">
			<ion-router-outlet id="main"></ion-router-outlet>

			<ion-menu side="end" menuId="first" contentId="main" class="nutri-main-menu" type="overlay">
				<ion-content>
					<ion-list lines="none">
						<ion-item routerLink="/" *ngIf="core.account">
							{{ 'NAV.DASHBOARD' | translate }}
						</ion-item>
						<ion-item [href]="config.get('SUPPORT_URL')" target="_blank">
							{{ 'NAV.HELP' | translate }}
						</ion-item>
						<ion-item [href]="config.get('PRIVACY_URL')" target="_blank">
							{{ 'NAV.LEGAL' | translate }}
						</ion-item>
					</ion-list>
					<ion-list lines="none">
						<ion-item class="lang-switcher">
							<a *ngFor="let lang of ['de','en']"
							   (click)="translate.use(lang)"
							   [class.active]="lang === translate.currentLang"
							>{{ lang }}
							</a>
						</ion-item>
						<ion-item *ngIf="core.account">
							<a (click)="logout()">
								{{ 'NAV.LOGOUT' | translate }}
							</a>
						</ion-item>
						@if (buildString && buildString.length > 4) {
							<ion-item class="version-number">
								<span>{{ buildString }}</span>
							</ion-item>
						}
					</ion-list>
				</ion-content>
			</ion-menu>


			<ion-header id="app-header">
				<ion-toolbar>
					<ion-buttons slot="start">
						<ion-button routerLink="/">
							<ion-img src="assets/icon/logo-outlined.svg" slot="icon-only"></ion-img>
						</ion-button>
						@if (deployENV !== 'production') {
							<span>{{ deployENV }}</span>
						}
					</ion-buttons>

					<ion-buttons slot="end">
						<ion-menu-button autoHide="false" (click)="openMenu()"></ion-menu-button>
					</ion-buttons>
				</ion-toolbar>
			</ion-header>


		</ion-app>
		<div class="scanner-ui">
			<ng-template [cdkPortalOutlet]="$any(core.scannerUIPortal)"></ng-template>
		</div>
	`,
	standalone: false,
} )
export class AppComponent implements OnInit{

	public deployENV = 'unknown';
	public buildString?:string;

	constructor(
		public core:CoreService,
		public api:ApiService,
		private router:Router,
		private studyService:StudyService,
		public config:ConfigService,
		public translate:TranslateService,
		private menu:MenuController,
		private dateAdapter:DateAdapter<unknown>,
		private dateFNSConfiguration:DateFnsConfigurationService,
	){
		this.deployENV = config.get( 'DEPLOYMENT_ENV' ) || 'unknown';
		this.buildString = `${ config.get( 'APP_VERSION' ) } (${ config.get( 'APP_BUILD' ) })`;

		this.translate.onLangChange.subscribe( change => {
			this.dateAdapter.setLocale( change.lang );
			this.dateFNSConfiguration.setLocale( change.lang === 'de' ? de : enGB );
		} );

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
