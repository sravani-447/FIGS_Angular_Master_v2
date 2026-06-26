import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpeciesdetailsComponent } from './speciesdetails.component';

describe('SpeciesdetailsComponent', () => {
  let component: SpeciesdetailsComponent;
  let fixture: ComponentFixture<SpeciesdetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SpeciesdetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpeciesdetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
