import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ServerRequests } from '../../../services/ServerRequests';
import { DashboardConfig } from '../../../models/dashboard.model';
import { GridColumn } from '../../../shared/Grids/grid-column.model';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-shg-dashboard',
  template: `
    <div class="dashboard-content" id="dashboard-container">
      <app-custom-dashboard 
        *ngIf="dashboardConfig"
        [config]="dashboardConfig" 
        (filterChanged)="onFilterUpdate($event)"
        (download)="downloadDashboard()">
      </app-custom-dashboard>
    </div>`
})
export class SHGDashboardComponent implements OnInit {

  dashboardConfig!: DashboardConfig;

  // Selection State
  selectedDistrict: any = '';
  selectedSubdivision: any = '';
  selectedRange: any = '';
  selectedBeat: any = '';
  selectedJFMC: any = '';
  selectedSHG: any = '';
  fromDate: string = '';
  toDate: string = '';

  allGeoData: any[] = [];
  userJurisdiction: any;
  schemaName: any = '';

  tableColumns: GridColumn[] = [
    { field: 'slNo', header: 'SL.NO.' },
    { field: 'shg_name', header: 'SHG NAME' },
    { field: 'fishery', header: 'FISHERY' },
    { field: 'livestock', header: 'LIVESTOCK' },
    { field: 'ntfp_based', header: 'NTFP BASED' },
    { field: 'nursery', header: 'NURSERY' }
  ];

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
      title: 'SHG AND JLG DASHBOARD',
      filters: [
        { key: 'scheme', label: 'Scheme Type', options: [], value: '' },
        { key: 'district', label: 'District', options: [], value: '' },
        { key: 'subdivision', label: 'Sub Division', options: [], value: '' },
        { key: 'range', label: 'Range', options: [], value: '' },
        { key: 'beat', label: 'Beat', options: [], value: '' },
        { key: 'jfmc', label: 'JFMC', options: [], value: '' },
        { key: 'shg', label: 'SHG', options: [], value: '' }
      ],
      kpis: [],
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
          this.schemaName = schemeFilter.value;
        }
      }
      this.updateUI();
    });

    // 2. Get All Geo mapping data and capture user session state
    this.coreservices.getAllGeo(1).subscribe((res: any) => {
      this.allGeoData = res?.Data ?? [];
      
      const session = sessionStorage.getItem('Session');
      if (session) {
        const parsed = JSON.parse(session);
        this.userJurisdiction = JSON.parse(parsed.Data[0].jurisdiction_details).Jurisdiction;
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
    const val = event.value?.value !== undefined ? event.value.value : event.value;
    
    if (event.key === 'scheme') {
      this.schemaName = val;
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
      this.onJFMCChange(val);
    } 
    else if (event.key === 'shg') { 
      this.selectedSHG = val; 
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
    this.selectedSubdivision = options[0] || '';

    this.onSubdivisionChange(this.selectedSubdivision);
  }

  onSubdivisionChange(val: any): void {
    this.selectedSubdivision = val;
    const filtered = this.allGeoData.filter(b => b.subdivision_name === val);
    const options = [...new Set(filtered.map(b => b.range_name))] as string[];
    
    this.setFilterOptionsAndValue('range', options);
    this.selectedRange = options[0] || '';

    this.onRangeChange(this.selectedRange);
  }

  onRangeChange(val: any): void {
    this.selectedRange = val;
    const filtered = this.allGeoData.filter(b => b.range_name === val);
    const options = [...new Set(filtered.map(b => b.beat_name))] as string[];
    
    this.setFilterOptionsAndValue('beat', options);
    this.selectedBeat = options[0] || '';

    this.onBeatChange(this.selectedBeat);
  }

  onBeatChange(val: any): void {
    this.selectedBeat = val;
    if (!val) {
      this.setFilterOptionsAndValue('jfmc', []);
      this.setFilterOptionsAndValue('shg', []);
      this.selectedJFMC = '';
      this.selectedSHG = '';
      this.fetchDashboardData();
      return;
    }

    this.coreservices.getAllJfmclistByJurisdiction(val).subscribe((res: any) => {
      if (res?.Data) {
        const allNames = res.Data.map((item: any) => item.name_of_committee) || [];
        const distinctOptions = allNames.filter((item: any, index: any) => allNames.indexOf(item) === index);

        const f = this.dashboardConfig.filters.find(x => x.key === 'jfmc');
        if (f) {
          f.options = distinctOptions;
          f.value = distinctOptions.length > 0 ? distinctOptions[0] : '';
          this.selectedJFMC = f.value;
        }
      } else {
        this.setFilterOptionsAndValue('jfmc', []);
        this.selectedJFMC = '';
      }
      
      this.onJFMCChange(this.selectedJFMC);
    });
  }

  onJFMCChange(val: any): void {
    this.selectedJFMC = val;
    if (!val) {
      this.setFilterOptionsAndValue('shg', []);
      this.selectedSHG = '';
      this.fetchDashboardData();
      return;
    }

    this.coreservices.getSHGListByJfmc(val).subscribe((res: any) => {
      if (res?.Data) {
        const options = res.Data.map((item: any) => item.name || item.shg_name) || [];
        const f = this.dashboardConfig.filters.find(x => x.key === 'shg');
        if (f) {
          f.options = options;
          f.value = options.length > 0 ? options[0] : '';
          this.selectedSHG = f.value;
        }
      } else {
        this.setFilterOptionsAndValue('shg', []);
        this.selectedSHG = '';
      }
      
      // Cascade stream is fully resolved, fetch data
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

  setFilterOptions(key: string, options: string[]) {
    const f = this.dashboardConfig.filters.find(x => x.key === key);
    if (f) f.options = options;
    this.updateUI();
  }

  getFilteredBeats(): string {
    if (this.selectedBeat) return this.selectedBeat;
    let filtered = this.allGeoData;
    if (this.selectedRange) filtered = filtered.filter(d => d.range_name === this.selectedRange);
    else if (this.selectedSubdivision) filtered = filtered.filter(d => d.subdivision_name === this.selectedSubdivision);
    else if (this.selectedDistrict) filtered = filtered.filter(d => d.district_name === this.selectedDistrict);

    const validBeats = [...new Set(filtered.map(d => d.beat_name))] as string[];
    return validBeats.join(',') || this.userJurisdiction?.beat?.toString() || "";
  }

  fetchDashboardData() {
    const beats = this.getFilteredBeats();

    this.coreservices.getshgdashboarddata(
      this.selectedSHG, 
      this.selectedJFMC, 
      beats, 
      this.selectedSubdivision, 
      this.selectedRange, 
      this.schemaName
    ).subscribe({
      next: (res: any) => {
        const result = typeof res === 'string' ? JSON.parse(res) : res;
        const d = result?.Data;
        if (!d) return;

        // 1. KPI Mapping
        this.dashboardConfig.kpis = [
          { title: 'No. of Panchsutra', value: d.cntPunchsutra || 0, icon: 'fa-tree', gradientClass: 'kpi-1' },
          { title: 'Loan Received', value: d.loanAmountReceived || 0, icon: 'fa-money-bill-wave', gradientClass: 'kpi-2' },
          { title: 'Loan Repaid', value: d.loanRePaid || 0, icon: 'fa-hand-holding-usd', gradientClass: 'kpi-3' },
          { title: 'Balance Amount', value: d.loanBalance || 0, icon: 'fa-wallet', gradientClass: 'kpi-4' }
        ];

        // 2. Table Data Mapping
        const tableData = (d.uniqueShg || []).map((name: string, i: number) => ({
          slNo: i + 1,
          shg_name: name,
          fishery: d.incomeFishery?.find((x: any) => x.shg_name === name)?.income || 0,
          livestock: d.incomeLiveStock?.find((x: any) => x.shg_name === name)?.income || 0,
          ntfp_based: d.incomeNtfp?.find((x: any) => x.shg_name === name)?.income || 0,
          nursery: d.incomeNursery?.find((x: any) => x.shg_name === name)?.income || 0
        }));

        // 3. Chart Data Preparation
        const socialData = d.village_wise_social?.[0] || {};

        const loanAuth: any = {};
        (d.loan_authority || []).forEach((x: any) => {
          loanAuth[x.loan_disbursed_by] = x.Count;
        });

        const activityData = {
          'Fishery': d.cntFishery?.[0]?.count || 0,
          'Livestock': d.cntLiveStock?.[0]?.count || 0,
          'NTFP': d.cntNtfp?.[0]?.count || 0,
          'Nursery': d.cntNursery?.[0]?.count || 0
        };

        const gradationData = (d.shg_gradation || []).map((x: any) => ({
          name: x.shg_name,
          count: x.final_gradation
        }));

        // 4. Widget Mapping
        this.dashboardConfig.widgets = [
          { id: 'soc', type: 'CHART', title: 'Village Social Category', chartType: 'pie', data: socialData },
          { id: 'act', type: 'CHART', title: 'Activity Wise Count', chartType: 'doughnut', data: activityData },
          { id: 'auth', type: 'CHART', title: 'Loan Authority', chartType: 'pie', data: loanAuth },
          { id: 'grad', type: 'CHART', title: 'SHG Gradation', chartType: 'bar', data: gradationData },
          { id: 'map', type: 'MAP', title: 'Geospatial View', data: d.shg_gradation || [] },
          { id: 'tab', type: 'TABLE', title: 'Income Generated By Activity', data: tableData, columns: this.tableColumns }
        ] as any;

        this.updateUI();
      },
      error: (err) => console.error("API Error:", err)
    });
  }

  updateUI(): void {
    this.dashboardConfig = { ...this.dashboardConfig };
    this.cdr.detectChanges();
  }

  downloadDashboard(): void {
    const dashboardElement = document.getElementById('dashboard-container');
    if (dashboardElement) {
      html2canvas(dashboardElement, { scale: 2, useCORS: true }).then(canvas => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'SHG_Dashboard_Report.png';
        link.click();
      });
    }
  }
}