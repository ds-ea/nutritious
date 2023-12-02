import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-food-picker',
  template: `
    <ion-searchbar></ion-searchbar>
  `,
  styles: [
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FoodPickerComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
