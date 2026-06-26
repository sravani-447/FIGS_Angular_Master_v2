import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TechnicalDetailsComponent } from './technical-details.component';

describe('TechnicalDetailsComponent', () => {
  let component: TechnicalDetailsComponent;
  let fixture: ComponentFixture<TechnicalDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TechnicalDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TechnicalDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
