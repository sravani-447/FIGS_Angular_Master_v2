import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LivestockMonitoringComponent } from './livestock-monitoring.component';

describe('LivestockMonitoringComponent', () => {
  let component: LivestockMonitoringComponent;
  let fixture: ComponentFixture<LivestockMonitoringComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LivestockMonitoringComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LivestockMonitoringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
