import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ServerRequests } from '../../../services/ServerRequests';
import { DashboardConfig, WidgetItem, KpiItem } from '../../../models/dashboard.model';
import { GridColumn } from '../../../shared/Grids/grid-column.model';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-fm-dashboard',
  templateUrl: './fm-dashboard.component.html',
  styleUrls: ['./fm-dashboard.component.css']
})
export class FMDashboardComponent implements OnInit {
  
  dashboardConfig!: DashboardConfig;
  userJurisdiction: any;
  
  // Selection States
  selectedDistrict: any = '';
  selectedSubDivision: any = '';
  selectedRange: any = '';
  selectedBeat: any = '';
  selectedJFMC: any = '';
  selectedScheme: any = '';
  fromDate: string = '';
  toDate: string = '';

  tableColumns: GridColumn[] = [
    { field: 'type', header: 'Type Of Survey' },
    { field: 'presurvey', header: 'Presurvey' },
    { field: 'advance', header: 'Advance Works' },
    { field: 'plantation', header: 'Plantation' },
    { field: 'resurvey', header: 'Resurvey' },
    { field: 'maintenance', header: 'Maintenance' }
  ];
  allGeoData: any[] = [];

  constructor(public coreservices: ServerRequests, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.initializeConfig();
    this.loadInitialData();
  }

  initializeConfig() {
    this.dashboardConfig = {
      title: 'FOREST MANAGEMENT DASHBOARD',
      filters: [
        { key: 'scheme', label: 'Scheme Type', options: [], value: '' },
        { key: 'district', label: 'District', options: [], value: '' },
        { key: 'subdivision', label: 'Sub Division', options: [], value: '' },
        { key: 'range', label: 'Range', options: [], value: '' },
        { key: 'beat', label: 'Beat', options: [], value: '' },
        { key: 'jfmc', label: 'JFMC', options: [], value: '' },
      ],
      kpis: [],
      widgets: [],
      fromDate: '', 
      toDate: ''   
    } as any; 
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

  onFilterUpdate(event: { key: string, value: any }) {
    // Safely extract value whether it's an object or a string
    const val = event.value?.value !== undefined ? event.value.value : event.value;

    if (event.key === 'scheme') {
      this.selectedScheme = val;
      this.fetchData();
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
      this.fetchData();
    } 
    else if (event.key === 'fromDate') {
      this.fromDate = val;
      this.dashboardConfig.fromDate = val;
      this.fetchData();
    } 
    else if (event.key === 'toDate') {
      this.toDate = val;
      this.dashboardConfig.toDate = val;
      this.fetchData();
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
      this.fetchData();
      return;
    }

    this.coreservices.getAllJfmclistByJurisdiction(val).subscribe((res: any) => {
      const response = typeof res === 'string' ? JSON.parse(res) : res;
      
      if (response?.Data) {
        const unique = Array.from(new Map(response.Data.map((item: any) => [item.jfmc_id, item])).values());
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
      
      // Cascade sequence resolved completely, execute backend synchronization
      this.fetchData();
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

        // 1. Map KPIs (Safe Checks)
        const kpis: KpiItem[] = [
          { title: 'Plantation Area', value: d.sumPlantation_table?.[0]?.area || 0, icon: 'fa-tree', gradientClass: 'kpi-1' },
          { title: 'Plantation Length', value: d.sumPlantation_table?.[0]?.length || 0, icon: 'fa-road', gradientClass: 'kpi-2' },
          { title: 'Total Revenue', value: (d.revenueSales || []).reduce((a:any, b:any) => a + (b.revenue || 0), 0), icon: 'fa-rupee-sign', gradientClass: 'kpi-3' },
          { title: 'Nursery Stock', value: d.groupbyNursery?.length || 0, icon: 'fa-leaf', gradientClass: 'kpi-4' }
        ];

        // 2. Map Table - Fallbacks preventing crashes
        const sumP = d.sumPlantation_table?.[0] || {};
        const sumPre = d.sumpresurvey?.[0] || {};
        const sumAdv = d.sumAdvancework?.[0] || {};
        const sumRes = d.sumresurvey?.[0] || {};
        const sumMaint = d.sumPlantation_maintenence?.[0] || {};

        const tableData = [
          { 
            type: 'Block Plantation (ha)', 
            presurvey: sumPre.area || 0, 
            advance: sumAdv.area || 0, 
            plantation: sumP.area || 0, 
            resurvey: sumRes.area || 0, 
            maintenance: sumMaint.area || 0 
          },
          { 
            type: 'Linear Plantation (km)', 
            presurvey: sumPre.length || 0, 
            advance: sumAdv.length || 0, 
            plantation: sumP.length || 0, 
            resurvey: sumRes.length || 0, 
            maintenance: sumMaint.length || 0 
          }
        ];

        // 3. Map Charts safely
        const revenueObj: any = {};
        (d.revenueSales || []).forEach((x: any) => {
            revenueObj[x.nursery_type] = { Revenue: x.revenue || 0, Cost: x.cost || 0 };
        });

        const widgets: WidgetItem[] = [
          { id: 'fm_table', type: 'TABLE', title: 'Plantation Statistical Analysis', data: tableData, columns: this.tableColumns },
          { id: 'fm_map', type: 'MAP', title: 'Map View', data: d.activityInJfmcArea || [] },
          { id: 'rev_chart', type: 'CHART', title: 'Revenue Generation Nursery', chartType: 'bar', data: revenueObj },
          { id: 'man_days', type: 'CHART', title: 'Man Days Generation', chartType: 'bar', data: d.malefemale || {} },
          { id: 'cost_chart', type: 'CHART', title: 'Cost Incurred Plantation', chartType: 'bar', data: d.expensePlantation || {} },
          { id: 'p_pie', type: 'CHART', title: 'Plantation Type', chartType: 'pie', data: this.toObj(d.groupbyPlantation, 'type_of_plantation') },
          { id: 'n_pie', type: 'CHART', title: 'Nursery Type', chartType: 'pie', data: this.toObj(d.groupbyNursery, 'nursery_type') }
        ];

        this.dashboardConfig.kpis = kpis;
        this.dashboardConfig.widgets = widgets;
        this.updateUI();
      },
      error: (err) => {
        console.error("FM API Failed:", err);
      }
    });
  }

  toObj(arr: any[], key: string) {
    const o: any = {};
    (arr || []).forEach(x => {
        if(x[key]) o[x[key]] = x.count || 0;
    });
    return o;
  }

  updateUI(): void {
    this.dashboardConfig = { ...this.dashboardConfig };
    this.cdr.detectChanges();
  }

  downloadDashboard() {
    const el = document.getElementById('dashboard-container');
    if (el) html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#f1f5f9' }).then(canvas => {
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = 'Forest_Management_Report.png';
      link.click();
    });
  }
}