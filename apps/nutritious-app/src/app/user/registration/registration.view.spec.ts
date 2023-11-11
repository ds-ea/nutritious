import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrationView } from './registration.view';

describe('RegistrationView', () => {
  let component: RegistrationView;
  let fixture: ComponentFixture<RegistrationView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegistrationView ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistrationView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
