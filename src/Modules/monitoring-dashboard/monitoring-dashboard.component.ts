import { Component, HostListener, OnInit } from '@angular/core';
import { ServerRequests } from '../../services/ServerRequests';

@Component({
  selector: 'app-monitoring-dashboard',
  templateUrl: './monitoring-dashboard.component.html',
  styleUrls: ['./monitoring-dashboard.component.css']
})
export class MonitoringDashboardComponent implements OnInit {

  isDropdownOpen: { [key: string]: boolean } = {};

  districttype: any[] = [];
  division: any[] = [];
  range: any[] = [];
  beat: any[] = [];
  schematype: string[] = [];
  schemeMaster: any[] = [];
  
  modules: string[] = [];
  subModules: string[] = [];
  forms: string[] = [];

  selectedDistrict: any;
  divisionchange: string[] = []; 
  rangechanged: string[] = []; 
  beatchanged: string[] = [];
  schemaname: any;
  selectedDate: string = '';
  
  selectedModule: string = '';
  selectedSubModule: string = '';
  selectedForm: string = '';
  activeSelectedRow: any = null;
activeSelectedIndex: number = -1;
activeZoomedImage: string | null = null;
zoomedImageTitle: string = '';


  // --- Data States ---
  stats = { activeUsers: 0, capturingData: 0, qcCompleted: 0, pendingQC: 0 };
  allReportData: any[] = [];
  formDataList: any[] = [];

  constructor(public coreservices: ServerRequests) {}

  ngOnInit() {
    this.getallgeo();
    this.getLookups();
    this.selectedDate = new Date().toISOString().split('T')[0];
  }

  getLookups() {
    this.coreservices.getAllLookUps(1).subscribe({
      next: res => {
        this.schemeMaster = res.Data.scheme_master;
        this.schematype = [...new Set(this.schemeMaster.map(item => item.scheme_name))];
      }
    });
  }

  selectedschematype(event: any) {
    const data = this.schemeMaster.find(c => c.scheme_name === event);
    this.schemaname = data ? data.id : '';
  }

  getallgeo() {
    this.coreservices.getAllGeo(1).subscribe({
      next: res => {
        sessionStorage.setItem("jurisdictionDetails", JSON.stringify(res?.Data ?? []));
        this.getjuridictiondetails();
      }
    });
  }

  getjuridictiondetails() {
    const session = sessionStorage.getItem('Session');
    if (!session) return;
    const parsed = JSON.parse(session);
    this.coreservices.getjuridictiondetails(parsed.Data[0].user_id).subscribe({
      next: res => {
        const userdata = res?.Data ?? [];
        if (userdata.length) {
          const jurisdictionObj = JSON.parse(userdata[0].jurisdiction_details);
          this.districttype = jurisdictionObj.Jurisdiction.district;
          this.selectedDistrict = this.districttype[0];
          this.onDistrictChange(this.selectedDistrict);
        }
      }
    });
  }

  toggleDropdown(fieldName: string, event: Event) {
    event.stopPropagation();
    const currentState = this.isDropdownOpen[fieldName];
    this.isDropdownOpen = {}; 
    this.isDropdownOpen[fieldName] = !currentState;
  }

  toggleSelection(fieldName: string, value: string, event: Event) {
    event.stopPropagation();
    
    if (fieldName === 'division') {
      if (this.divisionchange.includes(value)) {
        this.divisionchange = this.divisionchange.filter(v => v !== value);
      } else {
        this.divisionchange.push(value);
      }
      this.subdivisionchange(this.divisionchange);
    } 
    else if (fieldName === 'range') {
      if (this.rangechanged.includes(value)) {
        this.rangechanged = this.rangechanged.filter(v => v !== value);
      } else {
        this.rangechanged.push(value);
      }
      this.rangechange(this.rangechanged);
    }
    else if (fieldName === 'beat') {
      if (this.beatchanged.includes(value)) {
        this.beatchanged = this.beatchanged.filter(v => v !== value);
      } else {
        this.beatchanged.push(value);
      }
    }
  }

  removeChip(fieldName: string, value: string, event: Event) {
    event.stopPropagation(); 
    
    if (fieldName === 'division') {
      this.divisionchange = this.divisionchange.filter(v => v !== value);
      this.subdivisionchange(this.divisionchange);
    } else if (fieldName === 'range') {
      this.rangechanged = this.rangechanged.filter(v => v !== value);
      this.rangechange(this.rangechanged);
    }
  }

  isChecked(fieldName: string, value: string): boolean {
    if (fieldName === 'division') return this.divisionchange.includes(value);
    if (fieldName === 'range') return this.rangechanged.includes(value);
    if (fieldName === 'beat') return this.beatchanged.includes(value);
    return false;
  }
  
  @HostListener('document:click')
  closeAllDropdowns() {
    this.isDropdownOpen = {};
  }

  onDistrictChange(value: any) {
    this.selectedDistrict = value;
    const beats: any[] = JSON.parse(sessionStorage.getItem('jurisdictionDetails') || '[]');
    const districtBeats = beats.filter(b => b?.district_name?.toLowerCase() === value.toLowerCase());
    this.division = Array.from(new Map(districtBeats.map(b => [b.subdivision_id, b.subdivision_name])).values());
  }

  subdivisionchange(subdivisions: any[]) {
    this.divisionchange = subdivisions;
    this.range = []; 
    this.beat = [];
    this.rangechanged = []; 
    this.beatchanged = [];

    const allBeats: any[] = JSON.parse(sessionStorage.getItem('jurisdictionDetails') || '[]');
    const filtered = allBeats.filter(b => subdivisions.includes(b.subdivision_name));
    this.range = Array.from(new Set(filtered.map(b => b.range_name)));
  }

  rangechange(ranges: any[]) {
    this.rangechanged = ranges;
    this.beat = [];
    this.beatchanged = []; 

    const allBeats: any[] = JSON.parse(sessionStorage.getItem('jurisdictionDetails') || '[]');
    const filtered = allBeats.filter(b => ranges.includes(b.range_name));
    this.beat = Array.from(new Set(filtered.map(b => b.beat_name)));
  }

  beatchange(beats: any[]) {
    this.beatchanged = beats;
  }
// 1. Declare this inside your component class
isLoading: boolean = false;

getpendingreport() {
  console.log("Apply Button Clicked");
  
  // Start the loader
  this.isLoading = true;

  const formatParam = (val: any) => {
    if (!val || (Array.isArray(val) && val.length === 0)) return "NA";
    return Array.isArray(val) ? val.join(',') : val;
  };

  const beatParam = formatParam(this.beatchanged);
  const rangeParam = formatParam(this.rangechanged);
  const subDistrictParam = formatParam(this.divisionchange);
  const districtParam = this.selectedDistrict || "NA";
  const dateParam = this.selectedDate || "1900-01-01";
  const schemeParam = this.schemaname || "NA";

  this.coreservices.GetmontoringReport(
    districtParam, 
    rangeParam, 
    schemeParam, 
    beatParam, 
    dateParam
  ).subscribe({
    next: (res: any) => {
      console.log("Data Received:", res); 
    
      if (res && res.Data && res.Data.length > 0) {
        const firstRow = res.Data[0];
        this.stats.activeUsers = firstRow.ActiveUsers;
        this.stats.capturingData = firstRow.CapturingData;
        this.stats.qcCompleted = firstRow.QcCompleted;
        var pendingqc = this.stats.capturingData - this.stats.qcCompleted ;
        this.stats.pendingQC = pendingqc;

        const moduleNames: string[] = res.Data.map((item: any) => String(item.ModuleName));
        this.modules = Array.from(new Set<string>(moduleNames));
        this.allReportData = res.Data; 
      } else {
        this.modules = [];
        this.subModules = [];
        this.forms = [];
        this.allReportData = [];
        this.stats = { activeUsers: 0, capturingData: 0, qcCompleted: 0, pendingQC: 0 };
      }
      
      // Stop the loader on successful data fetch
      this.isLoading = false;
    },
    error: (err) => {
      console.error("Network Error:", err);
      alert("API failed to load. Check console for details.");
      
      // Stop the loader even if the API throws an error
      this.isLoading = false;
    }
  });
}

  onModuleChange(selectedModule: any) {
    this.selectedModule = selectedModule;
    
    // Extract unique SubModules belonging to this Main Module
    const filteredSubModules = this.allReportData
      .filter((item: any) => item.ModuleName === selectedModule)
      .map((item: any) => {
        let subName = item.SubModuleName ? item.SubModuleName.trim() : '';
        
        if (subName.startsWith('SHGSHG')) {
          subName = subName.replace('SHGSHG', 'SHG');
        } 
        else if (subName.startsWith('SHG') && !subName.startsWith('SHG ')) {
          subName = subName.replace('SHG', 'SHG ');
        }
        return subName;
      });

    this.subModules = [...new Set(filteredSubModules)];
    
    // Reset secondary allocations
    this.selectedSubModule = '';
    this.selectedForm = '';
    this.forms = [];
  }

  onSubModuleChange(selectedSubModule: any) {
    this.selectedSubModule = selectedSubModule;
    
    // Extract Form names (ChildModuleName) belonging to this SubModule
    const filteredForms = this.allReportData
      .filter((item: any) => {
        let itemSub = item.SubModuleName ? item.SubModuleName.trim() : '';
        if (itemSub.startsWith('SHGSHG')) itemSub = itemSub.replace('SHGSHG', 'SHG');
        else if (itemSub.startsWith('SHG') && !itemSub.startsWith('SHG ')) itemSub = itemSub.replace('SHG', 'SHG ');
        
        return item.ModuleName === this.selectedModule && itemSub === selectedSubModule;
      })
      .map((item: any) => item.ChildModuleName ? item.ChildModuleName.trim() : '');

    this.forms = [...new Set(filteredForms)];
    this.selectedForm = '';
  }

  onFormChange(val: any) {
    this.selectedForm = val;
    this.GetformData();
  }

GetformData() {
  this.coreservices.GetFormsData(
    this.selectedSubModule,
    this.selectedDate,
    this.schemaname,
    this.selectedForm
  ).subscribe((res: any) => {
    if (res && res.Data) {
      this.formDataList = res.Data.map((row: any) => {
        
        // Reusable Helper Function for parsing the MS JSON Date or ISO Date
        const parseJsonDate = (dateStr: string): string => {
          if (!dateStr) return '';
          
          // Try to match Microsoft JSON format /Date(1234567890)/
          const match = dateStr.match(/\/Date\((\d+)\)\//);
          if (match) {
            const timestamp = parseInt(match[1], 10);
            return new Date(timestamp).toISOString().split('T')[0];
          } 
          
          // Fallback if it is already an ISO string format (contains 'T')
          if (dateStr.includes('T')) {
            return dateStr.split('T')[0];
          }
          
          return dateStr; // Return as-is if fallback doesn't match
        };

        // 1. Process dates using the helper function
        const formattedCreatedAt = parseJsonDate(row.createdat);
        const formattedDateOfMeeting = parseJsonDate(row.date_of_meeting);

        // 2. Map Username
        const username = row.createdby_name || `User ID: ${row.createdby}`; 

        return {
          ...row,
          isExpanded: false,
          createdat: formattedCreatedAt,
          date_of_meeting: formattedDateOfMeeting, // Cleaned date now available
          username: username
        };
      });
    } else {
      this.formDataList = [];
    }
    sessionStorage.setItem('montoring Payload Dashboard', JSON.stringify(this.formDataList));
  });
}

saveRemarks(row: any, index: number) {
  let accept;
  if(row.status == "Incorrect" || row.status == "Duplicate"){
    if( row.remarks == undefined){
      accept = true;
      alert("Please Enter Remarks !");
    }
  }
  if (!accept) {
    this.coreservices.InsertRecords(
      row.status,
      row.remarks,
      this.selectedSubModule,
      this.selectedModule,
      this.selectedForm,
      this.selectedDate,
      row.id
    ).subscribe({
      next: () => {
        alert("Data Saved Successfully");
        this.closeRecordPopup();
        this.GetformData();
      },
      error: (err) => {
        console.error("Error saving data:", err);
        alert("Failed to save data. Please try again.");
      }
    });
  }
   else {
      alert("Please Enter Remarks !");
    }
}

  exportPDF() {
    console.log("PDF download triggered");
  }

  downloadData(row: any, index: number) {
    console.log("JSON Download for row", index);
  }

  isImageUrl(value: any): boolean {
    if (!value || typeof value !== 'string') return false;
    const cleanValue = value.toLowerCase().trim();
    return cleanValue.startsWith('http') && 
           (cleanValue.endsWith('.jpg') || 
            cleanValue.endsWith('.jpeg') || 
            cleanValue.endsWith('.png') || 
            cleanValue.endsWith('.webp') ||
            cleanValue.includes('image'));
  }

  hasImages(row: any): boolean {
    return Object.values(row).some(val => this.isImageUrl(val));
  }

  isValidBase64(value: any): boolean {
    if (!value || typeof value !== 'string') return false;
    return value.trim().length > 100;
  }

  hasBase64Images(row: any): boolean {
    return this.isValidBase64(row.image1) || this.isValidBase64(row.image2);
  }
  // Add these variables at the top of your class definition


// Add these utility methods to open and close the modal view
openRecordPopup(row: any, index: number) {
  this.activeSelectedRow = row;
  this.activeSelectedIndex = index;
}

closeRecordPopup() {
  this.activeSelectedRow = null;
  this.activeSelectedIndex = -1;
}

// Add these variables alongside your other modal variables

// Methods to handle image popup toggle
zoomImage(base64String: string, title: string) {
  this.activeZoomedImage = base64String;
  this.zoomedImageTitle = title;
}

closeZoom() {
  this.activeZoomedImage = null;
  this.zoomedImageTitle = '';
}
}