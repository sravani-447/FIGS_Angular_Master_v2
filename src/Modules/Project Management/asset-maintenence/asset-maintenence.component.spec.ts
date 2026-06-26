import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetMaintenenceComponent } from './asset-maintenence.component';

describe('AssetMaintenenceComponent', () => {
  let component: AssetMaintenenceComponent;
  let fixture: ComponentFixture<AssetMaintenenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AssetMaintenenceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssetMaintenenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
