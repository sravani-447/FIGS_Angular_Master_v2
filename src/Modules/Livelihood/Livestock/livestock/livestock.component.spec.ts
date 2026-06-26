import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LivestockComponent } from './livestock.component';

describe('LivestockComponent', () => {
  let component: LivestockComponent;
  let fixture: ComponentFixture<LivestockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LivestockComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LivestockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
