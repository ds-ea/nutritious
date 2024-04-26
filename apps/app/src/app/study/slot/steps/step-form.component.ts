import { ChangeDetectionStrategy, Component, EventEmitter } from '@angular/core';
import { FormResponseData, SafeStudyForm } from '../../../../../../../libs/core/src';
import { StudyFormSubmitResult } from '../../components/form/study-form.component';
import { AbstractStepComponent, StepProgress } from './abstract-step.component';


@Component( {
	changeDetection: ChangeDetectionStrategy.OnPush,
	selector: 'nutri-step-form',
	template: `

		<study-form [form]="ref" [data]="data"
					[refs]="slot.refs"
					[triggerValidation]="triggerValidation"
					(submit)="onSubmit($event)"
					(state)="updateState($event)"
		/>

	`,
} )
export class StepFormComponent extends AbstractStepComponent<SafeStudyForm, FormResponseData>{

	public triggerValidation = new EventEmitter<boolean>();

	protected override _progress:StepProgress = { state: 'pending' };

	public updateState( state:StepProgress ){
		this.progress = { state: state.state };
	}


	public override validateAndComplete(){
		this.triggerValidation.next( true );
	}

	public onSubmit( result:StudyFormSubmitResult ){
		this.progress = { state: result.skippedOptionals ? 'done-with-skips' : 'done' };
		this.data = result.data;
		this.dataChanged.next( result.data );
		this.complete();
	}
}
