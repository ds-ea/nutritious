import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { CoreService } from '../../core/core.service';


@Component( {
	            selector: 'app-login',
	            template: `
					<ion-content class="content-centered">
			
						<mat-card>
							<mat-card-title>{{ 'USER.AUTH.LOGIN_HEADING'|translate }}</mat-card-title>
							<mat-card-content>
								<form class="form-vertical" [formGroup]="loginForm">
									<mat-form-field>
										<mat-label>{{ 'USER.AUTH.LOGIN_USERNAME_LBL'|translate }}</mat-label>
										<input matInput [placeholder]="'USER.AUTH.LOGIN_USERNAME_LBL'|translate"
											   formControlName="login"
										/>
									</mat-form-field>
									<mat-form-field>
										<mat-label>{{ 'USER.AUTH.LOGIN_PASS_LBL'|translate }}</mat-label>
										<input matInput type="password"
											   formControlName="pass"
											   [placeholder]="'USER.AUTH.LOGIN_PASS_LBL'|translate ">
									</mat-form-field>
									
									<div class="content-actions">
										<button type="submit" mat-flat-button color="primary" (click)="login()"
												[disabled]="!loginForm.valid"
										>{{'USER.AUTH.LOGIN_BTN' | translate}}</button>
									</div>
									
								</form>
							</mat-card-content>
							<mat-card-footer>
								<a mat-flat-button color="accent" routerLink="/register" [replaceUrl]="true">{{ 'USER.AUTH.GOTO_REGISTRATION_BTN' | translate }}</a>
							</mat-card-footer>
						</mat-card>
					</ion-content>
	            `,
            } )
export class LoginView implements OnInit{
	public loginForm:UntypedFormGroup = new UntypedFormGroup( {
		                                            login: new UntypedFormControl( '', Validators.required ),
		                                            pass: new UntypedFormControl( '', Validators.required ),
	                                            } );
	
	constructor(
		public core:CoreService,
		public loading:LoadingController,
		public router:Router,
		public toaster:ToastController,
		public translate:TranslateService,
	){ }
	
	ngOnInit():void{
	}
	
	public async login(){
		if( !this.loginForm.valid )
			return;
		
		const loader = await this.loading.create( { spinner: 'crescent' } );
		loader.present();
		
		this.core.login( this.loginForm.get( 'login' )?.value, this.loginForm.get( 'pass' )?.value )
			.subscribe( {
				            next: user => {
					            if( !user )
						            throw new Error( 'no user data' );
					
					            loader.dismiss();
					            this.router.navigate( [ '/study' ], { replaceUrl: true } );
				            },
				            error: err => {
					            this.toaster.create( {
						                                 color: 'danger',
						                                 message: this.translate.instant( 'USER.AUTH.LOGIN_FAILED_ERR' ),
						                                 duration: 3000,
					                                 } ).then( toast => toast.present() );
					            loader.dismiss();
				            },
			            } );
	}
	
}
