import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FMDashboardComponent } from './fm-dashboard.component';

describe('FMDashboardComponent', () => {
  let component: FMDashboardComponent;
  let fixture: ComponentFixture<FMDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FMDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FMDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
