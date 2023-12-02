import { TemplatePortal } from '@angular/cdk/portal';
import { DOCUMENT } from '@angular/common';
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, Inject, ViewChild, TemplateRef, ViewContainerRef, ChangeDetectorRef } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { LoadingController, Platform, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { catchError, delay } from 'rxjs/operators';
import { Study, StudyParticipantCredentials } from '../../../interfaces/study.interface';
import { CoreService } from '../../core/core.service';

enum SignupStep{
	CheckStudy = 'check',
	SignUp = 'signup',
	LogIn = 'login',
}

@Component( {
	            selector: 'app-registration',
	            template: `
					<ion-content class="content-centered" [ngClass]="['step-'+step]">
						<div class="">
							<mat-card>
								<mat-card-title>{{ 'USER.AUTH.REGISTER_HEADING'|translate }}</mat-card-title>
					
								<ng-container [ngSwitch]="step">
									
										<ng-template [ngSwitchCase]="SignupStep.CheckStudy">
											<mat-card-content>
												<form class="form-vertical" [formGroup]="registrationForm" (submit)="studyCheck()" autocomplete="off">
										
													<div class="">
														<a mat-flat-button color="primary" (click)="startScan()"
														   class="ScanCodeButton"
														   [class.mat-button-disabled]="!canScan"
														>
															<ion-icon name="qr-code-outline"></ion-icon>
															{{ 'USER.AUTH.SCAN_SIGNUP_QRCODE_BTN' | translate }}
														</a>
													</div>
													<mat-form-field>
														<mat-label>{{ 'USER.AUTH.STUDY_KEY_LBL'|translate }}</mat-label>
														<input matInput formControlName="key" [placeholder]="'USER.AUTH.STUDY_KEY_LBL'|translate ">
													</mat-form-field>
													<mat-form-field>
														<mat-label>{{ 'USER.AUTH.STUDY_CODE_LBL'|translate }}</mat-label>
														<input matInput formControlName="code" [placeholder]="'USER.AUTH.STUDY_CODE_LBL'|translate " autocomplete="off">
													</mat-form-field>
										
													<div class="content-actions">
														<button type="submit" mat-flat-button color="primary"
																[disabled]="!registrationForm.valid"
														>{{'USER.AUTH.REGISTER_BTN' | translate}}</button>
													</div>
												</form>
											</mat-card-content>
										</ng-template>
									
										<ng-template [ngSwitchCase]="SignupStep.SignUp">
											<mat-card-content>
												<form class="form-vertical" [formGroup]="participantForm" (submit)="signup()" autocomplete="off">
										
													<ion-note class="explain">{{'USER.SIGNUP.CODE_VALID_CONFIRM_PARTICIPATION' | translate}}</ion-note>
													<h2 class="study-title">{{ studyInfo!.name }}</h2>
										
										
													<mat-form-field>
														<mat-label>{{'USER.SIGNUP.PARTICIPANT_ID_LBL' | translate}}</mat-label>
														<input matInput [placeholder]="'USER.SIGNUP.PARTICIPANT_ID_LBL' | translate"
															   formControlName="participant"
														/>
														<mat-hint>{{'USER.SIGNUP.PARTICIPANT_ID_HINT' | translate}}</mat-hint>
													</mat-form-field>
										
													<div class="content-actions extra-space">
														<button type="submit" mat-flat-button color="primary"
																[disabled]="!registrationForm.valid"
														>{{'USER.SIGNUP.CONFIRM_AND_SUBMIT_SIGNUP_BTN' | translate}}</button>
													</div>
												</form>
											</mat-card-content>
											<mat-card-actions class="buttons-centered">
											</mat-card-actions>
										</ng-template>
										
										<ng-template [ngSwitchCase]="SignupStep.LogIn">
											<mat-card-content>
												<form class="form-vertical" [formGroup]="loginForm" (submit)="login()" autocomplete="off">
													
													<p [innerHtml]="'USER.SIGNUP.CREDENTIALS_HEADER' | translate: {name:studyInfo!.name} "></p>
													<ul class="credentials" *ngIf="credentials; else noCredentials">
														<li>{{'USER.SIGNUP.CREDS_LOGIN_LBL' | translate}}: <strong>{{ credentials.username }}</strong></li>
														<li>{{'USER.SIGNUP.CREDS_PASS_LBL' | translate}}: <strong>{{ credentials.password }}</strong></li>
														<li *ngIf="credentials.participant">{{'USER.SIGNUP.PARTICIPANT_ID_LBL' | translate}}: <strong>{{ credentials.participant }}</strong></li>
													</ul>
													<ng-template #noCredentials>
														<ion-note color="danger">{{'USER.SIGNUP.NO_CREDENTIALS_ERR' | translate}}</ion-note>
													</ng-template>
													<div class="explain">
														<ion-note color="dark" class="important">{{'USER.SIGNUP.CREDS_EXPLAIN_IMPORTANT' | translate}}</ion-note>
														<p>{{'USER.SIGNUP.CREDS_EXPLAIN_TXT' | translate}}</p>
													</div>
													
													<h2>{{'USER.AUTH.LOGIN_HEADING' | translate}}</h2>
													
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
											<mat-card-actions class="buttons-centered">
											</mat-card-actions>
										</ng-template>
						
								</ng-container>
				
							</mat-card>
							<div class="view-footer">
								<a mat-button routerLink="/login">{{ 'USER.AUTH.GOTO_LOGIN_BTN' | translate }}</a>
							</div>
						</div>
			
						<ng-template #scannerUI>
							<div class="content">
								<div class="window"></div>
								<button mat-flat-button color="accent" (click)="stopScan()">{{'USER.AUTH.STOP_SCAN_BTN' |translate }}</button>
							</div>
						</ng-template>
					</ion-content>
	            `,
	            styles: [],
	            changeDetection: ChangeDetectionStrategy.OnPush,
            } )
export class RegistrationView implements OnInit, OnDestroy{
	public SignupStep = SignupStep;
	
	public canScan:boolean;
	public busy = false;
	
	public step:SignupStep = SignupStep.CheckStudy;
	
	public registrationForm:UntypedFormGroup = new UntypedFormGroup( {
		                                                   key: new UntypedFormControl( '', Validators.required ),
		                                                   code: new UntypedFormControl( '', Validators.required ),
	                                                   } );
	
	public participantForm:UntypedFormGroup = new UntypedFormGroup( {
		                                                  participant: new UntypedFormControl( '' ),
	                                                  } );
	
	public loginForm:UntypedFormGroup = new UntypedFormGroup( {
		                                                  login: new UntypedFormControl( '', Validators.required ),
		                                                  pass: new UntypedFormControl( '', Validators.required ),
	                                                  } );
	
	
	public studyInfo:Partial<Study> | undefined;
	public credentials:StudyParticipantCredentials|undefined;
	
	@ViewChild( 'scannerUI' ) scannerUI!:TemplateRef<unknown>;
	
	constructor(
		public platform:Platform,
		public core:CoreService,
		private _viewContainerRef:ViewContainerRef,
		@Inject( DOCUMENT ) private document:Document,
		public toaster:ToastController,
		public translate:TranslateService,
		public loading:LoadingController,
		public router:Router,
		private cdr:ChangeDetectorRef
	){
		this.canScan = platform.is( 'hybrid' );
		
		if( this.canScan )
			BarcodeScanner.prepare();
	}
	
	ngOnInit():void{
	}
	
	public ngOnDestroy():void{
		if( this.canScan ){
			BarcodeScanner.showBackground();
			this.document.querySelector( 'html' )?.classList.remove( 'scanner-running' );
			BarcodeScanner.stopScan();
		}
		
	}
	
	public async afterScan(){
		this.core.scannerUIPortal = undefined;
		BarcodeScanner.showBackground();
		this.document.querySelector( 'html' )?.classList.remove( 'scanner-running' );
	}
	
	public async stopScan(){
		BarcodeScanner.stopScan();
		this.afterScan();
	}
	
	public async startScan(){
		if( !this.canScan )
			return;
		
		const status = await BarcodeScanner.checkPermission( { force: true } );
		
		if( this.scannerUI )
			this.core.scannerUIPortal = new TemplatePortal( this.scannerUI, this._viewContainerRef );
		
		await BarcodeScanner.hideBackground(); // make background of WebView transparent
		this.document.querySelector( 'html' )?.classList.add( 'scanner-running' );
		
		const result = await BarcodeScanner.startScan(); // start scanning and wait for a result
		
		
		// if the result has content
		if( result.hasContent ){
			const [ key, code ] = result.content?.split( ':', 2 ) || [];
			this.registrationForm.patchValue( { key, code } );
			
			this.afterScan();
		}
	}
	
	
	public async studyCheck(){
		if( !this.registrationForm.valid )
			return;
		
		const loader = await this.loading.create( { spinner: 'crescent' } );
		loader.present();
		
		const data = this.registrationForm.getRawValue();
		this.core.signupCheck( data.key, data.code )
			.pipe(
				catchError( () => of( undefined ) ),
			)
			.subscribe( result => {
				loader.dismiss();
				
				if( !result?.study ){
					this.toaster.create( {
						                     color: 'danger',
						                     message: this.translate.instant( 'USER.SIGNUP.NO_MATCHING_STUDY_AVAILABLE_ERR' ),
						                     duration: 3000,
					                     } ).then( toast => toast.present() );
				}else{
					this.studyInfo = result.study;
					this.step = SignupStep.SignUp;
					this.cdr.markForCheck();
				}
			} );
	}
	
	public async signup(){
		if( this.registrationForm.invalid || this.participantForm.invalid)
			return;
		
		const loader = await this.loading.create( { spinner: 'crescent' } );
		loader.present();
		
		const data = this.registrationForm.getRawValue();
		const participantData = this.participantForm.getRawValue();
		
		this.core.signup( data.key, data.code, participantData.participant )
			.pipe(
				catchError( () => of( undefined ) ),
			)
			.subscribe( result => {
				loader.dismiss();
				
				if( !result?.study ){
					this.toaster.create( {
						                     color: 'danger',
						                     message: this.translate.instant( 'USER.SIGNUP.NO_MATCHING_STUDY_AVAILABLE_ERR' ),
						                     duration: 3000,
					                     } ).then( toast => toast.present() );
				}else{
					this.credentials = result.credentials;
					this.studyInfo = result.study;
					this.loginForm.patchValue({login: this.credentials.username});
					this.step = SignupStep.LogIn;
					this.cdr.markForCheck();
				}
			} );
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
