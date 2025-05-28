import { ChangeDetectionStrategy, Component, EventEmitter } from '@angular/core';
import { MealBLSResponseData } from '../../../../../../../libs/core/src';
import { MealBLSSubmitResult } from '../../components/meal-bls/meal-bls.component';
import { AbstractStepComponent, StepProgress } from './abstract-step.component';

// TODO: improve config typing and use

@Component( {
	changeDetection: ChangeDetectionStrategy.OnPush,
	selector: 'nutri-step-meal-bls',
	template: `
		<meal-bls
			[data]="data"
			[meal]="slot.prepared.key"
			[mealSelection]="$any(step.config?.['mealSelect'])"
			[dateSelection]="$any(step.config?.['lockDate'])"
			[entryDate]="entryDate"
			[triggerValidation]="triggerValidation"
			(submit)="onSubmit($event)"
			(state)="updateState($event)"
		></meal-bls>
	`,
} )
export class StepMealBlsComponent extends AbstractStepComponent<never, MealBLSResponseData>{

	public triggerValidation = new EventEmitter<boolean>();

	protected override _progress:StepProgress = { state: 'pending' };

	public updateState( state:StepProgress ){
		this.progress = { state: state.state };
	}


	public override validateAndComplete(){
		this.triggerValidation.next( true );
	}

	public onSubmit( result:MealBLSSubmitResult ){
		this.progress = { state: 'done' };
		this.data = result.data;
		this.dataChanged.next( result.data );
		this.complete();
	}

}
