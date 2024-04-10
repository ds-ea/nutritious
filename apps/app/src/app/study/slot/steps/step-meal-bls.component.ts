import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AbstractStepComponent } from './abstract-step.component';


@Component( {
	changeDetection: ChangeDetectionStrategy.OnPush,
	selector: 'nutri-step-meal-bls',
	template: `
		<meal-bls></meal-bls>
	`,
} )
export class StepMealBlsComponent extends AbstractStepComponent<never, unknown>{

}
