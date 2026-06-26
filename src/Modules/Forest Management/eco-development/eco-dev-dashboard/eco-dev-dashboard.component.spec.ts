import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EcoDevDashboardComponent } from './eco-dev-dashboard.component';

describe('EcoDevDashboardComponent', () => {
  let component: EcoDevDashboardComponent;
  let fixture: ComponentFixture<EcoDevDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EcoDevDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EcoDevDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
