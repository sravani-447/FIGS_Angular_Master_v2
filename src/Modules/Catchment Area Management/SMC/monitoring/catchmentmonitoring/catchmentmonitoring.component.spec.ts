import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CatchmentmonitoringComponent } from './catchmentmonitoring.component';

describe('CatchmentmonitoringComponent', () => {
  let component: CatchmentmonitoringComponent;
  let fixture: ComponentFixture<CatchmentmonitoringComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CatchmentmonitoringComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CatchmentmonitoringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
