import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NtfpPlanningComponent } from './ntfp-planning.component';

describe('NtfpPlanningComponent', () => {
  let component: NtfpPlanningComponent;
  let fixture: ComponentFixture<NtfpPlanningComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NtfpPlanningComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NtfpPlanningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
