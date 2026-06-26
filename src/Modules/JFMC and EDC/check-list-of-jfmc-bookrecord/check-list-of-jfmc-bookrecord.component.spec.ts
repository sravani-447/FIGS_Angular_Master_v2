import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckListOfJfmcBookrecordComponent } from './check-list-of-jfmc-bookrecord.component';

describe('CheckListOfJfmcBookrecordComponent', () => {
  let component: CheckListOfJfmcBookrecordComponent;
  let fixture: ComponentFixture<CheckListOfJfmcBookrecordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CheckListOfJfmcBookrecordComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CheckListOfJfmcBookrecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
