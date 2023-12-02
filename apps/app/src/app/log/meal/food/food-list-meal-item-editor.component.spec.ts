import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FoodListMealItemEditorComponent } from './food-list-meal-item-editor.component';

describe('FoodListMealItemComponent', () => {
  let component: FoodListMealItemEditorComponent;
  let fixture: ComponentFixture<FoodListMealItemEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FoodListMealItemEditorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent( FoodListMealItemEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
