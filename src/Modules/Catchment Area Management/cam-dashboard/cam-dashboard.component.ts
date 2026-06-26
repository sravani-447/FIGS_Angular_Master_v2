import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ServerRequests } from '../../../services/ServerRequests';
import { DashboardConfig } from '../../../models/dashboard.model';
import { GridColumn } from '../../../shared/Grids/grid-column.model';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-cam-dashboard',
  templateUrl: './cam-dashboard.component.html',
  styleUrls: ['./cam-dashboard.component.css']
})
export class CAMDashboardComponent implements OnInit {

  dashboardConfig!: DashboardConfig;

  // Selection States
  selectedDistrict: any = '';
  selectedSubDivision: any = '';
  selectedRange: any = '';
  selectedBeat: any = '';
  selectedJFMC: any = '';
  selectedScheme: any = '';
  fromDate: string = '';
  toDate: string = '';

  // Data States
  userJurisdiction: any;

  // Table columns for Catchment Grid
  tableColumns: GridColumn[] = [
    { field: 'checkdemName', header: 'TYPE OF CHECKDAM' },
    { field: 'basicDetails', header: 'BASIC DETAILS' },
    { field: 'technicalDetails', header: 'TECHNICAL DETAILS' },
    { field: 'Implementation', header: 'IMPLEMENTATION' },
    { field: 'monitoring', header: 'MONITORING' },
    { field: 'fishery', header: 'FISHERY' }
  ];
  allGeoData: any[] = [];

  constructor(
    public coreservices: ServerRequests, 
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.initializeDashboardConfig();
    this.loadInitialData();
  }

  initializeDashboardConfig(): void {
    this.dashboardConfig = {
      title: 'CATCHMENT AREA MANAGEMENT',
      filters: [
        { key: 'scheme', label: 'Scheme Type', options: [], value: '' },
        { key: 'district', label: 'District', options: [], value: '' },
        { key: 'subdivision', label: 'Sub Division', options: [], value: '' },
        { key: 'range', label: 'Range', options: [], value: '' },
        { key: 'beat', label: 'Beat', options: [], value: '' },
        { key: 'jfmc', label: 'JFMC', options: [], value: '' }
      ],
      kpis: [
        { title: 'Total Structures', value: 0, icon: 'fa-cube', gradientClass: 'kpi-1' },
        { title: 'Male Mandays', value: 0, icon: 'fa-male', gradientClass: 'kpi-2' },
        { title: 'Female Mandays', value: 0, icon: 'fa-female', gradientClass: 'kpi-3' },
        { title: 'Total Assets', value: 0, icon: 'fa-database', gradientClass: 'kpi-4' }
      ],
      widgets: [],
      fromDate: '',
      toDate: ''
    };
  }

  loadInitialData(): void {
    // 1. Get Lookups for Scheme Master
    this.coreservices.getAllLookUps(1).subscribe((res: any) => {
      const schemeFilter = this.dashboardConfig.filters.find(x => x.key === 'scheme');
      if (schemeFilter && res?.Data?.scheme_master) {
        schemeFilter.options = res.Data.scheme_master.map((s: any) => s.scheme_name);
        if (schemeFilter.options.length > 0) {
          schemeFilter.value = schemeFilter.options[0];
          this.selectedScheme = schemeFilter.value;
        }
      }
      this.updateUI();
    });

    // 2. Get All Geo mapping data and capture user session state
    this.coreservices.getAllGeo(1).subscribe((res: any) => {
      this.allGeoData = res?.Data ?? [];
      
      const session = sessionStorage.getItem("Session");
      if (session) {
        const sessionObj = JSON.parse(session);
        this.userJurisdiction = JSON.parse(sessionObj.Data[0].jurisdiction_details).Jurisdiction;
        this.loadJurisdictionDropdowns();
      }
    });
  }

  loadJurisdictionDropdowns(): void {
    if (!this.userJurisdiction) return;

    // Filter dynamic unique districts assigned to active user scope
    const districtOptions = [...new Set(this.userJurisdiction.district)] as string[];
    this.setFilterOptionsAndValue('district', districtOptions);
    this.selectedDistrict = districtOptions[0] || '';

    // Trigger cascading sequential auto-selection stream
    this.onDistrictChange(this.selectedDistrict);
  }

  onFilterUpdate(event: { key: string, value: any }): void {
    const val = event.value;

    if (event.key === 'scheme') {
      this.selectedScheme = val;
      this.fetchDashboardData();
    } 
    else if (event.key === 'district') {
      this.onDistrictChange(val);
    } 
    else if (event.key === 'subdivision') {
      this.onSubdivisionChange(val);
    } 
    else if (event.key === 'range') {
      this.onRangeChange(val);
    } 
    else if (event.key === 'beat') {
      this.onBeatChange(val);
    } 
    else if (event.key === 'jfmc') {
      this.selectedJFMC = val;
      this.fetchDashboardData();
    } 
    else if (event.key === 'fromDate') {
      this.fromDate = val;
      this.dashboardConfig.fromDate = val;
      this.fetchDashboardData();
    } 
    else if (event.key === 'toDate') {
      this.toDate = val;
      this.dashboardConfig.toDate = val;
      this.fetchDashboardData();
    }
  }

  onDistrictChange(val: any): void {
    this.selectedDistrict = val;
    const filtered = this.allGeoData.filter(b => b.district_name === val);
    const options = [...new Set(filtered.map(b => b.subdivision_name))] as string[];
    
    this.setFilterOptionsAndValue('subdivision', options);
    this.selectedSubDivision = options[0] || '';

    // Cascade down to subdivision step
    this.onSubdivisionChange(this.selectedSubDivision);
  }

  onSubdivisionChange(val: any): void {
    this.selectedSubDivision = val;
    const filtered = this.allGeoData.filter(b => b.subdivision_name === val);
    const options = [...new Set(filtered.map(b => b.range_name))] as string[];
    
    this.setFilterOptionsAndValue('range', options);
    this.selectedRange = options[0] || '';

    // Cascade down to range step
    this.onRangeChange(this.selectedRange);
  }

  onRangeChange(val: any): void {
    this.selectedRange = val;
    const filtered = this.allGeoData.filter(b => b.range_name === val);
    const options = [...new Set(filtered.map(b => b.beat_name))] as string[];
    
    this.setFilterOptionsAndValue('beat', options);
    this.selectedBeat = options[0] || '';

    // Cascade down to beat step
    this.onBeatChange(this.selectedBeat);
  }

  onBeatChange(val: any): void {
    this.selectedBeat = val;
    if (!val) {
      this.setFilterOptionsAndValue('jfmc', []);
      this.selectedJFMC = '';
      this.fetchDashboardData();
      return;
    }

    this.coreservices.getAllJfmclistByJurisdiction(val).subscribe((res: any) => {
      if (res?.Data) {
        const unique = Array.from(
          new Map(res.Data.map((item: any) => [item.jfmc_id, item])).values()
        );
        const options = unique.map((item: any) => item.name_of_committee);
        
        const f = this.dashboardConfig.filters.find(x => x.key === 'jfmc');
        if (f) {
          f.options = options;
          f.value = options.length > 0 ? options[0] : '';
          this.selectedJFMC = f.value;
        }
      } else {
        this.setFilterOptionsAndValue('jfmc', []);
        this.selectedJFMC = '';
      }
      
      // Cascade sequence resolved completely, run API sync
      this.fetchDashboardData();
    });
  }

  setFilterOptionsAndValue(key: string, options: string[]): void {
    const f = this.dashboardConfig.filters.find(x => x.key === key);
    if (f) {
      f.options = options;
      f.value = options.length > 0 ? options[0] : '';
    }
    this.updateUI();
  }

  getFilteredBeats(): string {
    if (this.selectedBeat) return this.selectedBeat;
    return this.userJurisdiction?.beat?.toString() || "";
  }

  fetchDashboardData(): void {
    const beatParam = this.getFilteredBeats();
    const jfmcParam = this.selectedJFMC || "";

    console.log("Sending Beat:", beatParam);
    console.log("Sending JFMC:", jfmcParam);

    this.coreservices.getSmcDashboardData(beatParam, jfmcParam).subscribe({
      next: (res: any) => {
        const response = typeof res === 'string' ? JSON.parse(res) : res;
        const d = response.Data;

        if (!d) return;

        // ---- PRECALCULATIONS ----
        const totalStructures = d.tableInfo?.length || 0;
        const maleMandays = d.man_days?.[0]?.["Mandays Male"] || 0;
        const femaleMandays = d.man_days?.[0]?.["Mandays Female"] || 0;
        const totalAssets = d.assets_count?.reduce((acc: number, curr: any) => acc + curr.count, 0) || 0;

        // ---- LOAD KPI CARDS ----
        this.dashboardConfig.kpis = [
          { title: 'Total Structures', value: totalStructures, icon: 'fa-cube', gradientClass: 'kpi-1' },
          { title: 'Male Mandays', value: maleMandays, icon: 'fa-male', gradientClass: 'kpi-2' },
          { title: 'Female Mandays', value: femaleMandays, icon: 'fa-female', gradientClass: 'kpi-3' },
          { title: 'Total Assets', value: totalAssets, icon: 'fa-database', gradientClass: 'kpi-4' }
        ];

        this.updateUI();

        // ---- LOAD HEAVY WIDGETS AFTER KPI ----
        setTimeout(() => {
          this.dashboardConfig.widgets = [
            { id: 'pie1', type: 'CHART', title: 'Man Days Statistics', chartType: 'pie', data: { "Male": maleMandays, "Female": femaleMandays } },
            { id: 'dough1', type: 'CHART', title: 'Type of Structure Count', chartType: 'doughnut', data: d.type_of_structure_count },
            { id: 'dough2', type: 'CHART', title: 'Type of Assets Count', chartType: 'doughnut', data: d.assets_count },
            { id: 'bar1', type: 'CHART', title: 'Investment Amount', chartType: 'bar', data: d.type_of_structure },
            { id: 'map1', type: 'MAP', title: 'Map View', data: d.tableInfo },
            { id: 'table1', type: 'TABLE', title: 'SMC Structure Analysis', data: d.tableInfo, columns: this.tableColumns }
          ];
          this.updateUI();
        }, 50);
      },
      error: (err) => {
        console.error("CAM API Failed:", err);
      }
    });
  }

  updateUI(): void {
    this.dashboardConfig = { ...this.dashboardConfig };
    this.cdr.detectChanges();
  }

  downloadDashboard(): void {
    const dashboardElement = document.getElementById('dashboard-container');
    if (dashboardElement) {
      html2canvas(dashboardElement, { scale: 2, useCORS: true, backgroundColor: '#f1f5f9' }).then(canvas => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'Catchment_Dashboard_Report.png';
        link.click();
      });
    }
  }
}