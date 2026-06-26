import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MicroPlanningComponent } from './micro-planning.component';

describe('MicroPlanningComponent', () => {
  let component: MicroPlanningComponent;
  let fixture: ComponentFixture<MicroPlanningComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MicroPlanningComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MicroPlanningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
