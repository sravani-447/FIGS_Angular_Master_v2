import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomestaySiteselectionComponent } from './homestay-siteselection.component';

describe('HomestaySiteselectionComponent', () => {
  let component: HomestaySiteselectionComponent;
  let fixture: ComponentFixture<HomestaySiteselectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HomestaySiteselectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomestaySiteselectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
