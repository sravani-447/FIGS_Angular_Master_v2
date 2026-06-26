import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SHGDashboardComponent } from './shg-dashboard.component';

describe('SHGDashboardComponent', () => {
  let component: SHGDashboardComponent;
  let fixture: ComponentFixture<SHGDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SHGDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SHGDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
