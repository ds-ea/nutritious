import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogMealComponent } from './log-meal.component';

describe('MealComponent', () => {
  let component: LogMealComponent;
  let fixture: ComponentFixture<LogMealComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LogMealComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent( LogMealComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
