import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataDumpComponent } from './data-dump.component';
import { ServerRequests } from '../../../services/ServerRequests';

describe('DataDumpComponent', () => {
  let component: DataDumpComponent;
  let fixture: ComponentFixture<DataDumpComponent>;
  let mockServerRequests: jasmine.SpyObj<ServerRequests>;

  beforeEach(async () => {
    mockServerRequests = jasmine.createSpyObj('ServerRequests', ['uploadDataDump']);

    await TestBed.configureTestingModule({
      declarations: [DataDumpComponent],
      providers: [
        { provide: ServerRequests, useValue: mockServerRequests }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DataDumpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should validate Excel files correctly', () => {
    const mockFile = new File(['content'], 'test.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    component.selectedFile = mockFile;
    expect(component.isValidExcelFile()).toBeTruthy();
  });

  it('should reject non-Excel files', () => {
    const mockFile = new File(['content'], 'test.txt', {
      type: 'text/plain'
    });
    component.selectedFile = mockFile;
    expect(component.isValidExcelFile()).toBeFalsy();
  });
});
