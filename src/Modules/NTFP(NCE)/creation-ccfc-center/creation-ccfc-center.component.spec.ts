import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreationCCFCCenterComponent } from './creation-ccfc-center.component';

describe('CreationCCFCCenterComponent', () => {
  let component: CreationCCFCCenterComponent;
  let fixture: ComponentFixture<CreationCCFCCenterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreationCCFCCenterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreationCCFCCenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
