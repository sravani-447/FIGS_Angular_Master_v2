import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EcoTourismSiteselectionComponent } from './eco-tourism-siteselection.component';

describe('EcoTourismSiteselectionComponent', () => {
  let component: EcoTourismSiteselectionComponent;
  let fixture: ComponentFixture<EcoTourismSiteselectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EcoTourismSiteselectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EcoTourismSiteselectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
