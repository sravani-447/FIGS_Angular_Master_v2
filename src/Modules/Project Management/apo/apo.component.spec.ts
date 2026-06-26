import { ComponentFixture, TestBed } from '@angular/core/testing';

import { APOComponent } from './apo.component';

describe('APOComponent', () => {
  let component: APOComponent;
  let fixture: ComponentFixture<APOComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [APOComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(APOComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
