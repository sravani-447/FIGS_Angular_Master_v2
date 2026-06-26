import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendenceReportComponent } from './attendence-report.component';

describe('AttendenceReportComponent', () => {
  let component: AttendenceReportComponent;
  let fixture: ComponentFixture<AttendenceReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AttendenceReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttendenceReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
