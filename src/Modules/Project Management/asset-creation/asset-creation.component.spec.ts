import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetCreationComponent } from './asset-creation.component';

describe('AssetCreationComponent', () => {
  let component: AssetCreationComponent;
  let fixture: ComponentFixture<AssetCreationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AssetCreationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssetCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
