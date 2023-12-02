import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';


@Component( {
	            selector: 'app-splash',
	            host: { 'class': 'SplashPage page' },
	            template: `
					<ion-content>
						<div slot="fixed">
							<h1>Fixed Content</h1>
						</div>
						
						<div class="card">
							<p>text text</p>
							<ngx-colors ngx-colors-trigger [(ngModel)]="color" (change)="applyColor('accent', $event)"></ngx-colors>
							<input [(ngModel)]="color" />
						</div>
						
						<hr/>
						<div style="background: var(--color-accent); width: 100%; height: 20px;"></div>
						
					</ion-content>
	            `,
            } )
export class SplashComponent implements OnInit{
	
	public color:string = '#3d4d68';
	
	constructor(
		@Inject( DOCUMENT ) private document:Document,
	){ }
	
	ngOnInit(){
	
	}
	
	public applyColor( color:string, value:string ){
		this.document.documentElement.style.setProperty( '--color-' + color, value );
	}
	
}
