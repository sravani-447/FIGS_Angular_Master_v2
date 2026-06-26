import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LivelihoodDashboardComponent } from './livelihood-dashboard.component';

describe('LivelihoodDashboardComponent', () => {
  let component: LivelihoodDashboardComponent;
  let fixture: ComponentFixture<LivelihoodDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LivelihoodDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LivelihoodDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
