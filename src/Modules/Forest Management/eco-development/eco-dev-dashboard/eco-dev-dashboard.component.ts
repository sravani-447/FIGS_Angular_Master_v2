import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ServerRequests } from '../../../../services/ServerRequests';
import { DashboardConfig, WidgetItem } from '../../../../models/dashboard.model';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-eco-dev-dashboard',
  templateUrl: './eco-dev-dashboard.component.html',
  styleUrls: ['./eco-dev-dashboard.component.css']
})
export class EcoDevDashboardComponent implements OnInit {
  
  dashboardConfig!: DashboardConfig;
  userJurisdiction: any;

  // Selection States
  selectedDistrict: any;
  selectedSubDivision: any;
  selectedRange: any;
  selectedBeat: any;
  selectedJFMC: any;
  selectedScheme: any;

  fromDate: string = '';
toDate: string = '';

  constructor(public coreservices: ServerRequests, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.initializeConfig();
    this.getLookups();

    // Fetch Jurisdiction exactly like the working codes
    const session = sessionStorage.getItem("Session");
    if (session) {
      const sessionObj = JSON.parse(session);
      this.userJurisdiction = JSON.parse(sessionObj.Data[0].jurisdiction_details).Jurisdiction;
      this.loadJurisdictionDropdowns();
    }
  }

  initializeConfig() {
    this.dashboardConfig = {
      title: 'ECO DEVELOPMENT DASHBOARD',
      filters: [
        { key: 'scheme', label: 'Scheme Type', options: [], value: '' },
        { key: 'district', label: 'District', options: [], value: '' },
        { key: 'subdivision', label: 'Sub Division', options: [], value: '' },
        { key: 'range', label: 'Range', options: [], value: '' },
        { key: 'beat', label: 'Beat', options: [], value: '' },
        { key: 'jfmc', label: 'JFMC', options: [], value: '' }
      ],
      kpis: [],
      widgets: [],
     fromDate: '', 
    toDate: ''    
  } as any; 
}

  updateUI(): void {
    this.dashboardConfig = { ...this.dashboardConfig };
    this.cdr.detectChanges();
  }

  getLookups() {
    this.coreservices.getAllLookUps(1).subscribe((res: any) => {
      const schemeFilter = this.dashboardConfig.filters.find(x => x.key === 'scheme');
      if (schemeFilter && res?.Data?.scheme_master) {
        schemeFilter.options = res.Data.scheme_master.map((s: any) => s.scheme_name);
        this.updateUI();
      }
    });
  }

  // Load Restricted Dropdowns based on Session
  loadJurisdictionDropdowns() {
    if (!this.userJurisdiction) return;

    const districtFilter = this.dashboardConfig.filters.find(f => f.key === 'district');
    if (districtFilter) {
      districtFilter.options = this.userJurisdiction.district;
      districtFilter.value = this.userJurisdiction.district[0];
      this.selectedDistrict = districtFilter.value;
    }

    const subFilter = this.dashboardConfig.filters.find(f => f.key === 'subdivision');
    if (subFilter) {
      subFilter.options = this.userJurisdiction.sub_division;
      subFilter.value = this.userJurisdiction.sub_division[0];
      this.selectedSubDivision = subFilter.value;
    }

    const rangeFilter = this.dashboardConfig.filters.find(f => f.key === 'range');
    if (rangeFilter) {
      rangeFilter.options = this.userJurisdiction.range;
      rangeFilter.value = this.userJurisdiction.range[0];
      this.selectedRange = rangeFilter.value;
    }

    const beatFilter = this.dashboardConfig.filters.find(f => f.key === 'beat');
    if (beatFilter) {
      beatFilter.options = this.userJurisdiction.beat;
      beatFilter.value = this.userJurisdiction.beat[0];
      this.selectedBeat = beatFilter.value;
    }

    this.updateUI();
    
    // Auto-fetch JFMCs for the default beat
    if(this.selectedBeat) {
      this.onBeatChange(this.selectedBeat, false);
    }
    
    this.fetchData();
  }

  onFilterUpdate(event: { key: string, value: any }) {
    const val = event.value?.value !== undefined ? event.value.value : event.value;

    if (event.key === 'district') this.selectedDistrict = val;
    else if (event.key === 'subdivision') this.selectedSubDivision = val;
    else if (event.key === 'range') this.selectedRange = val;
    else if (event.key === 'beat') this.onBeatChange(val, true);
    else if (event.key === 'jfmc') this.selectedJFMC = val; 
    else if (event.key === 'scheme') this.selectedScheme = val;

 else if (event.key === 'fromDate') {
    this.fromDate = val;
    this.dashboardConfig.fromDate = val;
  }
  else if (event.key === 'toDate') {
    this.toDate = val;
    this.dashboardConfig.toDate = val;
  }
  
  if (event.key !== 'beat') {
      this.fetchData();
    }
  }

  onBeatChange(val: any, fetchDashboard: boolean = true) {
    this.selectedBeat = val;

    this.coreservices.getAllJfmclistByJurisdiction(val).subscribe((res: any) => {
      const response = typeof res === 'string' ? JSON.parse(res) : res;
      const f = this.dashboardConfig.filters.find(x => x.key === 'jfmc');
      
      if (f && response?.Data) {
        // Remove duplicates just in case
        const unique = Array.from(new Map(response.Data.map((item: any) => [item.jfmc_id, item])).values());

        f.options = unique.map((item: any) => ({
          label: item.name_of_committee,
          value: item.name_of_committee // Passing Name to API, not ID!
        }));
        this.updateUI();
      }
    });

    if(fetchDashboard) {
      this.fetchData();
    }
  }

  getFilteredBeats(): string {
    if (this.selectedBeat) return this.selectedBeat;
    return this.userJurisdiction?.beat?.join(',') || "";
  }

  fetchData() {
    const payload = {
      beat: this.getFilteredBeats(),
      jfmc_no: '',
      jfmc_name: this.selectedJFMC || '',
       from_date: this.fromDate, 
        to_date: this.toDate 
    };

    this.coreservices.GetForestDashboardData(payload).subscribe({
      next: (res: any) => {
        const result = typeof res === 'string' ? JSON.parse(res) : res;
        const d = result.Data;
        
        if (!d) return;

        // Added safe fallbacks || {} and || [] to prevent crashes
        const widgets: WidgetItem[] = [
          { id: 'prot', type: 'CHART', title: 'Protection Assets', chartType: 'bar', data: d.expensePlantation || {} },
          { id: 'plant', type: 'CHART', title: 'Plantation Assets', chartType: 'bar', data: d.expensePlantation || {} },
          { id: 'eco_map', type: 'MAP', title: 'Map View', data: d.activityInJfmcArea || [] },
          { id: 'man', type: 'CHART', title: 'Man-days Generation', chartType: 'bar', data: d.malefemale || {} },
          { id: 'smc', type: 'CHART', title: 'SMC Assets', chartType: 'bar', data: d.expensePlantation || {} }
        ];

        this.dashboardConfig.widgets = widgets;
        this.updateUI();
      },
      error: (err) => {
        console.error("Eco Dev API Failed:", err);
      }
    });
  }

  downloadDashboard() {
    const el = document.getElementById('dashboard-container');
    if (el) {
      html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#f1f5f9' }).then(canvas => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'ECO-DEV_Report.png';
        link.click();
      });
    }
  }
}