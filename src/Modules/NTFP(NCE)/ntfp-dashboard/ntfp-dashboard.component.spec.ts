import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NTFPDashboardComponent } from './ntfp-dashboard.component';

describe('NTFPDashboardComponent', () => {
  let component: NTFPDashboardComponent;
  let fixture: ComponentFixture<NTFPDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NTFPDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NTFPDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
