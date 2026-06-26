import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HarvastingComponent } from './harvasting.component';

describe('HarvastingComponent', () => {
  let component: HarvastingComponent;
  let fixture: ComponentFixture<HarvastingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HarvastingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HarvastingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
