import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FisheriesPlanningComponent } from './fisheries-planning.component';

describe('FisheriesPlanningComponent', () => {
  let component: FisheriesPlanningComponent;
  let fixture: ComponentFixture<FisheriesPlanningComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FisheriesPlanningComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FisheriesPlanningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
