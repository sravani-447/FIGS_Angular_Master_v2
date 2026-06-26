import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetUpdationComponent } from './asset-updation.component';

describe('AssetUpdationComponent', () => {
  let component: AssetUpdationComponent;
  let fixture: ComponentFixture<AssetUpdationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AssetUpdationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssetUpdationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
