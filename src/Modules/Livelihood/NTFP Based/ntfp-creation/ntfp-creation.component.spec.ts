import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NtfpCreationComponent } from './ntfp-creation.component';

describe('NtfpCreationComponent', () => {
  let component: NtfpCreationComponent;
  let fixture: ComponentFixture<NtfpCreationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NtfpCreationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NtfpCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
