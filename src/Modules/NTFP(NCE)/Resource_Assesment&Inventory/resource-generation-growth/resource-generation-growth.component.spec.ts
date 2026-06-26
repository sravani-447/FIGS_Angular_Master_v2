import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResourceGenerationGrowthComponent } from './resource-generation-growth.component';

describe('ResourceGenerationGrowthComponent', () => {
  let component: ResourceGenerationGrowthComponent;
  let fixture: ComponentFixture<ResourceGenerationGrowthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ResourceGenerationGrowthComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResourceGenerationGrowthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
