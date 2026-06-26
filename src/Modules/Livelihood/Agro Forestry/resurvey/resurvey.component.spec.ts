import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResurveyComponent } from './resurvey.component';

describe('ResurveyComponent', () => {
  let component: ResurveyComponent;
  let fixture: ComponentFixture<ResurveyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ResurveyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResurveyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
