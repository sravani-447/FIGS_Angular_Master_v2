import { Component, OnInit, ViewChild, ChangeDetectorRef } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ServerRequests } from "../../../services/ServerRequests";
import { GridColumn } from "../../../shared/Grids/grid-column.model";
import { CustomGridComponent } from "../../../shared/Grids/custom-grid.component";

@Component({
  selector: 'app-attendence-report',
  templateUrl: './attendence-report.component.html',
  styleUrl: './attendence-report.component.css'
})
export class AttendenceReportComponent implements OnInit {
  @ViewChild('grid') gridComponent!: CustomGridComponent;
  
  userid: any;
  data: any[] = [];
  masterData: any[] = []; 
  employeeList: any[] = []; 
  
  // Filter Models
  selectedEmp: string = '';
  fromDate: string = '';
  toDate: string = '';

  // Columns exactly as per the screenshot
  columns: GridColumn[] = [
    { field: 'designation_name', header: 'Designation' },
    { field: 'user_name', header: 'user name' },
    { field: 'checkin', header: 'checkin' },
    { field: 'checkout', header: 'checkout' },
    { field: 'status', header: 'status' },
    { field: 'checkout_type', header: 'checkout type' },
    { field: 'lat_checkin', header: 'lat checkin' },
    { field: 'lng_checkin', header: 'lng checkin' },
    { field: 'image1_name', header: 'image1 name' },
    { field: 'image2_name', header: 'image2 name' },
    { field: 'createdby', header: 'createdby' },
    { field: 'createdat', header: 'createdat' },
    { field: 'lat_checkout', header: 'lat checkout' },
    { field: 'lng_checkout', header: 'lng checkout' },
    { field: 'total_hour', header: 'total hour' }
  ];

  constructor(
    private coreservices: ServerRequests,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    const session = sessionStorage.getItem("Session");
    if (session) {
      const sessionDetails = JSON.parse(session);
      this.userid = sessionDetails.Data[0].user_id;
    }
  }

  ngOnInit(): void {
    this.LoadAttendenceReport();
  }

LoadAttendenceReport() {
  this.coreservices.getAttendenceDetails().subscribe({
    next: (res: any) => {
      const responseObj = typeof res === 'string' ? JSON.parse(res) : res;
      let rawList = responseObj.Data || [];
      if (typeof rawList === 'string') rawList = JSON.parse(rawList);

    // Inside LoadAttendenceReport success block:
this.masterData = rawList.map((item: any) => ({
  ...item,
  // Save raw date for accurate filtering later
  checkin_raw: item.checkin, 
  checkout_raw: item.checkout,
  pmattendance:true,
  
  // Format dates for display in table
  user_name: item.user_name ? item.user_name.trim() : '',
  checkin: this.formatTableDate(item.checkin),
  checkout: this.formatTableDate(item.checkout),
  
  pmattendancereport: true 
}));

this.data = [...this.masterData];
      
      // Populate Dropdown
      const names = [...new Set(this.masterData.map(i => i.user_name))];
      this.employeeList = names.filter(n => !!n).map(n => ({ label: n, value: n }));

      this.cdr.detectChanges();
    }
  });
}

// Helper function to make dates look good in the table
formatTableDate(dateStr: string) {
  if (!dateStr || dateStr === 'null') return '-';
  
  // Converts "2025-06-12T18:12:49" to "12-06-2025 18:12"
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const mins = String(date.getMinutes()).padStart(2, '0');
  
  return `${day}-${month}-${year} ${hours}:${mins}`;
}


clearFilters() {
  // 1. Reset all filter models
  this.selectedEmp = '';
  this.fromDate = '';
  this.toDate = '';

  // 2. Restore table to full master list
  this.data = [...this.masterData];

  // 3. Provide feedback and trigger change detection
  this.snackBar.open('Filters cleared. Showing all records.', 'Close', { 
    duration: 2000,
    panelClass: ['snackbar-info'] 
  });
  
  this.cdr.detectChanges();
}

onFilterView() {
  // 1. Start with the full list of data
  let filtered = [...this.masterData];

  // 2. Filter by Employee Name (if selected)
  if (this.selectedEmp) {
    // We use trim() just in case there are trailing spaces in the master data
    filtered = filtered.filter(row => row.user_name.trim() === this.selectedEmp.trim());
  }

  // 3. Filter by Date Range
  // HTML Date inputs return strings like "YYYY-MM-DD"
  if (this.fromDate) {
    const start = new Date(this.fromDate);
    start.setHours(0, 0, 0, 0); // Start of the day

    filtered = filtered.filter(row => {
      const checkinDate = new Date(row.checkin_raw || row.checkin); // Use raw date if available
      return checkinDate >= start;
    });
  }

  if (this.toDate) {
    const end = new Date(this.toDate);
    end.setHours(23, 59, 59, 999); // End of the day

    filtered = filtered.filter(row => {
      const checkinDate = new Date(row.checkin_raw || row.checkin);
      return checkinDate <= end;
    });
  }

  // 4. Update the table and refresh the UI
  this.data = filtered;
  
  if (this.data.length === 0) {
    this.snackBar.open('No records found for the selected filters', 'Close', { duration: 3000 });
  } else {
    this.snackBar.open(`Found ${this.data.length} records`, 'Close', { duration: 2000 });
  }

  this.cdr.detectChanges(); // Force the grid to update
}

  onGridAction(event: any) {
  }
}