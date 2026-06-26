import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LivestockPlanningComponent } from './livestock-planning.component';

describe('LivestockPlanningComponent', () => {
  let component: LivestockPlanningComponent;
  let fixture: ComponentFixture<LivestockPlanningComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LivestockPlanningComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LivestockPlanningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
