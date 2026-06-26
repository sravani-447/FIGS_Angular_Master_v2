import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckDamdetailsComponent } from './check-damdetails.component';

describe('CheckDamdetailsComponent', () => {
  let component: CheckDamdetailsComponent;
  let fixture: ComponentFixture<CheckDamdetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CheckDamdetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CheckDamdetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
