import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ServerRequests } from '../../../services/ServerRequests';
import { DashboardConfig } from '../../../models/dashboard.model';
import { GridColumn } from '../../../shared/Grids/grid-column.model';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-jfmc-dashboard',
  template: `
    <div class="dashboard-content" id="dashboard-container">
      <app-custom-dashboard
        *ngIf="dashboardConfig"
        [config]="dashboardConfig"
        (filterChanged)="onFilterUpdate($event)"
        (download)="downloadDashboard()">
      </app-custom-dashboard>
    </div>
  `
})
export class JfmcDashboardComponent implements OnInit {

  dashboardConfig!: DashboardConfig;

  selectedDistrict: any = '';
  divisionchange: any = '';
  rangechanged: any = '';
  beatchange: any = '';
  selectedJFMC: any = '';
  schemaname: any = '';

  fromDate: string = '';
  toDate: string = '';

  allbeatsdata: any[] = [];
  userJurisdiction: any;
  shgLoanData: any[] = [];

  tableColumns: GridColumn[] = [
    { field: 'slNo', header: 'SL.NO.' },
    { field: 'shg_name', header: 'SHG NAME' },
    { field: 'amount_disb', header: 'SANCTION AMOUNT' },
    { field: 'loan_disb_date', header: 'DATE' },
    { field: 'intrerest_rate_on_loan', header: 'INTEREST %' },
    { field: 'loan_perion_month', header: 'TENURE (MONTHS)' },
    { field: 'total_recoverable', header: 'TOTAL RECOVERABLE' },
    { field: 'recovered', header: 'RECOVERED' },
    { field: 'amount_pending', header: 'PENDING' }
  ];
  allGeoData: any[] = [];

  constructor(
    public coreservices: ServerRequests,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initializeDashboardConfig();
    this.loadInitialData();
  }

  initializeDashboardConfig(): void {
    this.dashboardConfig = {
      title: 'JFMC AND EDC DASHBOARD',
      filters: [
        { key: 'scheme', label: 'Scheme Type', options: [], value: '' },
        { key: 'district', label: 'District', options: [], value: '' },
        { key: 'subdivision', label: 'Sub Division', options: [], value: '' },
        { key: 'range', label: 'Range', options: [], value: '' },
        { key: 'beat', label: 'Beat', options: [], value: '' },
        { key: 'jfmc', label: 'JFMC', options: [], value: '' }
      ],
      kpis: [
        { title: 'Meetings', value: 0, icon: 'fa-calendar', gradientClass: 'kpi-1' },
        { title: 'Loans Sanctioned', value: 0, icon: 'fa-check-square', gradientClass: 'kpi-2' },
        { title: 'Amount Sanctioned', value: 0, icon: 'fa-money-bill-wave', gradientClass: 'kpi-3' },
        { title: 'Amount Repay', value: 0, icon: 'fa-hand-holding-usd', gradientClass: 'kpi-4' }
      ],
      widgets: [],
      fromDate: '',
      toDate: ''
    };
  }

  loadInitialData(): void {
    // 1. Fetch Master Schemes 
    this.coreservices.getAllLookUps(1).subscribe((res: any) => {
      const schemeFilter = this.dashboardConfig.filters.find(x => x.key === 'scheme');
      if (schemeFilter && res?.Data?.scheme_master) {
        schemeFilter.options = res.Data.scheme_master.map((s: any) => s.scheme_name);
        if (schemeFilter.options.length > 0) {
          schemeFilter.value = schemeFilter.options[0];
          this.schemaname = schemeFilter.value;
        }
      }
      this.updateUI();
    });

    // 2. Fetch Geo Mapping Hierarchy & Evaluate Session State
    this.coreservices.getAllGeo(1).subscribe((res: any) => {
      this.allGeoData = res?.Data ?? [];
      this.allbeatsdata = res?.Data ?? [];

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

    // Trigger District entry point
    const districtOptions = [...new Set(this.userJurisdiction.district)] as string[];
    this.setFilterOptionsAndValue('district', districtOptions);
    this.selectedDistrict = districtOptions[0] || '';

    // Cascade down from District automatically
    this.onDistrictChange(this.selectedDistrict);
  }

  onFilterUpdate(event: { key: string, value: any }): void {
    const val = event.value;

    if (event.key === 'scheme') {
      this.schemaname = val;
      this.getdashboardfilter();
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
      this.getdashboardfilter();
    } 
    else if (event.key === 'fromDate') {
      this.fromDate = val;
      this.dashboardConfig.fromDate = val;
      this.getdashboardfilter();
    } 
    else if (event.key === 'toDate') {
      this.toDate = val;
      this.dashboardConfig.toDate = val;
      this.getdashboardfilter();
    }
  }

  onDistrictChange(val: any): void {
    this.selectedDistrict = val;
    const filtered = this.allGeoData.filter(b => b.district_name === val);
    const options = [...new Set(filtered.map(b => b.subdivision_name))] as string[];
    
    this.setFilterOptionsAndValue('subdivision', options);
    this.divisionchange = options[0] || '';

    // Chain down to subdivision
    this.onSubdivisionChange(this.divisionchange);
  }

  onSubdivisionChange(val: any): void {
    this.divisionchange = val;
    const filtered = this.allGeoData.filter(b => b.subdivision_name === val);
    const options = [...new Set(filtered.map(b => b.range_name))] as string[];
    
    this.setFilterOptionsAndValue('range', options);
    this.rangechanged = options[0] || '';

    // Chain down to range
    this.onRangeChange(this.rangechanged);
  }

  onRangeChange(val: any): void {
    this.rangechanged = val;
    const filtered = this.allGeoData.filter(b => b.range_name === val);
    const options = [...new Set(filtered.map(b => b.beat_name))] as string[];
    
    this.setFilterOptionsAndValue('beat', options);
    this.beatchange = options[0] || '';

    // Chain down to beat
    this.onBeatChange(this.beatchange);
  }

  onBeatChange(val: any): void {
    this.beatchange = val;
    if (!val) {
      this.setFilterOptionsAndValue('jfmc', []);
      this.selectedJFMC = '';
      this.getdashboardfilter();
      return;
    }

    this.coreservices.getAllJfmclistByJurisdiction(val).subscribe((res: any) => {
      const allNames = res?.Data?.map((item: any) => item.name_of_committee) || [];
      const distinctOptions = [...new Set(allNames)] as string[];

      this.setFilterOptionsAndValue('jfmc', distinctOptions);
      this.selectedJFMC = distinctOptions[0] || '';
      
      // End of cascade: hit data query endpoint
      this.getdashboardfilter();
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
    if (this.beatchange) return this.beatchange;
    return this.userJurisdiction?.beat ? this.userJurisdiction.beat.toString() : '';
  }

  getdashboardfilter(): void {
    const beats = this.getFilteredBeats();
    const jfmc = this.selectedJFMC || "";

    this.coreservices.getjfmcdashboarddata(beats, jfmc, this.fromDate, this.toDate).subscribe({
      next: (res: any) => {
        const d = res?.Data;
        if (!d) return;

        this.dashboardConfig.kpis = [
          { title: 'No. Of Meetings', value: d.cntMeeting || 0, icon: 'fa-calendar', gradientClass: 'kpi-1' },
          { title: 'No. Of Loan Sanctioned', value: d.cntLoanSanctioned || 0, icon: 'fa-check-square', gradientClass: 'kpi-2' },
          { title: 'Amount Sanctioned', value: d.sumLoanDisb || 0, icon: 'fa-money-bill-wave', gradientClass: 'kpi-3' },
          { title: 'Amount Repay', value: d.sumAmountRecovered || 0, icon: 'fa-hand-holding-usd', gradientClass: 'kpi-4' }
        ];

        this.shgLoanData = (d.shg_loan_detailes || []).map((item: any, i: number) => {
          const principal = item.amount_disb || 0;
          const interest = principal * (item.intrerest_rate_on_loan || 0) * ((item.loan_perion_month || 0) / 12) / 100;
          const total = principal + interest;
          const pending = (item.balance_principal_amount || 0) + (item.balance_intrest_amount || 0);

          return {
            ...item,
            slNo: i + 1,
            total_recoverable: total.toFixed(2),
            recovered: (total - pending).toFixed(2),
            amount_pending: pending.toFixed(2)
          };
        });

        this.dashboardConfig.widgets = [
          { id: 'soc', type: 'CHART', title: 'Village Social Category', chartType: 'pie', data: d.village_wise_social?.[0] || {} },
          { id: 'gen', type: 'CHART', title: 'General Body Overview', chartType: 'bar', data: [...(d.gender_wise_generalbody || []), ...(d.social_category_wise_generalbody || [])] },
          { id: 'exe', type: 'CHART', title: 'Executive Member', chartType: 'pie', data: d.male_female_Executive || {} },
          { id: 'fund', type: 'CHART', title: 'Fund Allocation', chartType: 'doughnut', data: d.fund_allocation || {} },
          { id: 'map', type: 'MAP', title: 'Geospatial Overview', data: d.shg_loan_detailes || [] },
          { id: 'tab', type: 'TABLE', title: 'Loan Transaction Details', data: this.shgLoanData, columns: this.tableColumns }
        ];

        this.updateUI();
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
      html2canvas(dashboardElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#f1f5f9'
      }).then(canvas => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'JFMC_Dashboard_Report.png';
        link.click();
      });
    }
  }
}