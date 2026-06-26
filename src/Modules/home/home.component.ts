import { AfterViewInit, Component, OnInit } from '@angular/core';
import Chart from 'chart.js/auto';
import * as L from 'leaflet';
import html2canvas from 'html2canvas';
import { ServerRequests } from '../../services/ServerRequests';

@Component({
  selector: 'app-home-dashboard',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements AfterViewInit, OnInit {

  districttype: any[] = [];
  division: any[] = [];
  range: any[] = [];
  beat: any[] = [];

  selectedDistrict: any;
  divisionchange: any;
  rangechanged: any;
  subdivisionSelected: any;
  beatchanged: any;

  schematype: string[] = [];
  schemaname: any;
  schemeMaster: any = [];
  allbeatsdata: any;
  cardsdata: any;
  dashboarddata: boolean = false;
  fromDate: string = '';
  toDate: string = '';
  maxDate: string='';

  constructor(public coreservices: ServerRequests) {}

  // ================= INIT =================
  ngOnInit() {
    this.getallgeo();
    this.getLookups();
    const now = new Date();
    this.maxDate = now.toISOString().slice(0, 16);
  }

  ngAfterViewInit(): void {}

  // ================= DASHBOARD API =================
  getdashboarddata() {
  this.dashboarddata = true;
    let data = {
      beat: this.beatchanged ?? '',
      range: this.rangechanged ?? '',
      sub_district: this.subdivisionSelected ?? '',
      district: this.selectedDistrict ?? '',
      startDate: this.formatDate(this.fromDate),
      endDate: this.formatDate(this.toDate)
    };
    this.coreservices.GetPendingReport(this.selectedDistrict, this.subdivisionSelected, this.rangechanged, this.schemaname, this.beatchanged, this.formatDate(this.fromDate), this.formatDate(this.toDate)).subscribe({
      next: res => {
        const responseData = res?.Data ?? [];
        this.cardsdata = responseData;
        this.dashboarddata = false;
        this.cardsdata = this.transformData(responseData);
        sessionStorage.setItem("Dashboard Data", JSON.stringify(responseData));
      },
      error: err => console.error('Dashboard Error:', err)
    });
  }

  // ================= DATE FORMAT =================
  formatDate(date: string): string {
    if (!date) return '';
    return date.split('T')[0];
  }

  // ================= DOWNLOAD =================
  downloadDashboard() {
    const dashboardElement = document.getElementById('dashboard-container');

    if (dashboardElement) {
      html2canvas(dashboardElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#f0f2f5'
      }).then(canvas => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'Capacity_Dashboard_Report.png';
        link.click();
      });
    }
  }

  // ================= LOOKUPS =================
  getLookups() {
    this.coreservices.getAllLookUps(1).subscribe({
      next: res => {
        const schemaArray = res.Data.scheme_master;
        this.schemeMaster = schemaArray;

        if (!schemaArray) return;

        const list = Array.isArray(schemaArray) ? schemaArray : [schemaArray];
        this.schematype = [...new Set(list.map(item => item.scheme_name))];
      }
    });
  }

  // ================= GEO =================
  getallgeo() {
    this.coreservices.getAllGeo(1).subscribe({
      next: res => {
        this.allbeatsdata = res?.Data ?? [];
        sessionStorage.setItem("jurisdictionDetails", JSON.stringify(this.allbeatsdata));
        this.getjuridictiondetails();
      }
    });
  }

  getjuridictiondetails() {
    const data = sessionStorage.getItem('Session');
    if (!data) return;

    const parsedData = JSON.parse(data);
    const userId = parsedData.Data[0].user_id;

    this.coreservices.getjuridictiondetails(userId).subscribe({
      next: res => {
        const userdata = res?.Data ?? [];
        if (!userdata.length) return;

        const jurisdictionObj = JSON.parse(userdata[0].jurisdiction_details);

        if (jurisdictionObj.Jurisdiction?.district) {
          this.districttype = [jurisdictionObj.Jurisdiction.district[0]];
          this.selectedDistrict = this.districttype[0];
          this.onDistrictChange(this.selectedDistrict);
        }
      }
    });
  }

  // ================= DISTRICT =================
  onDistrictChange(value: any) {
    this.selectedDistrict = value;

    this.divisionchange = null;
    this.rangechanged = null;
    this.beatchanged = null;

    this.range = [];
    this.beat = [];

    const beats: any[] = JSON.parse(sessionStorage.getItem('jurisdictionDetails') || '[]');

    const districtBeats = beats.filter(
      b => b?.district_name?.toLowerCase() === value.toLowerCase()
    );

    const uniqueSubdivisions = Array.from(
      new Map(
        districtBeats.map(b => [b.subdivision_id, b.subdivision_name])
      ).values()
    );

    this.division = uniqueSubdivisions;
  }

  // ================= SUBDIVISION =================
  subdivisionchange(subdivision: any) {
    this.subdivisionSelected = subdivision;

    this.rangechanged = null;
    this.beatchanged = null;
    this.range = [];
    this.beat = [];

    const beats: any[] = JSON.parse(sessionStorage.getItem('jurisdictionDetails') || '[]');

    const filtered = beats.filter(
      b => b.subdivision_name === subdivision
    );

    const uniqueRanges = Array.from(
      new Set(filtered.map(b => b.range_name))
    );

    this.range = uniqueRanges;
  }

  // ================= RANGE =================
  rangechange(range: any) {
    this.rangechanged = range;

    this.beatchanged = null;
    this.beat = [];

    const beats: any[] = JSON.parse(sessionStorage.getItem('jurisdictionDetails') || '[]');

    const filtered = beats.filter(
      b => b.range_name === range
    );

    const uniqueBeats = Array.from(
      new Set(filtered.map(b => b.beat_name))
    );

    this.beat = uniqueBeats;
  }

  // ================= BEAT =================
  beatchange(beat: any) {
    this.beatchanged = beat;

    if (this.beatchanged && this.fromDate && this.toDate) {
      
    }
  }
  getpendingreport() {
    this.getdashboarddata();
  }


  // ================= SCHEME =================
  selectedschematype(event: any) {
     this.schemaname = event;
    const data = this.schemeMaster.find(
      (c: any) => c.scheme_name === event
     
    );
    if (data) this.schemaname = data.id;
  }
  transformData(payload: any) {
  const result: any = {};

  Object.keys(payload).forEach(key => {

    const [module, submodule, type] = key.split('|');

    if (!result[module]) {
      result[module] = {};
    }

    if (!result[module][submodule]) {
      result[module][submodule] = {
        CAP: 0,
        FORAPPR: 0,
        APPROVED: 0
      };
    }

    if (type) {
      result[module][submodule][type] = payload[key];
    }
  });

  // convert to array for UI
  const finalData: any[] = [];

  Object.keys(result).forEach(module => {
    Object.keys(result[module]).forEach(submodule => {
      finalData.push({
        module,
        submodule,
        CAP: result[module][submodule].CAP ?? 'NA',
        FORAPPR: result[module][submodule].FORAPPR ?? 'NA',
        APPROVED: result[module][submodule].APPROVED ?? 'NA'
      });
    });
  });
  return finalData;
}
}