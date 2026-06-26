import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NtfpProductionComponent } from './ntfp-production.component';

describe('NtfpProductionComponent', () => {
  let component: NtfpProductionComponent;
  let fixture: ComponentFixture<NtfpProductionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NtfpProductionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NtfpProductionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
