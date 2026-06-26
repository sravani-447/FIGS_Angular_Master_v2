import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JfmcDashboardComponent } from './jfmc-dashboard.component';

describe('JfmcDashboardComponent', () => {
  let component: JfmcDashboardComponent;
  let fixture: ComponentFixture<JfmcDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [JfmcDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JfmcDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
