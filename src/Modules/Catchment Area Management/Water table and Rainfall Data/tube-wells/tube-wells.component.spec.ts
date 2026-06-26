import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TubeWellsComponent } from './tube-wells.component';

describe('TubeWellsComponent', () => {
  let component: TubeWellsComponent;
  let fixture: ComponentFixture<TubeWellsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TubeWellsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TubeWellsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
