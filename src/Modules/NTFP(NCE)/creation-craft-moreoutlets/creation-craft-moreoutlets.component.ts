import { Component, OnInit, ViewChild,ChangeDetectorRef } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { forkJoin } from 'rxjs'; 
import { CustomGridComponent } from "../../../shared/Grids/custom-grid.component";
import { ServerRequests } from "../../../services/ServerRequests";
import { GridColumn } from "../../../shared/Grids/grid-column.model";
import { DynamicField } from '../../../shared/dialog-boxes/dynamic-form.model';

const OPERATED_BY_OUTLET = [
  { name: 'JFMC', value: 'JFMC' },
  { name: 'TRLM', value: 'TRLM' },
  { name: 'TULM', value: 'TULM' },
  { name: 'NCE', value: 'NCE' }
];


@Component({
  selector: 'app-creation-craft-moreoutlets',
  templateUrl: './creation-craft-moreoutlets.component.html',
  styleUrl: './creation-craft-moreoutlets.component.css'
})
export class CreationCraftMoreoutletsComponent implements OnInit {

 @ViewChild('grid') gridComponent!: CustomGridComponent;
  userid: any;
  data: any[] = [];
  hiddenFields: string[] = []; 
  userDesignation: string = '';
  mappopup: boolean = false;
  disablegrid: boolean = false;
  dialogFields: DynamicField[] = [];

 
 
  private primaryFields = ['user_name', 'createdby', 'actions','id','outlet_id','createdat'];

  columns: GridColumn[] = [
    {
      field: 'actions', header: 'Action', type: 'actions',
      actions: [{ label: 'View', action: 'view_craftsandmore', tooltip: 'View', icon: '' }]
    },
    // { field: 'bo_status', header: 'Status(BO)' },
    // { field: 'ro_status', header: 'Status(RO)' },
    // { field: 'fo_status', header: 'Status (FO)' },
   { field: 'id', header: 'ID' },
  { field: 'outlet_id', header: 'Outlet ID' },
  { field: 'jfmc', header: 'JFMC' },
  { field: 'outlet_name', header: 'Outlet Name' },
  { field: 'outlet_location', header: 'Outlet Location' },
  { field: 'operated_by', header: 'Operated By' },
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
    this.getLookups();
    this.Loadcreationcraftmoreoutlets(); 
  }

 getLookups() {
  // 1. Get Session Data and correctly parse the complex Jurisdiction string
  const session = sessionStorage.getItem("Session") || sessionStorage.getItem("userdata");
  let userJurisdiction: any = { district: [], sub_division: [], range: [], beat: [] };
  let userBeats = '';

  if (session) {
    try {
      const sessionDetails = JSON.parse(session);
      const userData = sessionDetails.Data?.[0] || sessionDetails;
      
      // Handle the nested 'jurisdiction_details' string provided in your session sample
      if (userData.jurisdiction_details) {
        const details = JSON.parse(userData.jurisdiction_details);
        userJurisdiction = details.Jurisdiction || {};
        const beats = userJurisdiction.beat || [];
        userBeats = Array.isArray(beats) ? beats.join(',') : beats;
      }
    } catch (e) { 
      console.error("Jurisdiction Parse Error:", e); 
    }
  }

  // Helper: Create Unique Dropdown Options
  const getUniqueOptions = (list: any[]) => {
    const uniqueStrings = [...new Set(list.map(s => s?.toString().trim()).filter(x => !!x))];
    return uniqueStrings.map(val => ({ name: val, value: val }));
  };

  // Helper: Filter API lists based on user's allowed Jurisdiction array
  const filterByJurisdiction = (list: any[], fieldKey: string, allowedValues: any[]) => {
    if (!allowedValues || allowedValues.length === 0) return list;
    const allowedSet = new Set(allowedValues.map(v => v.toString().toLowerCase()));
    return list.filter(item => item[fieldKey] && allowedSet.has(item[fieldKey].toString().toLowerCase()));
  };

  // 2. Fetch Geographic and JFMC data simultaneously
  forkJoin({
    geo: this.coreservices.getAllGeo(),
    jfmc: this.coreservices.getJfmclistByJurisdiction(userBeats)
  }).subscribe({
    next: (results: any) => {
      const geoRaw = results.geo.Data || [];
      
      // Handle inconsistent JFMC API response formats
      let jfmcRaw = results.jfmc;
      if (typeof jfmcRaw === 'string') {
        jfmcRaw = JSON.parse(jfmcRaw.replace(/^APIResponse\s*:\s*/i, ''));
      }
      const jfmcList = jfmcRaw.Data || jfmcRaw || [];

      // 3. Apply Jurisdiction Filters to Geo data
      const filteredDistricts = filterByJurisdiction(geoRaw, 'district_name', userJurisdiction.district);
      const distOpts = getUniqueOptions(filteredDistricts.map(g => g.district_name));
      
      const filteredSubDiv = filterByJurisdiction(geoRaw, 'subdivision_name', userJurisdiction.sub_division);
      const subOpts = getUniqueOptions(filteredSubDiv.map(g => g.subdivision_name));

      const filteredRange = filterByJurisdiction(geoRaw, 'range_name', userJurisdiction.range);
      const rangeOpts = getUniqueOptions(filteredRange.map(g => g.range_name));

      const filteredBeat = filterByJurisdiction(geoRaw, 'beat_name', userJurisdiction.beat);
      const beatOpts = getUniqueOptions(filteredBeat.map(g => g.beat_name));

      const jfmcOpts = getUniqueOptions(jfmcList.map((x: any) => x.name_of_committee || x.jfmc_name));

      // 4. Final Dialog Field Population
      this.dialogFields = [
        { name: 'district', label: 'DISTRICT', type: 'select', options: distOpts },
        { name: 'outlet_name', label: 'OUTLET NAME', type: 'text' },
        { name: 'outlet_location', label: 'LOCATION NAME', type: 'text' },
        
        // Hardcoded Operated By Options
        { name: 'operated_by', label: 'OPERATED BY', type: 'select', options: [
            { name: 'JFMC', value: 'JFMC' },
            { name: 'TRLM', value: 'TRLM' },
            { name: 'TULM', value: 'TULM' },
            { name: 'NCE', value: 'NCE' }
          ] 
        },

        // Jurisdiction fields are HIDDEN by default (Visible only if Operated By == JFMC)
        { name: 'sub_district', label: 'SUB DISTRICT', type: 'select', options: subOpts, hidden: true },
        { name: 'range', label: 'RANGE', type: 'select', options: rangeOpts, hidden: true },
        { name: 'beat', label: 'BEAT', type: 'select', options: beatOpts, hidden: true },
        { name: 'jfmc', label: 'JFMC', type: 'select', options: jfmcOpts, hidden: true }
      ];
    },
    error: (err) => {
      this.snackBar.open('Network Error loading form options', 'Close');
    }
  });
}

handleFormChange(event: any) {
  if (event.field === 'operated_by') {
    const isJFMC = event.value === 'JFMC';
    
    this.dialogFields = this.dialogFields.map(field => {
      // Toggle these 4 fields based on JFMC selection
      if (['sub_district', 'range', 'beat', 'jfmc'].includes(field.name)) {
        return { ...field, hidden: !isJFMC };
      }
      return field;
    });
  }
}

 SaveRecord(data: any) {
  const isJFMC = data.operated_by === 'JFMC';

  const payload = {
    "outlet_id": "NA",
    "district": data.district,
    "sub_division": isJFMC ? data.sub_district : "",
    "range": isJFMC ? data.range : "",
    "beat": isJFMC ? data.beat : "",
    "jfmc": isJFMC ? data.jfmc : "",
    "outlet_name": data.outlet_name,
    "outlet_location": data.outlet_location,
    "operated_by": data.operated_by,
    "createdby": this.userid.toString()
  };

  this.coreservices.insertNtfpOutletCraft(payload).subscribe({
    next: (res: any) => {
      const result = typeof res === 'string' ? JSON.parse(res) : res;
      if (result.status == 200 || result.status == true) {
        this.snackBar.open('Record Saved Successfully', 'Close', { duration: 3000 });
        this.Loadcreationcraftmoreoutlets();
      } else {
        this.snackBar.open(result.Data || 'Error saving data', 'Close');
      }
    }
  });
}

 

  // 3. HANDLE VIEW AND FILE DOWNLOADS
  onGridAction(event: { action: string; row: any }) {
    if (event.action === 'view_craftsandmore') {
      this.disablegrid = true;
      let rowToView = { ...event.row };
      if (this.userDesignation === 'BEAT_OFFICER') rowToView.comments = event.row.ro_rej_comments || '-';
      else if (this.userDesignation === 'FIELD_OFFICER') rowToView.comments = event.row.bo_rej_comments || '-';
      setTimeout(() => { this.gridComponent?.openViewPopupFromOutside(rowToView); }, 0);
    }
  }



  // 4. LOAD TABLE DATA
  Loadcreationcraftmoreoutlets() {
    this.coreservices.getNtfpOutletCraft().subscribe({
      next: (res: any) => {
        const parsedRes = typeof res === 'string' ? JSON.parse(res) : res;
        let rawData = parsedRes?.Data ? (typeof parsedRes.Data === 'string' ? JSON.parse(parsedRes.Data) : parsedRes.Data) : [];
        console.log("Raw API Craft more outlets Data:", rawData);
        
        this.data = [...rawData.map((item: any, index: number) => ({
          ...item,
          sno: index + 1,
          ntfpcreationcraftmoreoutlets:true,
          createdat: item.createdat,
          // bo_status: item.bo_status === 'YES' ? 'Approved' : 'Pending',
          // ro_status: item.ro_status === 'YES' ? 'Approved' : 'Pending',
          // fo_status: item.fo_status === 'YES' ? 'Approved' : 'Pending'
        }))];
      }
    });
  }

  // 5. ROLE APPROVAL LOGIC
  handleStatusUpdate(payload: any) {
    const module = "ntfp_nce_more_outlets";
    let Payload = {  
      "Id": payload.id, "comments": payload.comments, status :payload.status, rejectreason:payload.rejectreason
    };

    if (Payload.status == "NO" && this.userDesignation == "RANGE_OFFICER") {
      this.coreservices.Insertcommonrejectdetails("RO", payload.rejectreason, Payload.Id, module).subscribe({
        next: () => { this.Loadcreationcraftmoreoutlets(); this.snackBar.open('Data Saved', 'Close'); }
      });
    } else if(Payload.status == "NO" && this.userDesignation == "BEAT_OFFICER"){
      this.coreservices.Insertcommonrejectdetails("BO", payload.rejectreason, Payload.Id, module).subscribe({
        next: () => { this.Loadcreationcraftmoreoutlets(); this.snackBar.open('Data Saved', 'Close'); }
      });
    } else if (this.userDesignation == "FIELD_OFFICER" && Payload.status == "YES") {
      this.coreservices.CommonApprovalforallroles("FO", "BO", Payload.Id, module).subscribe({
        next: () => { this.Loadcreationcraftmoreoutlets(); this.snackBar.open('Data Saved', 'Close'); }
      });
    } else if (this.userDesignation == "BEAT_OFFICER" && Payload.status == "YES") {
      this.coreservices.CommonApprovalforallroles("BO", "RO", Payload.Id, module).subscribe({
        next: () => { this.Loadcreationcraftmoreoutlets(); this.snackBar.open('Data Saved', 'Close'); }
      });
    } else if (this.userDesignation == "RANGE_OFFICER" && Payload.status == "YES") {
      this.coreservices.commonApprovedByRangeo(Payload.Id, module).subscribe({
        next: () => { this.Loadcreationcraftmoreoutlets(); this.snackBar.open('Data Saved', 'Close'); }
      });
    }
  }

}