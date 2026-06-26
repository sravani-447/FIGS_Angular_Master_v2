import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlantationCreationComponent } from './plantation-creation.component';

describe('PlantationCreationComponent', () => {
  let component: PlantationCreationComponent;
  let fixture: ComponentFixture<PlantationCreationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlantationCreationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlantationCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
