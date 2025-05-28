import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import dayjs from 'dayjs';


@Component( {
	selector: 'day-selector-component',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<div class="ion-padding">

			<h1>{{ 'STUDY.MSG_SELECT_DAY_FOR_ENTRY'|translate }}</h1>

			<ion-list lines="none">
				@for (day of availableDates; track day) {
					<ion-item
						button="true"
						detail="false"
						(click)="selectDay(day)"
					>
						<ion-label class="day-of-week">{{ toDate(day) | date:'EEEE' }}</ion-label>
						<ion-label>{{ toDate(day) | date:'mediumDate' }}</ion-label>
					</ion-item>
				}
			</ion-list>
		</div>
	`,
} )

export class DaySelectorComponentComponent{

	@Input()
	availableDates:dayjs.Dayjs[] | undefined;

	constructor(
		public readonly modalCtrl:ModalController,
	){ }


	public selectDay( day:dayjs.Dayjs ){
		this.modalCtrl.dismiss( { day } );
	}

	public toDate( day:dayjs.Dayjs ):Date{
		return day.toDate();
	}

}
