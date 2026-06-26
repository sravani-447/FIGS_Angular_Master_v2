import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreationCraftMoreoutletsComponent } from './creation-craft-moreoutlets.component';

describe('CreationCraftMoreoutletsComponent', () => {
  let component: CreationCraftMoreoutletsComponent;
  let fixture: ComponentFixture<CreationCraftMoreoutletsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreationCraftMoreoutletsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreationCraftMoreoutletsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
