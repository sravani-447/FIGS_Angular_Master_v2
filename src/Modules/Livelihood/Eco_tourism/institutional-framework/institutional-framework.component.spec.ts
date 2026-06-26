import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstitutionalFrameworkComponent } from './institutional-framework.component';

describe('InstitutionalFrameworkComponent', () => {
  let component: InstitutionalFrameworkComponent;
  let fixture: ComponentFixture<InstitutionalFrameworkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InstitutionalFrameworkComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstitutionalFrameworkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
