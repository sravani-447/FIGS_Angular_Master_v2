import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ServerRequests } from '../../../services/ServerRequests';
import { DashboardConfig } from '../../../models/dashboard.model';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-livelihood-dashboard',
  templateUrl: './livelihood-dashboard.component.html',
  styleUrls: ['./livelihood-dashboard.component.css']
})
export class LivelihoodDashboardComponent implements OnInit {

  dashboardConfig!: DashboardConfig;

  selectedDistrict: any = '';
  selectedSubDivision: any = '';
  selectedRange: any = '';
  selectedBeat: any = '';
  selectedJFMC: any = '';
  selectedScheme: any = '';
  fromDate: string = '';
  toDate: string = '';

  userJurisdiction: any;

  // --- CUSTOM TABLE DATA STATES ---
  statLiveStock: any[] = [];
  statAfcModel: any[] = [];
  statEcotCreationType: any[] = [];
  statEcotTouristType: any[] = [];
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
      title: 'LIVELIHOOD DASHBOARD',
      filters: [
        { key: 'scheme', label: 'Scheme Type', options: [], value: '' },
        { key: 'district', label: 'District', options: [], value: '' },
        { key: 'subdivision', label: 'Sub Division', options: [], value: '' },
        { key: 'range', label: 'Range', options: [], value: '' },
        { key: 'beat', label: 'Beat', options: [], value: '' },
        { key: 'jfmc', label: 'JFMC', options: [], value: '' }
      ],
      kpis: [
        { title: 'Total Income', value: 0, icon: 'fa-rupee-sign', gradientClass: 'kpi-1' },
        { title: 'Total Expenditure', value: 0, icon: 'fa-chart-line', gradientClass: 'kpi-2' },
        { title: 'Male Mandays', value: 0, icon: 'fa-male', gradientClass: 'kpi-3' },
        { title: 'Female Mandays', value: 0, icon: 'fa-female', gradientClass: 'kpi-4' }
      ],
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

    // 2. Get All Geo Hierarchy mapping and verify Session Jurisdiction
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

    // Extract distinct districts assigned to user session
    const districtOptions = [...new Set(this.userJurisdiction.district)] as string[];
    this.setFilterOptionsAndValue('district', districtOptions);
    this.selectedDistrict = districtOptions[0] || '';

    // Fire the sequential automated cascade
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

    // Waterfall step 2
    this.onSubdivisionChange(this.selectedSubDivision);
  }

  onSubdivisionChange(val: any): void {
    this.selectedSubDivision = val;
    const filtered = this.allGeoData.filter(b => b.subdivision_name === val);
    const options = [...new Set(filtered.map(b => b.range_name))] as string[];
    
    this.setFilterOptionsAndValue('range', options);
    this.selectedRange = options[0] || '';

    // Waterfall step 3
    this.onRangeChange(this.selectedRange);
  }

  onRangeChange(val: any): void {
    this.selectedRange = val;
    const filtered = this.allGeoData.filter(b => b.range_name === val);
    const options = [...new Set(filtered.map(b => b.beat_name))] as string[];
    
    this.setFilterOptionsAndValue('beat', options);
    this.selectedBeat = options[0] || '';

    // Waterfall step 4
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
        const unique = Array.from(new Map(res.Data.map((item: any) => [item.jfmc_id, item])).values());
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
      
      // Sequence resolution finalized: fetch dashboard numbers
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

  formatPieData(arr: any[], labelKey: string, valKey: string): any {
    if (!arr || !Array.isArray(arr)) return {};
    return arr.reduce((acc, curr) => {
      acc[curr[labelKey] || 'Unknown'] = curr[valKey] || 0;
      return acc;
    }, {});
  }

  fetchDashboardData(): void {
    const beatParam = this.getFilteredBeats();
    const jfmcParam = this.selectedJFMC || "";

    this.coreservices.getLivelihoodDashboardData(beatParam, jfmcParam).subscribe({
      next: (res: any) => {
        const response = typeof res === 'string' ? JSON.parse(res) : res;
        const d = response.Data;
        if (!d) return;

        // ---- SET CUSTOM TABLES DATA ----
        this.statLiveStock = d.statLiveStock || [];
        this.statAfcModel = d.statAfcModel || [];
        this.statEcotCreationType = d.statEcotCreationType || [];
        this.statEcotTouristType = d.statEcotTouristType || [];

        // ---- PRECALCULATIONS FOR KPIs ----
        const maleMandays = d.mandays_male || 0;
        const femaleMandays = d.mandays_female || 0;
        const totalIncome = (d.incomeFromLivestock || 0) + (d.incomeEcotourism || 0) + (d.incomeaf || 0) + (d.incomeFish || 0) + (d.incomeNtfpBased || 0) + (d.incomeNtfpBasedN || 0);
        const totalExpenditure = (d.totalExpLiveStock || 0) + (d.expenseEcotourism || 0) + (d.totalcostaf || 0) + (d.expendFish || 0) + (d.expendNtfpBased || 0) + (d.expendNtfpBasedN || 0);

        this.dashboardConfig.kpis = [
          { title: 'Total Income', value: totalIncome, icon: 'fa-rupee-sign', gradientClass: 'kpi-1' },
          { title: 'Total Exp.', value: totalExpenditure, icon: 'fa-chart-line', gradientClass: 'kpi-2' },
          { title: 'Male Mandays', value: maleMandays, icon: 'fa-male', gradientClass: 'kpi-3' },
          { title: 'Female Mandays', value: femaleMandays, icon: 'fa-female', gradientClass: 'kpi-4' }
        ];

        const profitAnalysisData = [
          { category: 'Livestock', Income: d.incomeFromLivestock || 0, Expenditure: d.totalExpLiveStock || 0 },
          { category: 'Ecotourism', Income: d.incomeEcotourism || 0, Expenditure: d.expenseEcotourism || 0 },
          { category: 'Agroforestry', Income: d.incomeaf || 0, Expenditure: d.totalcostaf || 0 },
          { category: 'Fishery', Income: d.incomeFish || 0, Expenditure: d.expendFish || 0 },
          { category: 'NTFP', Income: d.incomeNtfpBased || 0, Expenditure: d.expendNtfpBased || 0 },
          { category: 'Non-NTFP', Income: d.incomeNtfpBasedN || 0, Expenditure: d.expendNtfpBasedN || 0 }
        ];

        setTimeout(() => {
          this.dashboardConfig.widgets = [
            { id: 'pie1', type: 'CHART', title: 'Man Days Statistics', chartType: 'pie', data: { "Male": maleMandays, "Female": femaleMandays } },
            { id: 'bar1', type: 'CHART', title: 'Profit Analysis (Income vs Exp)', chartType: 'bar', data: profitAnalysisData },
            { id: 'pie2', type: 'CHART', title: 'Livestock Income', chartType: 'doughnut', data: this.formatPieData(d.LiveStockIncome, 'activity_livestock', 'Exp1') },
            { id: 'pie3', type: 'CHART', title: 'Ecotourism Income', chartType: 'doughnut', data: this.formatPieData(d.EcoIncome, 'monitor_type', 'Income') },
            { id: 'pie4', type: 'CHART', title: 'Fishery Income', chartType: 'doughnut', data: this.formatPieData(d.FisheryIncome, 'purpose', 'count') },
            { id: 'pie5', type: 'CHART', title: 'Agroforestry Income', chartType: 'doughnut', data: this.formatPieData(d.AgroIncome, 'model', 'incom1') },
            { id: 'map1', type: 'MAP', title: 'Livelihood Map View', data: [] } 
          ];
          this.updateUI();
        }, 50);

      },
      error: (err) => console.error("Livelihood API Failed:", err)
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
        link.download = 'Livelihood_Dashboard_Report.png';
        link.click();
      });
    }
  }
}