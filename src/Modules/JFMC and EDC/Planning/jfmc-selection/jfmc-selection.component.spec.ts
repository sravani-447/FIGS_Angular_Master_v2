import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JFMCSelectionComponent } from './jfmc-selection.component';

describe('JFMCSelectionComponent', () => {
  let component: JFMCSelectionComponent;
  let fixture: ComponentFixture<JFMCSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [JFMCSelectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JFMCSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
