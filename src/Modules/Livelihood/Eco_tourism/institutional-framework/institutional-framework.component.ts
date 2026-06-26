import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { CustomGridComponent } from "../../../../shared/Grids/custom-grid.component";
import { ServerRequests } from "../../../../services/ServerRequests";
import { GridColumn } from "../../../../shared/Grids/grid-column.model";
import { DynamicField } from '../../../../shared/dialog-boxes/dynamic-form.model';

@Component({
  selector: 'app-institutional-framework',
  templateUrl: './institutional-framework.component.html',
  styleUrl: './institutional-framework.component.css'
})
export class InstitutionalFrameworkComponent implements OnInit {

  @ViewChild('grid') gridComponent!: CustomGridComponent;
  userid: any;
  data: any[] = [];
  hiddenFields: string[] = []; 
  userDesignation: string = '';
  mappopup: boolean = false;
  disablegrid: boolean = false;

  // DYNAMIC MODAL FIELDS FOR THE GENERIC GRID
  dialogFields: DynamicField[] = [];

  private primaryFields = ['sno', 'bo_status', 'ro_status', 'fo_status', 'user_name', 'createdby', 'actions'];

  columns: GridColumn[] = [
    {
      field: 'actions', header: 'Action', type: 'actions',
      actions: [{ label: 'View', action: 'view', tooltip: 'View', icon: '' }]
    },
        { field: 'fo_status', header: 'Status (FO)' },
    { field: 'bo_status', header: 'Status(BO)' },
    { field: 'ro_status', header: 'Status(RO)' },
    { field: 'id', header: 'ID' },
    { field: 'scheme_type', header: 'Scheme Type' },
    { field: 'scheme_name', header: 'Scheme Name' },
    { field: 'amount', header: 'Amount' },
    { field: 'name_planning_agency', header: 'Planning Agency' },
    { field: 'name_implementing_agency', header: 'Implementing Agency' },
    { field: 'name_promo_agency', header: 'Promotion Agency' },
    { field: 'name_cap_deve_agency', header: 'Capacity Dev Agency' },
    { field: 'name_operating_agency', header: 'Operating Agency' },
    { field: 'name_other_agency', header: 'Other Agency' },

    // FILE DOWNLOAD BUTTONS
    {
      field: 'dpr_file_name', header: 'DPR File', type: 'actions',
      actions: [{ icon: 'fa fa-download', action: 'download_dpr', tooltip: 'Download DPR', visible: (row: any) => !!row.dpr_file_name }]
    },
    {
      field: 'legal_file_name', header: 'Legal File', type: 'actions',
      actions: [{ icon: 'fa fa-download', action: 'download_legal', tooltip: 'Download Legal', visible: (row: any) => !!row.legal_file_name }]
    },
    {
      field: 'other_file_name', header: 'Other File', type: 'actions',
      actions: [{ icon: 'fa fa-download', action: 'download_other', tooltip: 'Download Other', visible: (row: any) => !!row.other_file_name }]
    }
  ];

  constructor(
    private coreservices: ServerRequests,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router,
    private http: HttpClient
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
    this.Loadinstitutionalframework(); 
  }

  // 1. DYNAMICALLY LOAD DROPDOWNS FOR THE GENERIC GRID
  getLookups() {
    this.coreservices.getAllLookUps(1).subscribe({
      next: (res: any) => {
        const result = typeof res.Data === 'string' ? JSON.parse(res.Data) : res.Data;
        
        let schemeOptions: any[] = [];
        if (result && result.scheme_master) {
          schemeOptions = result.scheme_master.map((s: any) => ({ name: s.scheme_name, value: s.scheme_name }));
        }

        // Configure the Generic Add Form
        this.dialogFields = [
          { name: 'scheme_type', label: 'TYPE OF SCHEME', type: 'select', options: [{name: 'Single', value: 'Single'}, {name: 'Convergence', value: 'Convergence'}] },
          { name: 'scheme_name', label: 'SCHEME NAME', type: 'select', options: schemeOptions }, 
          { name: 'amount', label: 'AMOUNT', type: 'number' },
          { name: 'name_planning_agency', label: 'PLANNING AGENCY', type: 'text' },
          { name: 'name_implementing_agency', label: 'IMPLEMENTING AGENCY', type: 'text' },
          { name: 'name_promo_agency', label: 'PROMOTION AGENCY', type: 'text' },
          { name: 'name_cap_deve_agency', label: 'CAPACITY DEV AGENCY', type: 'text' },
          { name: 'name_operating_agency', label: 'OPERATING AGENCY', type: 'text' },
          { name: 'name_other_agency', label: 'OTHER AGENCY', type: 'text' },
          { name: 'dpr_file_name', label: 'UPLOAD DPR FILE (JPEG/PDF)', type: 'file' },
          { name: 'legal_file_name', label: 'UPLOAD LEGAL FILE (JPEG/PDF)', type: 'file' },
          { name: 'other_file_name', label: 'UPLOAD OTHER FILE (JPEG/PDF)', type: 'file' }
        ];
      }
    });
  }

SaveRecord(data: any) {
  console.log("Raw form data received:", data);

  // Define max file size (e.g., 1.5 MB = 1.5 * 1024 * 1024 bytes)
  const MAX_FILE_SIZE_BYTES = 2.5 * 1024 * 1024; 

  const filesToCheck = [
    { file: data.dpr_file_name, label: 'DPR File' },
    { file: data.legal_file_name, label: 'Legal File' },
    { file: data.other_file_name, label: 'Other File' }
  ];

  // Loop through the files to check their sizes
  for (const item of filesToCheck) {
    if (item.file && item.file instanceof File) {
      if (item.file.size > MAX_FILE_SIZE_BYTES) {
        this.snackBar.open(
          `${item.label} is too large (Max limit is 1.5 MB). Please reduce file size.`, 
          'Close', 
          { duration: 5000 }
        );
        return; // Stop form submission
      }
    }
  }

  // If validation passes, proceed with Base64 conversion and API call
  const toBase64 = (file: any) => new Promise<string>((resolve, reject) => {
    if (!file || !(file instanceof File)) {
      resolve(''); 
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]); 
    reader.onerror = error => reject(error);
  });

  Promise.all([
    toBase64(data.dpr_file_name),
    toBase64(data.legal_file_name),
    toBase64(data.other_file_name)
  ])
  .then(([dprBase64, legalBase64, otherBase64]) => {
    const payload = {
      scheme_type: data.scheme_type,
      scheme_name: Array.isArray(data.scheme_name) ? data.scheme_name.join(',') : data.scheme_name,
      amount: data.amount,
      name_planning_agency: data.name_planning_agency,
      name_implementing_agency: data.name_implementing_agency,
      name_promo_agency: data.name_promo_agency,
      name_cap_deve_agency: data.name_cap_deve_agency,
      name_operating_agency: data.name_operating_agency,
      name_other_agency: data.name_other_agency,
      
      dpr_file_name: data.dpr_file_name?.name || '',
      dpr_file: dprBase64, 
      
      legal_file_name: data.legal_file_name?.name || '',
      legal_file: legalBase64,
      
      other_file_name: data.other_file_name?.name || '',
      other_file: otherBase64,
      
      createdby: Number(this.userid)
    };

    this.coreservices.insertEcotourismInstitutionalFramework(payload).subscribe({
      next: (res: any) => {
        this.snackBar.open('Record Added Successfully!', 'Close', { duration: 3000 });
        this.Loadinstitutionalframework();
      },
      error: (err) => {
        console.error('Save error', err);
        this.snackBar.open('Failed to add record', 'Close', { duration: 3000 });
      }
    });
  })
  .catch((error) => {
    console.error("File processing error", error);
    this.snackBar.open('Error processing file uploads', 'Close', { duration: 3000 });
  });
}

  // 3. HANDLE VIEW AND FILE DOWNLOADS
  onGridAction(event: { action: string; row: any }) {
    const row = event.row;
    
    switch (event.action) {
      case 'view':
        this.disablegrid = true;
        let rowToView = { ...row };
        if (this.userDesignation === 'BEAT_OFFICER') { rowToView.comments = row.ro_rej_comments || '-'; } 
        else if (this.userDesignation === 'FIELD_OFFICER') { rowToView.comments = row.bo_rej_comments || '-'; } 
        else { rowToView.display_comments = ''; }
        setTimeout(() => { this.gridComponent?.openViewPopupFromOutside(rowToView); }, 0);
        break;

       case 'download_dpr':
        this.downloadFile(row.id, 'dpr_file_name', row.dpr_file_name);
        break;
      case 'download_legal':
        this.downloadFile(row.id, 'legal_file_name', row.legal_file_name);
        break;
      case 'download_other':
        this.downloadFile(row.id, 'other_file_name', row.other_file_name);
        break;
    }
  }

 downloadFile(id: number, colName: string, fileName: string) {
    console.log(`Preparing to download -> ID: ${id}, Column: ${colName}, FileName: ${fileName}`); 

    if (!id || !colName) {
      this.snackBar.open('Missing ID or Column Name to download!', 'Close', { duration: 3000 });
      return; 
    }

    this.coreservices.getImagesEcotourismInstitutionalFramework(id, colName).subscribe({
      next: (res: any) => {
        console.log("API Response Received:", res); 
        
        const result = typeof res === 'string' ? JSON.parse(res) : res;
        const base64 = result?.Data?.[0]?.file_data;

        if (base64) {
          const a = document.createElement("a");
          const isPdf = fileName && fileName.toLowerCase().endsWith('.pdf');
          a.href = `data:${isPdf ? 'application/pdf' : 'image/jpeg'};base64,${base64}`;
          a.download = fileName || 'downloaded_file';
          a.click();
          this.snackBar.open('Download Started', 'Close', { duration: 2000 });
        } else {
          this.snackBar.open('File is empty in the database', 'Close', { duration: 3000 });
        }
      },
      error: (err) => {
        console.error("API Download Error:", err); // <-- DEBUG LOG
        this.snackBar.open('Error downloading file from server', 'Close', { duration: 3000 });
      }
    });
  }

  // 4. LOAD TABLE DATA
Loadinstitutionalframework() {
  this.coreservices.getEcotourismInstitutionalFramework().subscribe({
    next: (res: any) => {
      const parsedRes = typeof res === 'string' ? JSON.parse(res) : res;
      let rawData = parsedRes?.Data ? (typeof parsedRes.Data === 'string' ? JSON.parse(parsedRes.Data) : parsedRes.Data) : [];
      
      this.data = [...rawData.map((item: any, index: number) => ({
        ...item,
        sno: index + 1,
        livelihoodmodule: true,
        createdat: item.createdat ? new Date(item.createdat).toLocaleString('en-IN') : '',
        bo_status: item.bo_status === 'YES' ? 'Approved' : 'Pending',
        ro_status: item.ro_status === 'YES' ? 'Approved' : 'Pending',
        fo_status: item.fo_status === 'YES' ? 'Approved' : 'Pending'
      }))];
    },
    error: (err) => {
      console.error("Error loading institutional framework data:", err);
      this.snackBar.open('Could not load grid data from server.', 'Close', { duration: 3000 });
    }
  });
}

  // 5. ROLE APPROVAL LOGIC
  handleStatusUpdate(payload: any) {
    const module = "eco_tourism_institutional";
    let Payload = {  
      "Id": payload.id, "comments": payload.comments, status :payload.status, rejectreason:payload.rejectreason
    };

    if (Payload.status == "NO" && this.userDesignation == "RANGE_OFFICER") {
      this.coreservices.Insertcommonrejectdetails("RO", payload.rejectreason, Payload.Id, module).subscribe({
        next: () => { this.Loadinstitutionalframework(); this.snackBar.open('Data Saved', 'Close'); }
      });
    } else if(Payload.status == "NO" && this.userDesignation == "BEAT_OFFICER"){
      this.coreservices.Insertcommonrejectdetails("BO", payload.rejectreason, Payload.Id, module).subscribe({
        next: () => { this.Loadinstitutionalframework(); this.snackBar.open('Data Saved', 'Close'); }
      });
    } else if (this.userDesignation == "FIELD_OFFICER" && Payload.status == "YES") {
      this.coreservices.CommonApprovalforallroles("FO", "BO", Payload.Id, module).subscribe({
        next: () => { this.Loadinstitutionalframework(); this.snackBar.open('Data Saved', 'Close'); }
      });
    } else if (this.userDesignation == "BEAT_OFFICER" && Payload.status == "YES") {
      this.coreservices.CommonApprovalforallroles("BO", "RO", Payload.Id, module).subscribe({
        next: () => { this.Loadinstitutionalframework(); this.snackBar.open('Data Saved', 'Close'); }
      });
    } else if (this.userDesignation == "RANGE_OFFICER" && Payload.status == "YES") {
      this.coreservices.commonforallrolesapprovedrangedetails(Payload.Id, module).subscribe({
        next: () => { this.Loadinstitutionalframework(); this.snackBar.open('Data Saved', 'Close'); }
      });
    }
  }

}