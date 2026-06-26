import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as _ from 'lodash';
import moment from 'moment';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);
import { jsPDF } from 'jspdf';
import { ServerRequests } from '../../../services/ServerRequests';
import { DashboardConfig } from '../../../models/dashboard.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-pm-dashboard',
  templateUrl: './pm-dashboard.component.html',
  styleUrls: ['./pm-dashboard.component.css']
})
export class PmDashboardComponent implements OnInit, AfterViewInit {

  dashboardConfig!: DashboardConfig;

  selectedDistrict: any;
  divisionchange: any;
  rangechanged: any;
  beatchange: any;
  selectedJFMC: any;
  schemaname: any;

  showReportPreview: boolean = false;
  modulesData: any[] = []; 
  allbeatsdata: any[] = [];

  startDate: string = '';
  endDate: string = '';

  jfmclist: any[] = [];
  shglist: any[] = [];

  referenceList: any[] = []; 
  selectedReferenceId: any = ''; 
  allNurseryList: any[] = []; 

  reportType: string = '';
  shgReportData: any = null;
  smcReportData: any = null;
  nurseryReportData: any = null;

  schemes: any[] = [];
  districts: any[] = [];
  subdivisions: any[] = [];
  ranges: any[] = [];
  beats: any[] = [];

  allGeoData: any[] = []; 
  userJurisdiction: any; 

  financialYears: any[] = [];

  selectedSchemeTop: any = '';
  selectedDistrictTop: any = '';
  selectedYear: any[] = [];

  selectedModule: string = 'PLANTATION';
  selectedSchemeActivity: any = '';
  selectedDistrictActivity: any = '';
  selectedSubdivisionActivity: any = '';
  selectedRangeActivity: any = '';
  selectedBeatActivity: any = '';

  manDaysChart: any;
  budgetChart: any;
  spentAnalysisChart: any;

  jfmcReportData: any[] = [];
  jfmcSummary: any = {
    meetings: 0,
    loanSanctioned: 0,
    amountSanctioned: 0,
    amountRepaid: 0
  };
  jfmcLoanDetails: any[] = [];
  jfmcSMCAssets: any[] = [];
  jfmcNurseryAssets: any[] = [];
  jfmcAreaActivity: any[] = [];
  todayDate: string = new Date().toLocaleDateString('en-GB');
  shgReportDetails: any = null;
  nurseryReportDetails: any = null;

  selectedSHGs: any[] = [];
  perCapitaChart: any;

  smcTableInfo: any[] = [];
  smcBasicDetails: any[] = [];
  smcStructureAmount: any = {};
  smcMandays: any = {};
  smcStructureCount: any[] = [];
  smcAssetsCount: any[] = [];
  IsJFMC: boolean = false;

  jurisdictionDetails: any[] = [];
  jurisdictionDetailsAssigned: any;
  plantationReportDetails: any = [];

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    public coreservices: ServerRequests,
    private cdr: ChangeDetectorRef
  ) {
    const userData = JSON.parse(sessionStorage.getItem('userdata') || '{}');
    this.jurisdictionDetailsAssigned = userData.Jurisdiction || { district: [], sub_division: [], range: [], beat: [] };
  }

  ngOnInit() {
    this.generateFinancialYears();
    this.getLookups();
    this.getJurisdictionList();
  }

  generateFinancialYears() {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    let startYear = currentMonth >= 4 ? currentYear : currentYear - 1;

    this.financialYears = [];
    for (let i = 0; i < 10; i++) {
      const year = startYear - i;
      this.financialYears.push({
        value: year.toString(),       
        label: `${year}-${year + 1}`  
      });
    }
    if (this.financialYears.length > 0) {
      this.selectedYear = [this.financialYears[0].value];
    }
  }

  updateUI(): void {
    this.dashboardConfig = { ...this.dashboardConfig };
    this.cdr.detectChanges();
  }

  onDistrictChange() {
    const val = this.selectedDistrictActivity;
    const filtered = this.allGeoData.filter(b => b.district_name === val || b.district_id == val);
    this.subdivisions = _.uniqBy(filtered, 'subdivision_name');
    this.ranges = [];
    this.beats = [];
  }

  getJurisdictionList() {
    const sessionStr = sessionStorage.getItem('Session') || sessionStorage.getItem('userdata');
    if (!sessionStr) return;

    const parsed = JSON.parse(sessionStr);
    let assignedDistricts: string[] = [];

    try {
      const jurData = parsed.Data ? JSON.parse(parsed.Data[0].jurisdiction_details).Jurisdiction : parsed.Jurisdiction;
      assignedDistricts = jurData.district || [];
      this.userJurisdiction = jurData;
    } catch (e) {
      console.warn("Session parse error");
    }

    this.http.get(`${this.coreservices.BASE_URL}/GetAllGeo`).subscribe((res: any) => {
      this.allGeoData = res.Data;

      let filtered = _.filter(this.allGeoData, (elem) => {
        return assignedDistricts.length > 0 ? assignedDistricts.indexOf(elem.district_name) > -1 : true;
      });

      this.districts = _.uniqBy(filtered, 'district_name').map((d: any) => ({
        id: d.district_id,
        name: d.district_name
      }));

      if (this.districts.length > 0) {
        if (!this.selectedDistrictTop) this.selectedDistrictTop = this.districts[0].id;
        if (!this.selectedDistrictActivity) this.selectedDistrictActivity = this.districts[0].id;
        this.getSubDivision(); 
        this.onClickSubmit();
      }
      this.cdr.detectChanges();
    });
  }

  getSubDivision() {
    let filtered = _.filter(this.allGeoData, (elem) => elem.district_id == this.selectedDistrictActivity);
    if (this.userJurisdiction?.sub_division) {
      filtered = _.filter(filtered, (elem) => this.userJurisdiction.sub_division.indexOf(elem.subdivision_name) > -1);
    }
    this.subdivisions = _.uniqBy(filtered, 'subdivision_name');
    this.ranges = []; this.beats = []; this.referenceList = [];
    
    if (this.subdivisions.length > 0) {
      this.selectedSubdivisionActivity = this.subdivisions[0].subdivision_id;
      this.getRange(); 
    } else {
      this.selectedSubdivisionActivity = '';
    }
  }

  getRange() {
    let filtered = _.filter(this.allGeoData, (elem) => elem.subdivision_id == this.selectedSubdivisionActivity);
    if (this.userJurisdiction?.range) {
      filtered = _.filter(filtered, (elem) => this.userJurisdiction.range.indexOf(elem.range_name) > -1);
    }
    this.ranges = _.uniqBy(filtered, 'range_name');
    this.beats = []; this.referenceList = [];
    
    if (this.ranges.length > 0) {
      this.selectedRangeActivity = this.ranges[0].range_id;
      this.getBeat(); 
    } else {
      this.selectedRangeActivity = '';
    }
  }

  getBeat() {
    let filtered = _.filter(this.allGeoData, (elem) => elem.range_id == this.selectedRangeActivity);
    if (this.userJurisdiction?.beat) {
      filtered = _.filter(filtered, (elem) => this.userJurisdiction.beat.indexOf(elem.beat_name) > -1);
    }
    this.beats = _.uniqBy(filtered, 'beat_id');
    this.referenceList = [];
    
    if (this.beats.length > 0) {
      this.selectedBeatActivity = this.beats[0].beat_id;
      this.onBeatChange(); 
      this.onActivityFilterChange(); 
    } else {
      this.selectedBeatActivity = '';
    }
  }

  // --- SHG Multiselect Dropdown & Select All Component Core Logic ---
  onJFMCChange(val: any) {
    console.log("JFMC Selected:", val);
    this.selectedJFMC = val;
    this.shglist = [];
    this.selectedSHGs = []; 

    if (!val) {
      this.updatePerCapitaChart(); 
      return;
    }

    this.coreservices.getSHGListByJfmc(val).subscribe((res: any) => {
      const result = typeof res === 'string' ? JSON.parse(res) : res;
      const data = typeof result.Data === 'string' ? JSON.parse(result.Data) : result.Data;

      this.shglist = (data || []).map((item: any) => ({
        id: item.id ?? item.shg_id,
        name: item.name || item.shg_name || 'Unnamed SHG',
        data: [Math.random() * 50000, Math.random() * 60000, Math.random() * 70000, Math.random() * 80000, Math.random() * 90000],
        color: '#' + Math.floor(Math.random() * 16777215).toString(16)
      }));

      if (this.shglist.length > 0) {
        this.selectedSHGs = this.shglist.slice(0, 3);
        this.updatePerCapitaChart();
      }

      this.cdr.detectChanges();
    });
  }

  onSHGSelectionChange(event: any) {
    this.selectedSHGs = event.value;
    this.updatePerCapitaChart();
  }

  removeSHG(shg: any) {
    this.selectedSHGs = this.selectedSHGs.filter(x => x.id !== shg.id);
    this.updatePerCapitaChart();
    this.cdr.detectChanges();
  }

  isAllSHGsSelected(): boolean {
    return this.shglist.length > 0 && this.selectedSHGs.length === this.shglist.length;
  }

  isSomeSHGsSelected(): boolean {
    return this.selectedSHGs.length > 0 && this.selectedSHGs.length < this.shglist.length;
  }

  toggleAllSHGs() {
    if (this.isAllSHGsSelected()) {
      this.selectedSHGs = [];
    } else {
      this.selectedSHGs = [...this.shglist];
    }
    this.updatePerCapitaChart();
    this.cdr.detectChanges();
  }

  updatePerCapitaChart() {
    if (!this.perCapitaChart) return;
    
    this.perCapitaChart.data.datasets = this.selectedSHGs.map(shg => ({
      label: shg.name,
      data: shg.data,
      borderColor: shg.color,
      tension: 0.3,
      fill: false
    }));
    this.perCapitaChart.update();
  }

  getModuleSpecificData() {
    if (!this.selectedBeatActivity || !this.selectedModule) return;

    if (this.selectedModule === "PLANTATION") {
      this.http.get(`/ProjectMgmt/GetPlantationDetailsByBeatID?beatID=${this.selectedBeatActivity}`)
        .subscribe((res: any) => {
          this.modulesData = JSON.parse(res).Data; 
        });
    } else if (this.selectedModule === "JFMC") {
      this.http.get(`/Jfmc/GetAllJfmclistByJurisdiction?beats=${this.selectedBeatActivity}`)
        .subscribe((res: any) => {
          this.modulesData = JSON.parse(res).Data;
        });
    } else if (this.selectedModule === "SHG") {
      const params = `beats=${this.selectedBeatActivity}&schemeName=${this.selectedSchemeActivity}`;
      this.http.get(`/SHGJLG/ShGlISTbyBeat?${params}`).subscribe((res: any) => {
        this.modulesData = JSON.parse(res.Data);
      });
    }
  }

  ngAfterViewInit() {
    this.initCharts();
    if (this.selectedDistrictTop && this.selectedYear) {
      this.onClickSubmit();
    }
  }

  getLookups() {
    this.coreservices.getAllLookUps(1).subscribe((res: any) => {
      if (res?.Data?.scheme_master) {
        this.schemes = res.Data.scheme_master;
        if (this.schemes.length > 0) {
          this.selectedSchemeTop = this.schemes[0].id;
          this.selectedSchemeActivity = this.schemes[0].id;
        }
      }
    });
  }

  getallgeo() {
    this.coreservices.getAllGeo(1).subscribe({
      next: (res: any) => {
        this.allbeatsdata = res?.Data ?? [];
      }
    });
  }

  generateReport() {
    if (!this.selectedReferenceId || !this.selectedModule) {
      alert("Please select a Module and an ID");
      return;
    }

    this.showReportPreview = false;
    this.jfmcReportData = [];
    this.smcReportData = null;
    this.nurseryReportData = null;

    switch (this.selectedModule) {
      case 'PLANTATION': this.generatePlantationReport(); break;
      case 'JFMC': this.processJfmcReportLogic(); break;
      case 'SMC': this.processSmcReportLogic(); break;
      case 'NURSERY': this.processNurseryReportLogic(); break;
      case 'SHG': this.processShgReportLogic(); break;
    }
  }

  processJfmcReportLogic() {
    this.showReportPreview = false; 
    const selectedObj = this.referenceList.find(x => x.id == this.selectedReferenceId);
    const jfmcCode = selectedObj?.jfmcid || '';
    const beatName = this.beats.find(b => b.beat_id == this.selectedBeatActivity)?.beat_name || '';

    this.coreservices.getJFMCProfile(this.selectedReferenceId).subscribe({
      next: (res: any) => {
        let parsedRes = typeof res === 'string' ? JSON.parse(res) : res;
        if (typeof parsedRes === 'string') parsedRes = JSON.parse(parsedRes);
        let profileData = parsedRes.Data;
        this.jfmcReportData.push(profileData);

        if (typeof profileData === 'string') profileData = JSON.parse(profileData);
        
        this.coreservices.getSpecialJfmcDashboardData(beatName, jfmcCode).subscribe({
          next: (summaryRes: any) => {
            this.jfmcReportData = [
              {
                profile: profileData,
                summary: {
                  meetings: summaryRes.Data?.cntMeeting || 0,
                  loans: summaryRes.Data?.cntLoanSanctioned || 0,
                  amtSanctioned: summaryRes.Data?.sumLoanDisb || 0,
                  amtRepaid: summaryRes.Data?.sumAmountRecovered || 0,
                  loanDetails: summaryRes.Data?.shg_loan_detailes || []
                },
                assets: { jfmcSMCAssets: [], nursery: [], activity: [] }
              }
            ];

            this.showReportPreview = true;
            this.cdr.detectChanges();

            setTimeout(() => {
              document.getElementById('report-preview-section')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }
        });

        this.coreservices.getSMCDetails(beatName, jfmcCode).subscribe((res: any) => {
          let parsed: any;
          try {
            parsed = typeof res === 'string' ? JSON.parse(res) : res;
          } catch (e) {
            parsed = {};
          }
          const sData = parsed?.Data || {};
          if (Array.isArray(sData.tableInfo)) {
            this.smcTableInfo = sData.tableInfo;
          } else if (sData.tableInfo) {
            this.smcTableInfo = [sData.tableInfo]; 
          } else {
            this.smcTableInfo = []; 
          }
        });
      }
    });
  }

  processSmcReportLogic() {
    const beatName = this.beats.find(b => b.beat_id == this.selectedBeatActivity)?.beat_name || '';
    const selectedObj = this.referenceList.find(x => x.id == this.selectedReferenceId);
    const structName = selectedObj?.text || '';
    const structId = this.selectedReferenceId;

    this.coreservices.getSMCDashboardData(beatName, structName).subscribe((res: any) => {
      const baseData = typeof res === 'string' ? JSON.parse(res).Data : res.Data;
      const internalId = baseData.smc_basic_details[0]?.structure_id;

      this.coreservices.getSMCDimensions(this.selectedReferenceId).subscribe((dimRes: any) => {
        const dimensions = JSON.parse(dimRes.Data)[0] || {};

        this.coreservices.getSMCMonitoring(internalId, this.startDate, this.endDate).subscribe((monRes: any) => {
          this.smcReportData = {
            basic: baseData.smc_basic_details[0],
            dimensions: dimensions,
            monitoring: JSON.parse(monRes.Data) || []
          };
          this.showReportPreview = true;
          this.cdr.detectChanges();
        });
      });
    });
  }

  processShgReportLogic() {
    this.coreservices.getSHGDetails(this.selectedReferenceId).subscribe((res: any) => {
      const dataAll = typeof res === 'string' ? JSON.parse(res).Data : res.Data;
      this.shgReportDetails = {
        master: dataAll.shg_master[0] || {},
        geo: dataAll.v_shg_all_details[0] || {},
        members: dataAll.shg_hh_child || [],
        activities: dataAll.shg_activity || [],
        loans: dataAll.shg_loan_details || [],
        gradation: dataAll.shg_gradation[0]?.final_gradation || "NA"
      };

      this.http.get('http://183.82.114.29:9093/api/figs/GetAllShgPanchsutra').subscribe((pRes: any) => {
        this.shgReportDetails.panchsutra = pRes.Data || [];
        this.showReportPreview = true;
        this.cdr.detectChanges();
      });
    });
  }

  processNurseryReportLogic() {
    this.coreservices.getNurseryAllDetails(this.selectedBeatActivity, this.startDate, this.endDate).subscribe((res: any) => {
      const nurseryData = res.Data;
      let infraTotals = { mother: 0, temp: 0, permanent: 0, other: 0, poly: 0, mSize: 0, tSize: 0, pSize: 0, oSize: 0, polySize: 0, cost: 0 };

      (nurseryData.nursery_infra || []).forEach((item: any) => {
        infraTotals.mother += Number(item.num_of_mother_bed || 0);
        infraTotals.temp += Number(item.num_of_temp_bed || 0);
        infraTotals.permanent += Number(item.num_of_permanent_bed || 0);
        infraTotals.other += Number(item.num_of_other_bed || 0);
        infraTotals.poly += Number(item.polybag_number || 0);
        infraTotals.mSize += Number(item.mother_bed_size || 0);
        infraTotals.tSize += Number(item.temp_bed_size || 0);
        infraTotals.pSize += Number(item.permanent_bed_size || 0);
        infraTotals.cost += Number(item.total_cost || 0);
      });

      const nurseryHeader = this.referenceList.find(x => x.id == this.selectedReferenceId);

      this.nurseryReportDetails = {
        header: nurseryHeader,
        infra: infraTotals,
        infraList: nurseryData.nursery_infracost || [],
        seeding: nurseryData.nursery_seedsamp || [],
        stock: nurseryData.nursery_StockPosition || []
      };

      this.showReportPreview = true;
      this.cdr.detectChanges();
    });
  }

  onActivityFilterChange() {
    this.referenceList = [];
    this.selectedReferenceId = '';

    if (!this.selectedBeatActivity || !this.selectedModule) return;

    const beatObj = this.beats.find(b => b.beat_id == this.selectedBeatActivity);
    const beatName = beatObj ? beatObj.beat_name : '';
    const beatId = this.selectedBeatActivity;

    const distObj = this.districts.find(d => d.district_id == this.selectedDistrictActivity);
    const subObj = this.subdivisions.find(s => s.subdivision_id == this.selectedSubdivisionActivity);
    const rangeObj = this.ranges.find(r => r.range_id == this.selectedRangeActivity);
    const schemeObj = this.schemes.find(s => s.id == this.selectedSchemeActivity);

    const filters = {
      district: distObj ? distObj.district_name : '',
      subdivision: subObj ? subObj.subdivision_name : '',
      range: rangeObj ? rangeObj.range_name : '',
      scheme: schemeObj ? schemeObj.scheme_name : ''
    };

    switch (this.selectedModule) {
      case 'PLANTATION': this.fetchPlantationIds(beatId); break;
      case 'JFMC': this.fetchJfmcList(beatName); break;
      case 'SHG': this.fetchShgList(beatName, filters); break;
      case 'SMC': this.fetchSmcList(beatName); break;
      case 'NURSERY': this.fetchNurseryList(beatId); break;
    }
  }

  private fetchPlantationIds(beatId: any) {
    this.coreservices.getPlantationByBeat(beatId).subscribe((res: any) => {
      const result = typeof res === 'string' ? JSON.parse(res) : res;
      const data = result.Data || [];
      this.referenceList = data.map((item: any) => ({ id: item.id, text: item.plantation_id }));
      this.autoSelectReference();
    });
  }

  private fetchJfmcList(beatName: string) {
    this.coreservices.getJFMCByBeat(beatName).subscribe((res: any) => {
      const result = typeof res === 'string' ? JSON.parse(res) : res;
      const data = result.Data || [];
      this.referenceList = _.uniqBy(data, 'jfmc_id').map((item: any) => ({
        id: item.id,
        jfmcid: item.jfmc_id,
        text: item.name_of_committee
      }));
    });
  }

  private fetchShgList(beatName: string, f: any) {
    const params = { beats: beatName, schemeName: f.scheme, range: f.range, district: f.district, sub_district: f.subdivision };
    this.coreservices.getSHGByBeat(params).subscribe((res: any) => {
      const data = typeof res.Data === 'string' ? JSON.parse(res.Data) : res.Data;
      this.referenceList = _.uniqBy(data, 'shg_id').map((item: any) => ({ id: item.id, shg_id: item.shg_id, text: item.name }));
    });
  }

  private fetchSmcList(beatName: string) {
    this.http.get(`${this.coreservices.WebApiUrl}SMC/GetSMClISTbyBeat?beats=${beatName}`).subscribe((res: any) => {
      const data = typeof res.Data === 'string' ? JSON.parse(res.Data) : res.Data;
      this.referenceList = _.uniqBy(data, 'structure_id').map((item: any) => ({ id: item.id, structure_id: item.structure_id, text: item.type_of_structure }));
    });
  }

  private fetchNurseryList(beatId: any) {
    this.http.get(`${this.coreservices.WebApiUrl}Nursery/GetNurseyMasterDetailsByBeat?beat=${beatId}`).subscribe((res: any) => {
      const data = typeof res.Data === 'string' ? JSON.parse(res.Data) : res.Data;
      this.allNurseryList = data;
      this.referenceList = _.uniqBy(data, 'nursery_id').map((item: any) => ({ id: item.id, structure_id: item.nursery_id, text: item.name }));
    });
  }

  generatePlantationPDF() {
    const momentDate = (moment as any)().format('YYYYMMDD');
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: 'a3' });
    doc.rect(5, 5, 285, 405);
    doc.setFontSize(12);

    doc.text("District: " + String(this.selectedDistrictActivity || ''), 20, 20);
    doc.text("SubDivision: " + String(this.selectedSubdivisionActivity || ''), 110, 20);
    doc.text("Range: " + String(this.selectedRangeActivity || ''), 200, 20);
    doc.text("Beat: " + String(this.selectedBeatActivity || ''), 20, 30);
    doc.text("Duration: ", 110, 30);
    doc.text("Plantation ID: " + String(this.selectedReferenceId || ''), 200, 30);

    doc.rect(50, 40, 200, 110);
    doc.setFont("helvetica", "bold");
    doc.text("PRESURVEY", 150, 50, { align: 'center' });
    doc.setFont("helvetica", "normal");
    doc.text("Locality Name: ", 55, 65);
    doc.text("Type Of Survey: ", 55, 75);
    doc.text("Area/Length: ", 55, 85);
    doc.text("Comments with Approval/Rejection: ", 55, 95);
    doc.text("Field Officer: ", 55, 105);
    doc.text("Beat Officer: ", 55, 115);
    doc.text("Range Officer: ", 55, 125);
    doc.text("User Name: ", 55, 135);
    doc.text("Date: ", 175, 135);

    doc.rect(50, 160, 200, 110);
    doc.setFont("helvetica", "bold");
    doc.text("SITE MASTER", 150, 170, { align: 'center' });
    doc.setFont("helvetica", "normal");
    doc.text("Type Of Plantation: ", 55, 185);
    doc.text("Scheme Type: ", 55, 195);
    doc.text("Scheme: " + String(this.selectedSchemeActivity || ''), 150, 195);
    doc.text("Mode: ", 55, 205);
    doc.text("JFMC: ", 55, 215);
    doc.text("Comments with Approval/Rejection: ", 55, 225);
    doc.text("Field Officer: ", 55, 235);
    doc.text("Beat Officer: ", 55, 245);
    doc.text("Range Officer: ", 55, 255);
    doc.text("User Name: ", 55, 265);
    doc.text("Date: ", 175, 265);

    doc.rect(50, 280, 200, 110);
    doc.setFont("helvetica", "bold");
    doc.text("ADVANCE WORKS", 150, 290, { align: 'center' });
    doc.setFont("helvetica", "normal");
    doc.text("Type Of Species: ", 55, 305);
    doc.text("No. Of Pit Bugs: ", 55, 315);
    doc.text("Advance Work Completed: ", 55, 325);
    doc.text("Total Cost: ", 55, 335);
    doc.text("Man-Days(Male): ", 55, 345);
    doc.text("Man-Days(FeMale): ", 150, 345);
    doc.text("Field Officer: ", 55, 355);
    doc.text("Beat Officer: ", 55, 365);
    doc.text("Range Officer: ", 55, 375);
    doc.text("User Name: ", 55, 385);
    doc.text("Date: ", 175, 385);

    doc.save(`Plantation_Report_${momentDate}.pdf`);
  }

  getForestType(index: any) {
    const types = ["PF", "UF", "RF"];
    return types[index] || "NA";
  }

  onClickSubmit() {
    if (!this.selectedDistrictTop || this.selectedYear.length === 0) return;
    this.coreservices.getDashboardStats(this.selectedDistrictTop, this.selectedYear)
      .subscribe({
        next: (res: any) => { this.updateDashboardCharts(res); },
        error: (err) => { console.error("API FAILED!", err); }
      });
  }

  initCharts() {
    if (this.manDaysChart) this.manDaysChart.destroy();
    if (this.budgetChart) this.budgetChart.destroy();
    if (this.spentAnalysisChart) this.spentAnalysisChart.destroy();
    if (this.perCapitaChart) this.perCapitaChart.destroy();

    this.manDaysChart = new Chart('manDaysChart', {
      type: 'bar',
      data: { labels: ['Male', 'Female'], datasets: [{ label: 'Man Days', data: [0, 0], backgroundColor: ['#2ECC71', '#3498DB'], barThickness: 40 }] },
      options: { responsive: true, maintainAspectRatio: false }
    });

    this.spentAnalysisChart = new Chart('spentAnalysisChart', {
      type: 'line',
      data: { labels: [], datasets: [{ label: 'Spend', data: [], borderColor: '#3498DB', backgroundColor: 'rgba(52, 152, 219, 0.2)', borderWidth: 3, pointBackgroundColor: '#fff', pointBorderColor: '#3498DB', pointRadius: 5, tension: 0.4, fill: true }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });

    this.budgetChart = new Chart('budgetChart', {
      type: 'bar',
      data: { labels: ['Budget Overview'], datasets: [{ label: 'Allocated', data: [0], backgroundColor: '#2ECC71' }, { label: 'Utilized', data: [0], backgroundColor: '#E74C3C' }] },
      options: { responsive: true, maintainAspectRatio: false }
    });

   this.perCapitaChart = new Chart('perCapitaChart', {
  type: 'line',
  data: { labels: this.financialYears.map(y => y.label), datasets: [] },
  options: { responsive: true, maintainAspectRatio: false }
     });
    this.updatePerCapitaChart();
  }

  updateDashboardCharts(res: any) {
    if (!res || !this.manDaysChart || !this.spentAnalysisChart || !this.budgetChart) return;

    if (res.mandays_male !== undefined && res.mandays_female !== undefined) {
      this.manDaysChart.data.datasets[0].data = [res.mandays_male, res.mandays_female];
      this.manDaysChart.update();
    }

    if (res.Budgetlist && this.selectedYear && this.selectedYear.length > 0) {
      const fullYearData: number[] = new Array(12).fill(0);
      const fullYearLabels: string[] = [];
      const baseYear = parseInt(this.selectedYear[0], 10);

      for (let i = 0; i < 12; i++) {
        const monthIndex = (3 + i) % 12;
        const yearOffset = (3 + i) >= 12 ? 1 : 0;
        const targetMoment = (moment as any)([baseYear + yearOffset, monthIndex]);
        fullYearLabels.push(targetMoment.format('MMM YYYY'));
      }

      this.selectedYear.forEach((yearStr: string) => {
        const startYear = parseInt(yearStr, 10);
        for (let i = 0; i < 12; i++) {
          const monthIndex = (3 + i) % 12;
          const yearOffset = (3 + i) >= 12 ? 1 : 0;
          const targetMoment = (moment as any)([startYear + yearOffset, monthIndex]);
          const monthKey = targetMoment.format('YYYY-MM');
          const apiMatch = res.Budgetlist.find((b: any) => b.month_label === monthKey);
          fullYearData[i] += apiMatch ? apiMatch.total_expense : 0;
        }
      });

      this.spentAnalysisChart.data.labels = fullYearLabels;
      this.spentAnalysisChart.data.datasets[0].data = fullYearData;
      this.spentAnalysisChart.update();

      const totalUtilized = fullYearData.reduce((sum, val) => sum + val, 0);
      const dummyAllocated = totalUtilized > 0 ? totalUtilized * 1.5 : 5000000;
      this.budgetChart.data.datasets[0].data = [dummyAllocated];
      this.budgetChart.data.datasets[1].data = [totalUtilized];
      this.budgetChart.update();
    }
    this.cdr.detectChanges();
  }

  onBeatChange() {
    this.jfmclist = [];
    this.shglist = [];
    if (!this.selectedBeatActivity) return;

    const beatObj = this.beats.find(b => b.beat_id == this.selectedBeatActivity);
    const beatName = beatObj ? beatObj.beat_name : '';
    const beatId = this.selectedBeatActivity;
    if (!beatName) return;

    this.coreservices.getAllJfmclistByJurisdiction(beatName).subscribe((res: any) => {
      const result = typeof res === 'string' ? JSON.parse(res) : res;
      const data = typeof result.Data === 'string' ? JSON.parse(result.Data) : result.Data;
     this.jfmclist = _.uniqBy(data || [], 'name_of_committee');
      
      if (this.jfmclist.length > 1) {
        const firstCommittee = this.jfmclist[1].name_of_committee;
        setTimeout(() => { this.onJFMCChange(firstCommittee); });
      }
      this.cdr.detectChanges();
    });

    if (this.selectedModule === "PLANTATION") {
      this.http.get(`/ProjectMgmt/GetPlantationDetailsByBeatID?beatID=${beatId}`).subscribe((res: any) => {
        const data = typeof res === 'string' ? JSON.parse(res).Data : res.Data;
        this.referenceList = data.map((item: any) => ({ id: item.id, text: item.plantation_id }));
      });
    } else if (this.selectedModule === "JFMC") {
      this.http.get(`/Jfmc/GetAllJfmclistByJurisdiction?beats=${beatName}`).subscribe((res: any) => {
        const result = typeof res === 'string' ? JSON.parse(res) : res;
        if (result.Data) {
          this.referenceList = _.uniqBy(result.Data, 'jfmc_id').map((item: any) => ({ id: item.id, text: item.name_of_committee }));
        }
      });
    } else if (this.selectedModule === "SHG") {
      const params = `beats=${beatName}&schemeName=${this.selectedSchemeActivity || ''}`;
      this.http.get(`/SHGJLG/ShGlISTbyBeat?${params}`).subscribe((res: any) => {
        const data = typeof res.Data === 'string' ? JSON.parse(res.Data) : res.Data;
        this.referenceList = _.uniqBy(data, 'shg_id').map((item: any) => ({ id: item.id, text: item.name }));
      });
    } else if (this.selectedModule === "SMC") {
      this.http.get(`/SMC/GetSMClISTbyBeat?beats=${beatName}`).subscribe((res: any) => {
        const data = typeof res.Data === 'string' ? JSON.parse(res.Data) : res.Data;
        this.referenceList = _.uniqBy(data, 'structure_id').map((item: any) => ({ id: item.id, text: item.type_of_structure }));
      });
    } else if (this.selectedModule === "NURSERY") {
      this.http.get(`/Nursery/GetNurseyMasterDetailsByBeat?beat=${beatId}`).subscribe((res: any) => {
        const data = typeof res.Data === 'string' ? JSON.parse(res.Data) : res.Data;
        this.referenceList = _.uniqBy(data, 'nursery_id').map((item: any) => ({ id: item.id, text: item.name }));
      });
    }
  }

  generatePlantationReport() {
    if (!this.selectedReferenceId) {
      alert("Please select a Plantation ID first!");
      return;
    }
    this.plantationReportDetails = [];
    this.coreservices.getPlantationReportData(this.selectedReferenceId, this.startDate, this.endDate).subscribe({
      next: (res: any) => {
        const responseData = JSON.parse(res);
        this.plantationReportDetails.push(responseData.Data || {});
        this.showReportPreview = true;
        this.cdr.detectChanges();
        setTimeout(() => { document.getElementById('report-preview-section')?.scrollIntoView({ behavior: 'smooth' }); }, 100);
      }
    });
  }

  printCurrentReport() { window.print(); }
  closePreview() { this.showReportPreview = false; this.jfmcReportData = []; }

  isScatformScheme(): boolean {
    const schemeObj = this.schemes.find(s => s.id == this.selectedSchemeActivity);
    const schemeName = schemeObj ? schemeObj.scheme_name : '';
    return this.selectedSchemeActivity == 1 || schemeName.includes('SCATFORM');
  }

  autoSelectReference() {
    if (this.referenceList && this.referenceList.length > 0) {
      this.selectedReferenceId = this.referenceList[0].id;
    } else {
      this.selectedReferenceId = '';
    }
  }

 
}