import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockPositionComponent } from './stock-position.component';

describe('StockPositionComponent', () => {
  let component: StockPositionComponent;
  let fixture: ComponentFixture<StockPositionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StockPositionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StockPositionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
