import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogQuestionsComponent } from './log-questions.component';

describe('QuestionsComponent', () => {
  let component: LogQuestionsComponent;
  let fixture: ComponentFixture<LogQuestionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LogQuestionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent( LogQuestionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
