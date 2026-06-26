import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LivelihoodMonitoringComponent } from './livelihood-monitoring.component';

describe('LivelihoodMonitoringComponent', () => {
  let component: LivelihoodMonitoringComponent;
  let fixture: ComponentFixture<LivelihoodMonitoringComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LivelihoodMonitoringComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LivelihoodMonitoringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
