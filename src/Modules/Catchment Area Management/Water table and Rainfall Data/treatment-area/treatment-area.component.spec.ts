import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreatmentAreaComponent } from './treatment-area.component';

describe('TreatmentAreaComponent', () => {
  let component: TreatmentAreaComponent;
  let fixture: ComponentFixture<TreatmentAreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TreatmentAreaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TreatmentAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
