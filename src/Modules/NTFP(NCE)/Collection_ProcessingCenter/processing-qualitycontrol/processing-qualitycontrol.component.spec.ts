import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessingQualitycontrolComponent } from './processing-qualitycontrol.component';

describe('ProcessingQualitycontrolComponent', () => {
  let component: ProcessingQualitycontrolComponent;
  let fixture: ComponentFixture<ProcessingQualitycontrolComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProcessingQualitycontrolComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProcessingQualitycontrolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
