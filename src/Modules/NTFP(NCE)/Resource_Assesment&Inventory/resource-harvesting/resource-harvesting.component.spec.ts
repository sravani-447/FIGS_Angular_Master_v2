import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResourceHarvestingComponent } from './resource-harvesting.component';

describe('ResourceHarvestingComponent', () => {
  let component: ResourceHarvestingComponent;
  let fixture: ComponentFixture<ResourceHarvestingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ResourceHarvestingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResourceHarvestingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
