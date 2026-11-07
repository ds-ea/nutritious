import { ChangeDetectionStrategy, Component, OnChanges, SimpleChanges } from '@angular/core';
import { ContentContainer, SafeStudyContent } from '../../../../../../../libs/core/src';
import { AbstractStepComponent } from './abstract-step.component';


@Component( {
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'nutri-step-content',
    template: `
		<mat-card>
			<mat-card-content>
				<markdown [data]="markdown || ''"></markdown>
			</mat-card-content>
		</mat-card>
	`,
    standalone: false
} )
export class StepContentComponent extends AbstractStepComponent<SafeStudyContent, unknown> implements OnChanges{

	public markdown?:string;

	public ngOnChanges( changes:SimpleChanges ):void{
		if( 'ref' in changes ){
			const value = changes['ref'].currentValue as SafeStudyContent;
			const content = value.content as ContentContainer;
			this.markdown = content.md?.data || undefined;
			this.cdr.markForCheck();
		}
	}

}
