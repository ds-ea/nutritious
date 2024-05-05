import { ChangeDetectorRef, Directive, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Dayjs } from 'dayjs';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatchedSlot, SafeStep } from '../../../../../../../libs/core/src';


export type StepProgressState = 'pending' | 'incomplete' | 'error' | 'done-with-skips' | 'done' | 'completed';
const doneStates:StepProgressState[] = [ 'done-with-skips', 'done', 'completed' ] as const;

export type StepProgress = {
	state:StepProgressState
};
export type StepCompleteEvent<T> = {
	stepId:SafeStep['id'];
	done:boolean;
	progress:StepProgress;
	data?:T;
};

@Directive()
export abstract class AbstractStepComponent<RefType = unknown, ResponseDataType = unknown> implements OnInit, OnDestroy{
	private _destroyed$ = new ReplaySubject<boolean>( 1 );

	@Input()
	slot!:MatchedSlot;

	@Input()
	step!:SafeStep;

	@Input()
	ref?:RefType;

	@Input()
	data?:ResponseDataType;

	@Output()
	dataChanged = new EventEmitter<ResponseDataType>;

	@Input()
	entryDate?:Dayjs;

	@Input( 'progress' )
	progressEmitter:EventEmitter<StepProgress> | undefined;
	protected _progress:StepProgress = { state: 'done' };
	set progress( progress:StepProgress ){
		this._progress = progress;
		this.progressEmitter?.next( progress );
	}

	get progress(){
		return this._progress;
	}

	@Input()
	triggerComplete:EventEmitter<boolean> | undefined;

	@Input()
	onComplete:EventEmitter<StepCompleteEvent<ResponseDataType>> | undefined;

	constructor(
		protected cdr:ChangeDetectorRef,
	){
	}

	public ngOnDestroy():void{
		this._destroyed$.next( true );
		this._destroyed$.unsubscribe();
	}

	public ngOnInit():void{
		this.progressEmitter?.next( this._progress );
		this.triggerComplete
			?.pipe( takeUntil( this._destroyed$ ) )
			.subscribe( () => {
				this.validateAndComplete();
			} );
	}


	public validateAndComplete(){
		this.complete();
	}

	public complete(){
		if( !this.onComplete )
			console.warn( 'step complete called, but no complete output present' );
		else
			this.onComplete.next( {
				stepId: this.step.id,
				data: this.data,
				progress: this.progress,
				done: doneStates.includes( this.progress.state ),
			} );
	}


}
