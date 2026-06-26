import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JFMCDataEntryComponent } from './jfmc-data-entry.component';

describe('JFMCDataEntryComponent', () => {
  let component: JFMCDataEntryComponent;
  let fixture: ComponentFixture<JFMCDataEntryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [JFMCDataEntryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JFMCDataEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
