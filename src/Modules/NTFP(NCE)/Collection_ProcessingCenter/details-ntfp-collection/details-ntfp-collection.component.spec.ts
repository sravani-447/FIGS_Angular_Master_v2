import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsNTFPCollectionComponent } from './details-ntfp-collection.component';

describe('DetailsNTFPCollectionComponent', () => {
  let component: DetailsNTFPCollectionComponent;
  let fixture: ComponentFixture<DetailsNTFPCollectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DetailsNTFPCollectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailsNTFPCollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
