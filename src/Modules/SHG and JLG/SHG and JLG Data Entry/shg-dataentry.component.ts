import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ServerRequests } from '../../../services/ServerRequests';
import { GridColumn } from '../../../shared/Grids/grid-column.model';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Router } from '@angular/router';
import { shgdataEntry } from './shgsession';

@Component({
  selector: 'app-shg-dataentry.component',
  templateUrl: './shg-dataentry.component.html',
  styleUrls: ['./shg-dataentry.component.css']
})
export class ShgDataEntryComponent implements OnInit {

  // --- Data Variables ---
  data: any[] = [];
  disablebox: boolean = false;
  session: shgdataEntry = new shgdataEntry();
  showPanel = false;
  panelData: any;

  // --- UI Flags ---
  isAddingNew = false;
  currentStep = 1;
  aftersaving = false;

  // --- Dropdowns ---
  activityType: any[] = [];
  partispantstype: any[] = [];
  categoryofactivity: any[] = [];
  listofTrainings: any[] = [];
  activityTypeID: any;
  partispantstypeID: any;
  categoryofactivityID: any;
  listofTrainingsID: string = '';
  sessionTraingId: any;
  lookupData: any;
  selectedFile: File | null = null;
  showTrainingError: boolean = false;
  participantFileName: string = ''; // To show name in HTML
  participantFile: File | null = null; // To store actual file
  savedSessionsList: any[] = [];

  districttype: any[] = [];
  division: any = [];
  range: any = [];
  beat: any = [];
  Jfmc_edc: any = [];
  beatname: string = '';
  Jfmc_edcname: string = '';


  selectedDistrict: any;

  divisionchange: any;
  rangechanged: any;
  schematype: string[] = [];
  schemaname: any;
  allbeatsdata: any;
  schemaMaster: any[] = [];
  viewData: any;
  generalInfo: any;
  bankDetails: any[] = [];
  membersList: any[] = [];
  loanDetails: any[] = [];
  gradation: any;
  generalInfoList: any[] = [];
  microplanList: any[] = [];
  banklist: any[] = [];
  memberlist: any[] = [];
  shg_Id: string = '';
  actualshg_id:any;
  showMemberPopup:boolean = false;
  // =========================================================
  // 1. COLUMN DEFINITIONS (Matches Screenshot)
  // =========================================================
  columns: GridColumn[] = [
    { field: 'sno', header: 'SL.NO.' },
    {
      header: 'Action',
      type: 'actions',
      field: '',
      actions: [
        { icon: 'fa fa-eye', action: 'shgdataEntry view', tooltip: 'View' }
      ]
    },
    { field: 'name', header: 'SHG Name' },
    { field: 'shg_id', header: 'SHG ID' },
    { field: 'shg_jfmc_name', header: 'JFMC Name' },
    { field: 'scheme_name', header: 'Scheme' },
    { field: 'shg_subdiv', header: 'Sub Division' },
    { field: 'shg_range', header: 'Range' },
    { field: 'shg_beat', header: 'Beat' },
    { field: 'sgh_type', header: 'Type' },
    { field: 'date_of_formation', header: 'Date of Formation' }
  ];
  userid: any;
  isViewPopupOpen: boolean = false;
  lookupStore: any = [];

  constructor(
    private coreservices: ServerRequests,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    var session = sessionStorage.getItem("Session");
    if (session) {
      var sessionDetails = JSON.parse(session);
      this.userid = sessionDetails.Data[0].user_id;
    }

  }
   
  getName(lookupKey: string, value: any): string {
    if (!this.lookupStore || !this.lookupStore[lookupKey]) return value;

    const item = this.lookupStore[lookupKey].find(
      (x: any) => x.id == value || x.value == value || x.code == value
    );

    return item
      ? item.scheme_name || item.name || item.text || item.description
      : value;
  }
  ngOnInit(): void {
    this.getLookups();
    this.loadSHGData();
    this.getjuridictiondetails();
    this.getallgeo();

  }

  // --- DATA LOADING ---
  loadSHGData() {

    this.coreservices.getShgdatalist(this.userid).subscribe({
      next: (res: any) => {

        let parsedRes = res;

        // 👉 if API returns string, convert to object
        if (typeof res === 'string') {
          parsedRes = JSON.parse(res);
        }

        let rawData = [];

        if (parsedRes && parsedRes.Data) {
          rawData = parsedRes.Data;
          sessionStorage.setItem("shglist", JSON.stringify(rawData));
        } else if (Array.isArray(parsedRes)) {
          rawData = parsedRes;
        }

        // 👉 map data with serial number
        this.data = rawData.map((item: any, index: number) => ({
          ...item,
          sno: index + 1,
          shgdataentry:true,
          scheme_name: this.getName('scheme_master', item.shg_scheme),

          // optional: format date
          date_of_formation: item.date_of_formation
            ? new Date(item.date_of_formation).toLocaleDateString()
            : '',

          createdat: item.createdat
            ? new Date(item.createdat).toLocaleString()
            : ''
        }));


      },
      
      error: (err: any) => {
        console.error(err);

        this.snackBar.open('Failed to load SHG data', 'Close', { duration: 3000 });
      }

    });
  console.log("SHG Data Grid",this.data);
  }
  // --- GRID ACTIONS ---

  onGridAction(event: { action: string; row: any }) {
    const row = event.row;

    switch (event.action) {
      case 'shgdataEntry view':
        this.openView(row.id);   // pass row.id here
        break;

      case 'edit':
        // edit logic
        break;

      case 'delete':
        // delete logic
        break;
    }
  }


  openView(shg_id: string) {
    this.coreservices.getShgRelDetails(shg_id).subscribe({
      next: (res) => {

        let parsedRes = res;

        // if string → convert to object
        if (typeof res === 'string') {
          parsedRes = JSON.parse(res);
        }

        let rawData = parsedRes.Data || {};
        sessionStorage.setItem("ShgViewList", JSON.stringify(rawData));

        console.log("View Data:", rawData);

        this.viewData = rawData;

        // ✅ General Info Object
        const g = rawData.v_shg_all_details?.[0] || {};
        this.shg_Id = rawData.shg_bank_details[0].shg_id;
        this.actualshg_id=this.shg_Id;

        // ✅ Prepare LEFT CARD
        this.generalInfoList = [
          { label: 'Name', value: g.name },
          { label: 'Type', value: g.sgh_type },
          { label: 'Formed Under', value: g.shg_scheme },
          {
            label: 'Date of Formation',
            value: g.date_of_formation
              ? new Date(g.date_of_formation).toLocaleDateString()
              : ''
          },
          { label: 'JFMC', value: g.shg_jfmc_name }
        ];

        // ✅ Prepare RIGHT CARD (you can adjust fields if API differs)
        this.microplanList = [
          { label: 'Total Members', value: g.total_number_of_members },
          { label: 'SC Members', value: g.no_o_sc_members },
          { label: 'ST Members', value: g.no_of_st },
          { label: 'General', value: g.no_of_general },
          { label: 'Minor', value: g.no_of_minor }
        ];

        // other sections (already you have)
        this.bankDetails = rawData.shg_bank_details || [];
        this.membersList = rawData.shg_hh_child || [];
        this.loanDetails = rawData.shg_loan_details || [];

        // open modal
        this.isViewPopupOpen = true;
      },

      error: (err) => {
        console.error("Error fetching details", err);
      }
    });
  }
  closeViewPopup() {
    this.isViewPopupOpen = false;
  }

  // --- VIEW PARTICIPANTS ---
  viewParticipantslist(row: any): void {
    if (!row) return;
    this.disablebox = true; // Hide Grid

    this.coreservices
      .getapprovedPartispantslist(row.training_id, row.participants_type_id)
      .subscribe(res => {
        this.panelData = {
          title: "Participant's List",
          columns: [
            { field: 'sno', header: 'SNo' },
            { field: 'name', header: 'Name' },
            { field: 'age', header: 'Age' },
            { field: 'gender', header: 'Gender' },
            { field: 'aadhar_no', header: 'Aadhar Number' },
            { field: 'mobile_no', header: 'Mobile No' }
          ],
          rows: (res?.Data ?? []).map((p: any, i: number) => ({ ...p, sno: i + 1 }))
        };
        this.showPanel = true; // Show Panel
      });
  }

  // --- VIEW SESSIONS ---
  viewSessionslist(row: any): void {
    if (!row) return;
    this.disablebox = true;

    this.coreservices.getapprovedsessionlist(row.training_id).subscribe(res => {
      const sessions = res?.Data ?? [];
      const rows = sessions.map((s: any, index: number) => {
        let fileIDs: number[] = [];
        try {
          const parsed = JSON.parse(s.session_resource_files_details);
          fileIDs = parsed.resource_file_id ?? [];
        } catch (e) { }
        return { ...s, fileIDs, sno: index + 1 };
      });

      this.panelData = {
        title: "Session's List",
        columns: [
          { field: 'sno', header: 'SNo' },
          { field: 'name_of_session', header: 'Session Name' },
          { field: 'name_of_resource', header: 'Name of Resource' },
          { field: 'resource_specilization', header: 'Resource Specilization' },
          { field: 'start_date', header: 'Start Date' },
          { field: 'end_date', header: 'End Date' },
          {
            field: 'fileIDs', header: 'Download', type: 'actions', actions: [
              { icon: 'fa fa-download', action: 'downloadFile', tooltip: 'Download File' }
            ]
          }
        ],
        rows
      };
      this.showPanel = true;
    });
  }

  onParticipantFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.participantFile = input.files[0];
      this.participantFileName = this.participantFile.name; // Update text
      this.snackBar.open(`Selected: ${this.participantFileName}`, 'Ok', { duration: 2000 });
    }
  }
  // --- DOWNLOAD FILE ---
  downloadFile(sessionRow: any) {
    if (!sessionRow.fileIDs || sessionRow.fileIDs.length === 0) return;
    const FileID = sessionRow.fileIDs[0];

    this.coreservices.getApprovedresourcefile(FileID).subscribe(fileResult => {
      const files = fileResult?.Data ? fileResult.Data[0] : fileResult;
      if (!files?.file_data) return;

      let base64 = files.file_data.trim();
      base64 = base64.replace(/^"(.*)"$/, '$1').replace(/\s/g, '');

      try {
        const byteCharacters = atob(base64);
        const byteNumbers: number[] = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: `application/${files.file_type}` });
        const link = document.createElement('a');
        link.href = (window.URL || window.webkitURL).createObjectURL(blob);
        link.download = files.file_name;
        link.click();
        window.URL.revokeObjectURL(link.href);
      } catch (e) {
        console.error('Failed to decode Base64:', e);
      }
    }, err => console.error('Error fetching file:', err));
  }

  // --- WIZARD NAVIGATION ---
  toggleAddNew(show: boolean) {
    this.isAddingNew = show;

    // Only reset if we are CLOSING the form (show == false)
    if (!show) {
      this.resetAllData();
    }
  }
  downloadTemplate() {
    // Define the headers you expect in the excel/csv
    const csvData = "Participant Name,Age,Gender,Mobile Number,Aadhar Number,Designation";

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Participant_Upload_Template.csv'; // File name
    link.click();
    window.URL.revokeObjectURL(url);
  }




  resetAllData() {
    this.currentStep = 1;
    this.aftersaving = false;
    this.selectedFile = null;

    // Reset Dropdowns
    this.activityTypeID = null;
    this.partispantstypeID = null;
    this.categoryofactivityID = null;
    this.listofTrainingsID = '';
    this.listofTrainings = [];

    // Reset Error Flag
    this.showTrainingError = false;
    this.participantFileName = '';
    this.participantFile = null;
    this.savedSessionsList = [];
  }


  nextStep() {
    if (this.currentStep < 2) {
      this.currentStep++;
    }

    else if (this.currentStep < 3) this.currentStep++;
  }



  prevStep() { if (this.currentStep > 1) this.currentStep--; }

  submitForm() {
    this.snackBar.open('Training Session Created Successfully!', 'Close', { duration: 3000 });
    this.toggleAddNew(false);
  }

  closePanel() {
    this.showPanel = false;
    this.disablebox = false;
  }

  showFeedbackSnackBar(trainingId: any) {
    let snackBarRef = this.snackBar.open('Feedback form is ready', 'OPEN', {
      duration: 5000,
      verticalPosition: 'bottom'
    });

    snackBarRef.onAction().subscribe(() => {
      // This MUST match the path you defined in app-routing.module.ts
      this.router.navigate(['/feedback', trainingId], { queryParams: { ptype: 'department' } });
    });
  }

  // --- LOOKUPS & SELECTION LOGIC (Unchanged) ---
  getLookups() {
    this.coreservices.getAllLookUps(1).subscribe({
      next: (res: any) => {
        this.lookupData = res?.Data;
        this.lookupStore = this.lookupData;
        if (!this.lookupData) return;

        const list = (k: string) => {
          const d = res.Data[k];
          return Array.isArray(d) ? d : (d ? [d] : []);
        };

        this.activityType = list('activity_type_master');
        this.partispantstype = list('participants_type_master');

        this.schemaMaster = list('scheme_master');

        this.schematype = this.schemaMaster.map(x => x.scheme_name);

        this.categoryofactivity = [
          { name: 'SHG', value: 'SHG' },
          { name: 'JLG', value: 'JLG' }
        ];
      },
      error: (err) => console.error("Lookup API Error:", err)
    });
  }


  selectedActivityType(event: string) {
    const s = this.lookupData.activity_type_master?.find((c: any) => c.name === event);
    if (s) this.activityTypeID = s.id;
  }
  selectedpartispantType(event: any) {
    const s = this.lookupData.participants_type_master?.find((c: any) => c.name === event);
    if (s) this.partispantstypeID = s.id;
  }

  selectedcatgeoryType(value: any) {
    console.log("1. Dropdown Selection Event Value:", value);
    console.log("2. Available Categories in Lookup:", this.lookupData?.category_of_activity);

    // FIX 1: The 'value' is likely the ID because HTML has valueKey="id".
    // We updated the .find() logic to check 'id' as well.
    const s = this.lookupData.category_of_activity?.find((c: any) =>
      c.id == value || c.name === value || c.description === value
    );

    if (s) {
      console.log("3. Found Category Object:", s);
      this.categoryofactivityID = s.id;

      console.log(`4. Calling API with ActivityID: ${this.activityTypeID} & CategoryID: ${this.categoryofactivityID}`);

      this.coreservices.getTrainingfilterFeedback(this.activityTypeID, this.categoryofactivityID).subscribe({
        next: (res: any) => {
          console.log("5. API Raw Response:", res);

          // FIX 2: Ensure we extract the array correctly even if structure varies slightly
          const rawData = res?.Data || res || [];
          const listArr = Array.isArray(rawData) ? rawData : [rawData];

          this.listofTrainings = listArr;
          this.sessionTraingId = listArr;

          console.log("6. Final listofTrainings Array:", this.listofTrainings);

          // DEBUG CHECK: Verify if 'topic' property exists for the dropdown
          if (this.listofTrainings.length > 0) {
            const firstItem = this.listofTrainings[0];
            console.log("7. Keys in first item:", Object.keys(firstItem));

            if (!firstItem.hasOwnProperty('topic')) {
              console.warn("⚠️ WARNING: The objects do not have a 'topic' property!");
              console.warn("Please change displayKey='topic' in HTML to match one of the keys above (e.g., 'Topic', 'training_name').");
            }
          }
        },
        error: (err) => console.error("API Error:", err)
      });
    } else {
      console.error("❌ Error: Could not find the selected category in the lookup data.");
    }
  }
  selectedtrainingType(id: any) {
    this.listofTrainingsID = id;
    if (id) {
      this.showTrainingError = false; // Hide error immediately on selection
    }
  }

save() {

  // =========================
  // 1️⃣ PREPARE INNER OBJECTS
  // =========================

  const shgmaster = {
    name: this.session.name,
    shg_scheme: this.schemaname,
    sgh_type: this.categoryofactivityID,
    date_of_formation: this.session.date_of_formation,
    shg_district: this.selectedDistrict,
    shg_subdiv: this.divisionchange,
    shg_range: this.rangechanged,
    shg_beat: this.beatname,
    shg_jfmc_name: this.Jfmc_edcname,
    createdby: this.userid,
    beat_id: this.beatname,
    shg_scheme_id: Number(this.schemaname)
  };

  const shgbankdetails = {
    name_of_bank: this.session.nameBank,
    name_of_branch: this.session.nameBranch,
    account_number: this.session.accountNumber,
    ifsc_code: this.session.Ifsc
  };

  const shghhdetails = {
    no_o_sc_members: this.session.noofSCMembers,
    no_of_st: this.session.noofSTMembers,
    no_of_minor: this.session.minorityMemebers,
    no_of_general: this.session.generalNumber,
    total_number_of_members: this.membersList.length
  };

  const shghhchild = this.membersList || [];

  // =========================
  // 2️⃣ VALIDATION
  // =========================

  if (shghhchild.length === 0) {
    this.snackBar.open('Please add at least one member', 'Close', {
      duration: 3000
    });
    return;
  }

  for (let member of shghhchild) {

    if (!member.name) {
      this.snackBar.open('Member name is required', 'Close', {
        duration: 3000
      });
      return;
    }

    if (!member.aadhar_no || member.aadhar_no.length !== 12) {
      this.snackBar.open('Aadhar must be exactly 12 digits', 'Close', {
        duration: 3000
      });
      return;
    }

  }

  // =========================
  // 3️⃣ PREPARE CHILD LIST
  // =========================

  const payload = shghhchild.map((member: any) => ({
    name: member.name,
    designation: member.designation,
    aadhar_no: member.aadhar_no,
    month_saving_amount: Number(member.month_saving_amount || 0),
    gender: member.gender,
    date_of_joining: member.date_of_joining
  }));

  // =========================
  // 4️⃣ FINAL PAYLOAD
  // =========================

  const finalPayload = {
    shgmaster: JSON.stringify(shgmaster),
    shgbankdetails: JSON.stringify(shgbankdetails),
    shghhdetails: JSON.stringify(shghhdetails),
    shghhchild: JSON.stringify(payload)
  };

  console.log("📦 Final API Payload => ", finalPayload);

  // =========================
  // 5️⃣ API CALL
  // =========================

  this.coreservices.insertShgAll(finalPayload).subscribe({

    next: (res: any) => {

      console.log("✅ Save Success:", res);

      this.resetAllData();
      this.loadSHGData();

      this.snackBar.open(
        'SHG Data Saved Successfully!',
        'Close',
        {
          duration: 3000
        }
      );

      this.toggleAddNew(false);
    },

    error: (err: any) => {

      console.error("❌ Save Error:", err);

      this.snackBar.open(
        'Error while saving data',
        'Close',
        {
          duration: 3000
        }
      );
    }

  });

}






  deleteSession(index: number) {
    if (confirm("Are you sure you want to remove this session?")) {
      this.savedSessionsList.splice(index, 1); // Remove from list

      // If list is empty, hide the table
      if (this.savedSessionsList.length === 0) {
        this.aftersaving = false;
      }
    }
  }


  getallgeo() {
    this.coreservices.getAllGeo(1).subscribe({
      next: res => {
        this.allbeatsdata = res?.Data ?? [];
        sessionStorage.setItem("jurisdictionDetails", JSON.stringify(this.allbeatsdata));

        // STEP 3: Once Geo data is saved, NOW we get the user's jurisdiction
        // this.getjuridictiondetails();
      },
      error: err => console.error('Grid Data Error:', err)
    });
  }

  getjuridictiondetails() {
    const data = sessionStorage.getItem('Session');
    if (!data) return;

    const parsed = JSON.parse(data);

    // assuming your API response structure
    const jurisdictionObj = parsed?.Data ? parsed : { Data: [parsed] };

    const jdString = jurisdictionObj?.Data[0]?.jurisdiction_details;

    if (!jdString) return;

    // 🔥 Parse the string into object
    const jd = JSON.parse(jdString);

    // Clear arrays if needed
    this.districttype = [];
    this.division = [];

    // District
    if (jd?.Jurisdiction?.district?.length > 0) {
      this.districttype.push(jd.Jurisdiction.district[0]);
      this.selectedDistrict = this.districttype[0];
      // this.onDistrictChange(this.selectedDistrict);
    }

    // Sub Division
    if (jd?.Jurisdiction?.sub_division?.length > 0) {
      this.division.push(...jd.Jurisdiction.sub_division);
    }

    // Range
    if (jd?.Jurisdiction?.range?.length > 0) {
      this.range.push(...jd.Jurisdiction.range);
    }
    this.beat.push(...jd.Jurisdiction.beat);

  }
  onDistrictChange(value: any) {
    this.selectedDistrict = value;

    // --- Reset Child Selections to avoid filtering by old/wrong sub-division ---
    this.divisionchange = null; // or undefined
    this.rangechanged = null;
    this.range = [];
    // --------------------------------------------------------------------------

    // Trigger API Load
    //this.getdashboardfilter(); 

    if (!this.selectedDistrict) return;

    // Populate Sub Division Options
    const district = this.selectedDistrict.toLowerCase();
    const beatsStr = sessionStorage.getItem('jurisdictionDetails');
    if (!beatsStr) return;

    const beats: any[] = JSON.parse(beatsStr);
    const districtBeats = beats.filter(b => b?.district_name?.toLowerCase() === district);

    const uniqueSubdivisions = Array.from(new Map(districtBeats.map(b => [b.subdivision_id, {
      subdivision_id: b.subdivision_id,
      subdivision_name: b.subdivision_name,
    }])).values());

    this.division = [];
    uniqueSubdivisions.forEach((item: any) => this.division.push(item.subdivision_name));
  }


  subdivisionchange(subdivision: any) {
    this.divisionchange = subdivision;
    this.range = [];
    const beatsStr = sessionStorage.getItem('jurisdictionDetails');
    if (!beatsStr) return;
    const beats: any[] = JSON.parse(beatsStr);
    const normalize = (v: any) => (v ?? '').toString().trim().toLowerCase();
    const subdivisionNormalized = normalize(subdivision);
    const rangebeats = beats.filter(b => normalize(b.subdivision_name) === subdivisionNormalized);

    const uniquerange = Array.from(new Map(rangebeats.map(b => [b.range_name, { rangename: b.range_name }])).values());
    uniquerange.forEach((item: any) => this.range.push(item.rangename));
  }

  rangechange(event: any) {
    this.rangechanged = event;
    // Trigger API Load
    // this.getdashboardfilter(); 
  }

  selectedschematype(event: any) {
    const data = this.schemaMaster.find(c => c.scheme_name === event);
    if (data) {
      this.schemaname = data.id; // Saves the numeric ID (1, 2, 3...)
    }
  }

  Beattype(event: any) {
    this.beatname = event;

    this.coreservices.getAllJfmclistByJurisdiction(event).subscribe({
      next: res => {
        const data = res?.Data ?? [];

        // 1. Extract all committee names from the array
        const allNames = data.map((x: any) => x.name_of_committee);

        // 2. ✅ FIX: Use a Set to remove duplicates and convert back to an array
        this.Jfmc_edc = [...new Set(allNames)];

        console.log("Distinct JFMC List:", this.Jfmc_edc);
      },
      error: err => console.error('Error fetching JFMC list:', err)
    });
  }


  Jfmc_edctype(event: any) {
    // this.Jfmc_edc = event;
    this.Jfmc_edcname = event;
  }

  memberCount: number = 1;

  members: any[] = [
    {
      name: '',
      designation: '',
      aadhar: '',
      monthlySaving: '',
      gender: '',
      joinDate: ''
    }
  ];

  onlyNumber(event: any) {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

addMember() {

  // Clear old records if needed
  this.membersList = [];

  for (let i = 0; i < this.memberCount; i++) {
    this.membersList.push({
      name: '',
      designation: '',
      aadhar_no: '',
      month_saving_amount: 0,
      gender: '',
      date_of_joining: ''
    });
  }

  this.showMemberPopup = true;
}


  newMember: any = {
    name: '',
    designation: '',
    aadhar_no: '',
    month_saving_amount: 0,
    gender: '',
    date_of_joining: ''
  };

  openMemberPopup() {
    this.showMemberPopup = true;
  }

  closePopup() {
    this.newMember = {
      name: '',
      designation: '',
      aadhar_no: '',
      month_saving_amount: 0,
      gender: '',
      date_of_joining: ''
    };
    this.showMemberPopup = false;
  }


DeletehhChild(member: any) {
  if (confirm('Are you sure you want to delete this member?')) {
    // Pass the correct parameters matching your legacy logic
    this.coreservices.DeletehhChildShg(member.id, member.shg_id, member.hh_parent_id).subscribe({
      next: (res: any) => {
        alert('Member deleted successfully');
        this.openView(this.actualshg_id); // Refresh the view
      },
      error: (err: any) => {
        alert('Failed to delete member.');
      }
    });
  }
}

 saveMember() {

  // ✅ Aadhar validation
  if (!this.newMember.aadhar_no || this.newMember.aadhar_no.length !== 12) {
    this.snackBar.open('Aadhar must be exactly 12 digits', 'Close', {
      duration: 3000
    });
    return;
  }
   const payload = {
     shg_id: this.actualshg_id ? Number(this.actualshg_id) : null,
     hh_parent_id: Number(this.newMember.hh_parent_id || 0),
     name: this.newMember.name || "",
     designation: this.newMember.designation || "",
     aadhar_no: this.newMember.aadhar_no || "",
     month_saving_amount: Number(this.newMember.month_saving_amount || 0),
     gender: this.newMember.gender || "",
     date_of_joining: this.newMember.date_of_joining || ""
   };

  this.coreservices.insertShgAddMemberDetails(payload).subscribe({
    
    next: (res: any) => {
      this.membersList.push({ ...payload });

      this.snackBar.open('Saved Successfully!', 'Close', {
        duration: 3000
      });

      this.closePopup();
    },

    error: () => {
      this.snackBar.open('Error while saving data', 'Close', {
        duration: 3000
      });
    }
  });
}



onlyDigits(event: any) {
  let value = event.target.value;
  
  let cleanValue = value.replace(/[^0-9]/g, '');

  if (cleanValue.length > 12) {
    cleanValue = cleanValue.substring(0, 12);
  }

  this.newMember.aadhar_no = cleanValue;
  
  event.target.value = cleanValue;
}

  removeMember() {
    if (this.membersList.length > 1) {
      this.membersList.pop();
    }
  }
}
