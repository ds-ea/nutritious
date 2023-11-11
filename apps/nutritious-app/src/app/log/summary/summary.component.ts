import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { LogEntry } from '../../../interfaces/log.interface';


@Component( {
	            selector: 'log-summary',
	            template: `
					<ion-note >{{'LOG.SUMMARY.ALL_DONE_MSG' | translate}}</ion-note>
					
					<div class="log-footer">
						<a routerLink="/study" mat-flat-button color="primary">{{( 'LOG.SUMMARY.GOTO_DASHBOARD_BTN_' + rndBtnNum ) | translate}}</a>
					</div>
	            `,
	            styles: [],
	            changeDetection: ChangeDetectionStrategy.OnPush,
            } )
export class SummaryComponent implements OnInit{
	public rndBtnNum = Math.floor( Math.random() * ( 2 - 0 + 1 ) + 0 );
	
	@Input() log:LogEntry | undefined;
	@Output() done = new EventEmitter<LogEntry>();
	
	constructor(){ }
	
	ngOnInit():void{
	}
	
}
