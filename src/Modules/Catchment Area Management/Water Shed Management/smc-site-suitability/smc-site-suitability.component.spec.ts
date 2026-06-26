import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmcSiteSuitabilityComponent } from './smc-site-suitability.component';

describe('SmcSiteSuitabilityComponent', () => {
  let component: SmcSiteSuitabilityComponent;
  let fixture: ComponentFixture<SmcSiteSuitabilityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SmcSiteSuitabilityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SmcSiteSuitabilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
