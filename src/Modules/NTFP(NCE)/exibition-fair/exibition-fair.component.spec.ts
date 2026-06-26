import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExibitionFairComponent } from './exibition-fair.component';

describe('ExibitionFairComponent', () => {
  let component: ExibitionFairComponent;
  let fixture: ComponentFixture<ExibitionFairComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExibitionFairComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExibitionFairComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
