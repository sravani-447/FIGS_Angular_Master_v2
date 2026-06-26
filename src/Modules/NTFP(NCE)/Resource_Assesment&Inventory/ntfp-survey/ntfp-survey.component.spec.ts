import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NTFPSurveyComponent } from './ntfp-survey.component';

describe('NTFPSurveyComponent', () => {
  let component: NTFPSurveyComponent;
  let fixture: ComponentFixture<NTFPSurveyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NTFPSurveyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NTFPSurveyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
