import { Component, OnInit, ViewChild, ChangeDetectorRef } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { forkJoin } from 'rxjs';
import { CustomGridComponent } from "../../../shared/Grids/custom-grid.component";
import { ServerRequests } from "../../../services/ServerRequests";
import { GridColumn } from "../../../shared/Grids/grid-column.model";
import { DynamicField } from '../../../shared/dialog-boxes/dynamic-form.model';
import { factors } from "@turf/turf";

const CENTER_TYPE_OPTIONS = [
  { name: 'CC', value: 'CC' },
  { name: 'PPC', value: 'PPC' },
  { name: 'Mini CCFC', value: 'Mini CCFC' },
  { name: 'CCFC Center', value: 'CCFC Center' },
  { name: 'Advance Value Additional Unit', value: 'Advance Value Additional Unit' }
];

const OPERATED_BY_OPTIONS = [{ name: 'Forest Department', value: 'FD' }, { name: 'Others', value: 'OT' }];
const FOREST_DEPT_TYPE_OPTIONS = [{ name: 'TFD', value: 'FD' }, { name: 'Others', value: 'OT' }];

// Generate a static list of years to act as the "Year Picker"
const YEARS = Array.from({ length: 30 }, (_, i) => {
  const y = (new Date().getFullYear() + 5 - i).toString();
  return { name: y, value: y };
});

@Component({
  selector: 'app-creation-ccfc-center',
  templateUrl: './creation-ccfc-center.component.html',
  styleUrl: './creation-ccfc-center.component.css'
})
export class CreationCCFCCenterComponent implements OnInit {

  @ViewChild('grid') gridComponent!: CustomGridComponent;
  userid: any;
  data: any[] = [];
  hiddenFields: string[] = [];
  userDesignation: string = '';
  mappopup: boolean = false;
  disablegrid: boolean = false;
  dialogFields: DynamicField[] = [];
  localFormState: any = { operated_by: '', forest_department: '' };



  private primaryFields = ['sno', 'bo_status', 'ro_status', 'fo_status', 'user_name', 'createdby', 'actions', 'name_collection', 'id','center_id','createdat'];

  columns: GridColumn[] = [
    {
      field: 'actions', header: 'Action', type: 'actions',
      actions: [{ label: 'View', action: 'view_creation_ccf_center', tooltip: 'View', icon: '' }]
    },
    // { field: 'bo_status', header: 'Status(BO)' },
    // { field: 'ro_status', header: 'Status(RO)' },
    // { field: 'fo_status', header: 'Status (FO)' },
    { field: 'id', header: 'ID' },
    { field: 'center_id', header: 'Center ID' },
    { field: 'jfmc', header: 'JFMC' },
    { field: 'scheme', header: 'Scheme' },
    { field: 'type_of_center', header: 'Type of Center' },
    { field: 'name_collection', header: 'Collection Name' },
    { field: 'establish_year', header: 'Establish Year' },
    { field: 'volume', header: 'Volume' },
    { field: 'operated_by', header: 'Operated By' },
    { field: 'forest_department', header: 'Forest Department' },
    { field: 'other_values', header: 'Other Values' },
    { field: 'createdby', header: 'Created By' },
    { field: 'createdat', header: 'Created At' }
  ];

  constructor(
    private coreservices: ServerRequests,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {
    const session = sessionStorage.getItem("Session");
    if (session) {
      const sessionDetails = JSON.parse(session);
      this.userid = sessionDetails.Data[0].user_id;
      this.userDesignation = sessionDetails.Data[0].designation_name;
    }
  }

  ngOnInit(): void {
    this.getLookups();
    this.generateHiddenFields();
  }



  generateHiddenFields() {
    this.hiddenFields = this.columns.filter(col => !this.primaryFields.includes(col.field)).map(col => col.field);
    this.Loadcreationccfccenter();
  }


  // 4. LOAD TABLE DATA
  Loadcreationccfccenter() {
    this.coreservices.getNtfpCreateCenter().subscribe({
      next: (res: any) => {
        const parsedRes = typeof res === 'string' ? JSON.parse(res) : res;
        let rawData = parsedRes?.Data ? (typeof parsedRes.Data === 'string' ? JSON.parse(parsedRes.Data) : parsedRes.Data) : [];

        this.data = rawData.map((item: any, index: number) => ({
          ...item,
          ntfpcreationccfccentermodule:true,
          sno: index + 1,
          // Ensure field names match what the Grid expects
          name_collection: item.name_collection || item.center_name || '-',
          bo_status: item.bo_status === 'YES' ? 'Approved' : 'Pending',
          ro_status: item.ro_status === 'YES' ? 'Approved' : 'Pending',
          fo_status: item.fo_status === 'YES' ? 'Approved' : 'Pending'
        }));
        console.log("Loaded Data:", this.data);
      }
    });
  }



  getLookups() {
    const session = sessionStorage.getItem("Session") || sessionStorage.getItem("userdata");
    let userJurisdiction: any = { district: [], sub_division: [], range: [], beat: [] };
    let userBeats = '';

    if (session) {
      try {
        const sessionDetails = JSON.parse(session);
        const userData = sessionDetails.Data?.[0] || sessionDetails;
        if (userData.jurisdiction_details) {
          const details = JSON.parse(userData.jurisdiction_details);
          userJurisdiction = details.Jurisdiction || {};
          userBeats = Array.isArray(userJurisdiction.beat) ? userJurisdiction.beat.join(',') : (userJurisdiction.beat || '');
        }
      } catch (e) { console.error("Jurisdiction Parse Error:", e); }
    }

    //const baseUrl = "http://183.82.114.29:9093/api/";

    // Helper functions
    const safeParse = (res: any) => {
      if (!res) return null;
      let data = res;
      try {
        if (typeof data === 'string') {
          data = data.replace(/^APIResponse\s*:\s*/i, '').trim();
          data = JSON.parse(data);
        }
        return data.Data || data;
      } catch (e) { return res; }
    };

    const filterByJurisdiction = (list: any[], fieldKey: string, allowedValues: any[]) => {
      if (!allowedValues || allowedValues.length === 0) return list;
      const allowedSet = new Set(allowedValues.map(v => v.toString().toLowerCase()));
      return list.filter(item => item[fieldKey] && allowedSet.has(item[fieldKey].toString().toLowerCase()));
    };

    const getUniqueOptions = (list: any[]) => {
      const uniqueStrings = [...new Set(list.map(s => s?.toString().trim()).filter(x => !!x))];
      return uniqueStrings.map(val => ({ name: val, value: val }));
    };

    forkJoin({
      geo: this.coreservices.getAllGeo(),
      lookups: this.http.get(`${this.coreservices.BASE_URL}/GetAllLookUp`),
      jfmc: this.coreservices.getJfmclistByJurisdiction(userBeats)
    }).subscribe({
      next: (results: any) => {
        const geoRaw = results.geo.Data || [];
        const look = safeParse(results.lookups) || {};
        const jfmcList = safeParse(results.jfmc) || [];

        // Geographic filtering
        const filteredDistricts = filterByJurisdiction(geoRaw, 'district_name', userJurisdiction.district);
        const distOpts = getUniqueOptions(filteredDistricts.map(g => g.district_name));
        const subOpts = getUniqueOptions(filterByJurisdiction(filteredDistricts, 'subdivision_name', userJurisdiction.sub_division).map(g => g.subdivision_name));
        const rangeOpts = getUniqueOptions(filterByJurisdiction(geoRaw, 'range_name', userJurisdiction.range).map(g => g.range_name));
        const beatOpts = getUniqueOptions(filterByJurisdiction(geoRaw, 'beat_name', userJurisdiction.beat).map(g => g.beat_name));

        // Options
        const jfmcOpts = getUniqueOptions(jfmcList.map((x: any) => x.name_of_committee || x.jfmc_name));
        const schemeOpts = (look.scheme_master || []).map((s: any) => ({
          name: s.scheme_name,
          value: s.id
        }));

        this.dialogFields = [
          { name: 'district', label: 'DISTRICT', type: 'select', options: distOpts },
          { name: 'sub_district', label: 'SUB DIVISION', type: 'select', options: subOpts },
          { name: 'range', label: 'RANGE', type: 'select', options: rangeOpts },
          { name: 'beat', label: 'BEAT', type: 'select', options: beatOpts },
          { name: 'jfmc', label: 'JFMC', type: 'select', options: jfmcOpts },
          { name: 'scheme', label: 'SCHEME', type: 'select', options: schemeOpts },
          { name: 'type_of_center', label: 'TYPE OF CENTER', type: 'select', options: CENTER_TYPE_OPTIONS },
          { name: 'name_collection', label: 'CENTER NAME', type: 'text' },
          { name: 'establish_year', label: 'ESTABLISH YEAR', type: 'year', options: YEARS },

          { name: 'volume', label: 'VOLUME', type: 'number' },
          { name: 'operated_by', label: 'OPERATED BY', type: 'select', options: OPERATED_BY_OPTIONS },

          // Hidden fields
          { name: 'forest_department', label: 'IF FOREST DEPT (TYPE)', type: 'select', options: FOREST_DEPT_TYPE_OPTIONS, hidden: true },
          { name: 'other_values', label: 'SPECIFY OTHER VALUE', type: 'text', hidden: true }
        ];
      }
    });
  }

  private isAllowed(val: string, allowed: any[]) {
    if (!allowed || allowed.length === 0) return true;
    return allowed.some(a => a.toString().toLowerCase() === val?.toString().toLowerCase());
  }

  private getUniqueOptions(list: any[]) {
    return [...new Set(list)].filter(x => !!x).map(val => ({ name: val, value: val }));
  }


  handleFormChange(event: any) {
    const { field, value } = event;

    // Update our local tracker
    if (field === 'operated_by' || field === 'forest_department') {
      this.localFormState[field] = value;

      const opBy = this.localFormState['operated_by'];
      const forDept = this.localFormState['forest_department'];

      this.dialogFields = this.dialogFields.map(f => {
        if (f.name === 'forest_department') {
          return { ...f, hidden: opBy !== 'FD' };
        }

        if (f.name === 'other_values') {
          const show = (opBy === 'OT') || (opBy === 'FD' && forDept === 'OT');
          return { ...f, hidden: !show };
        }
        return f;
      });
    }
  }


  SaveRecord(data: any) {
    const session = sessionStorage.getItem("Session");
    let userName = this.userid.toString();
    if (session) {
      const details = JSON.parse(session);
      userName = details.Data[0].user_id;
    }

    const payload = {
      "district": data.district,
      "sub_district": data.sub_district,
      "range": data.range,
      "beat": data.beat,
      "jfmc": data.jfmc,
      "scheme": data.scheme,
      "scheme_id": data.scheme,
      "type_of_center": data.type_of_center,
      "name_collection": data.name_collection,
      "establish_year": data.establish_year,
      "volume": data.volume,
      "operated_by": data.operated_by,
      "forest_department": data.forest_department || "",
      "other_values": data.other_values || "",
      "createdby": userName
    };

    this.coreservices.insertNtfpCcfcCenter(payload).subscribe({
      next: (res: any) => {
        this.snackBar.open('Record Saved Successfully', 'Close', { duration: 3000 });
        this.Loadcreationccfccenter();
      }
    });
  }



  // 3. HANDLE VIEW AND FILE DOWNLOADS
  onGridAction(event: { action: string; row: any }) {
    if (event.action === 'view_creation_ccf_center') {
      this.disablegrid = true;
      let rowToView = { ...event.row };
      if (this.userDesignation === 'BEAT_OFFICER') rowToView.comments = event.row.ro_rej_comments || '-';
      else if (this.userDesignation === 'FIELD_OFFICER') rowToView.comments = event.row.bo_rej_comments || '-';
      setTimeout(() => { this.gridComponent?.openViewPopupFromOutside(rowToView); }, 0);
    }
  }


  // 5. ROLE APPROVAL LOGIC
  handleStatusUpdate(payload: any) {
    const module = "ntfp_nce_center";
    let Payload = {
      "Id": payload.id, "comments": payload.comments, status: payload.status, rejectreason: payload.rejectreason
    };

    if (Payload.status == "NO" && this.userDesignation == "RANGE_OFFICER") {
      this.coreservices.Insertcommonrejectdetails("RO", payload.rejectreason, Payload.Id, module).subscribe({
        next: () => { this.Loadcreationccfccenter(); this.snackBar.open('Data Saved', 'Close'); }
      });
    } else if (Payload.status == "NO" && this.userDesignation == "BEAT_OFFICER") {
      this.coreservices.Insertcommonrejectdetails("BO", payload.rejectreason, Payload.Id, module).subscribe({
        next: () => { this.Loadcreationccfccenter(); this.snackBar.open('Data Saved', 'Close'); }
      });
    } else if (this.userDesignation == "FIELD_OFFICER" && Payload.status == "YES") {
      this.coreservices.CommonApprovalforallroles("FO", "BO", Payload.Id, module).subscribe({
        next: () => { this.Loadcreationccfccenter(); this.snackBar.open('Data Saved', 'Close'); }
      });
    } else if (this.userDesignation == "BEAT_OFFICER" && Payload.status == "YES") {
      this.coreservices.CommonApprovalforallroles("BO", "RO", Payload.Id, module).subscribe({
        next: () => { this.Loadcreationccfccenter(); this.snackBar.open('Data Saved', 'Close'); }
      });
    } else if (this.userDesignation == "RANGE_OFFICER" && Payload.status == "YES") {
      this.coreservices.commonforallrolesapprovedrangedetails(Payload.Id, module).subscribe({
        next: () => { this.Loadcreationccfccenter(); this.snackBar.open('Data Saved', 'Close'); }
      });
    }
  }

}