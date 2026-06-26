import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LivelihoodMarketOutreachComponent } from './livelihood-market-outreach.component';

describe('LivelihoodMarketOutreachComponent', () => {
  let component: LivelihoodMarketOutreachComponent;
  let fixture: ComponentFixture<LivelihoodMarketOutreachComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LivelihoodMarketOutreachComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LivelihoodMarketOutreachComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
