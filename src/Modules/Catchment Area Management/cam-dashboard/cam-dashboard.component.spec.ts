import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CAMDashboardComponent } from './cam-dashboard.component';

describe('CAMDashboardComponent', () => {
  let component: CAMDashboardComponent;
  let fixture: ComponentFixture<CAMDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CAMDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CAMDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
