import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NTFPMarketingStallsComponent } from './ntfp-marketing-stalls.component';

describe('NTFPMarketingStallsComponent', () => {
  let component: NTFPMarketingStallsComponent;
  let fixture: ComponentFixture<NTFPMarketingStallsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NTFPMarketingStallsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NTFPMarketingStallsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
