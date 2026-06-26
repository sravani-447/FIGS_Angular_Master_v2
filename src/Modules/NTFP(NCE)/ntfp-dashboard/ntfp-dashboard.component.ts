import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ServerRequests } from '../../../services/ServerRequests';
import { DashboardConfig } from '../../../models/dashboard.model';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-ntfp-dashboard',
  templateUrl: './ntfp-dashboard.component.html',
  styleUrl: './ntfp-dashboard.component.css'
})
export class NTFPDashboardComponent implements OnInit {

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
  smcDashboardData: any; 
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
      title: 'NTFP NCE Dashboard',
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
    };
  }

  loadInitialData(): void {
    // 1. Get Lookups for Scheme
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

    // 2. Get All Geo data and User Jurisdiction from Session
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
    // Safely extract value whether it's an object or a string string
    const val = event.value?.value !== undefined ? event.value.value : event.value;

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

      // Cascade sequence resolved completely, execute backend synchronization
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

  setFilterOptions(key: string, options: string[]): void {
    const f = this.dashboardConfig.filters.find(x => x.key === key);
    if (f) f.options = options;
    this.updateUI();
  }

  getFilteredBeats(): string {
    if (this.selectedBeat) return this.selectedBeat;
    return this.userJurisdiction?.beat?.toString() || "";
  }

  fetchDashboardData(): void {
    const beatParam = this.getFilteredBeats();
    const jfmcParam = (this.selectedJFMC && typeof this.selectedJFMC === 'object') 
                      ? this.selectedJFMC.value : (this.selectedJFMC || "");

    this.coreservices.getLivelihoodDashboardData(beatParam, jfmcParam, this.fromDate, this.toDate).subscribe({
      next: (res: any) => {
        const response = typeof res === 'string' ? JSON.parse(res) : res;
        const d = response.Data;
        if (!d) return;

        // ---- KPI CARDS (Top Bar) ----
        const totalInc = (Number(d.totalIncomeLiveStock) || 0) + (Number(d.incomeEcotourism) || 0) + (Number(d.incomeaf) || 0) + (Number(d.incomeFish) || 0);
        const totalExp = (Number(d.totalExpLiveStock) || 0) + (Number(d.expenseEcotourism) || 0) + (Number(d.totalcostaf) || 0) + (Number(d.expendFish) || 0);

        this.dashboardConfig.kpis = [
          { title: 'Total Income', value: totalInc, icon: 'fa-money-bill-trend-up', gradientClass: 'kpi-1' },
          { title: 'Total Expense', value: totalExp, icon: 'fa-file-invoice-dollar', gradientClass: 'kpi-2' },
          { title: 'Male Mandays', value: d.male_f || 0, icon: 'fa-male', gradientClass: 'kpi-3' },
          { title: 'Female Mandays', value: d.female_f || 0, icon: 'fa-female', gradientClass: 'kpi-4' }
        ];

        setTimeout(() => {
          this.dashboardConfig.widgets = [
            {
              id: 'profitOverall', type: 'CHART', title: 'Profit Analysis', chartType: 'bar',
              data: {
                labels: ["Livestock", "Eco-tourism", "Agroforestry", "Fishery", "NTFP Based"],
                datasets: [
                  { label: "Income", data: [d.totalIncomeLiveStock, d.incomeEcotourism, d.incomeaf, d.incomeFish, d.incomeNtfpBased], backgroundColor: 'blue' },
                  { label: "Expense", data: [d.totalExpLiveStock, d.expenseEcotourism, d.totalcostaf, d.expendFish, d.expendNtfpBased], backgroundColor: 'red' }
                ]
              }
            },
            { id: 'mapView', type: 'MAP', title: 'Map View', data: [] },
            { id: 'profitMid1', type: 'CHART', title: 'Profit Analysis', chartType: 'bar', data: { "Income": d.totalIncomeLiveStock, "Expense": d.totalExpLiveStock } },
            { id: 'profitMid2', type: 'CHART', title: 'Profit Analysis', chartType: 'bar', data: { "Income": d.incomeEcotourism, "Expense": d.expenseEcotourism } },
            { 
              id: 'incomeLive1', type: 'CHART', title: 'Income from Livestock', chartType: 'pie', 
              data: this.mapDynamicChartData(d.incomeFromLivestock, 'activity_by', 'sum') 
            },
            { 
              id: 'incomeLive2', type: 'CHART', title: 'Income from Livestock', chartType: 'pie', 
              data: this.mapDynamicChartData(d.incomeFromLivestock, 'species', 'sum') 
            }
          ];
          this.updateUI();
        }, 100);
      },
      error: (err) => console.error("API Error:", err)
  });
  }

  private mapDynamicChartData(array: any[], labelKey: string, valueKey: string): any {
    if (!array || !Array.isArray(array)) return {};
    return array.reduce((acc, item) => {
      if (item[labelKey]) acc[item[labelKey]] = item[valueKey] || 0;
      return acc;
    }, {} as any);
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
        link.download = 'NTFP_Dashboard.png';
        link.click();
      });
    }
  }
}