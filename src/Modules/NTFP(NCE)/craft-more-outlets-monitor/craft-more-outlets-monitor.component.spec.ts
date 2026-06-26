import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CraftMoreOutletsMonitorComponent } from './craft-more-outlets-monitor.component';

describe('CraftMoreOutletsMonitorComponent', () => {
  let component: CraftMoreOutletsMonitorComponent;
  let fixture: ComponentFixture<CraftMoreOutletsMonitorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CraftMoreOutletsMonitorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CraftMoreOutletsMonitorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
