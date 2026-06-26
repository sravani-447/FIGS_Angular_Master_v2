import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { forkJoin } from 'rxjs'; 

import { CustomGridComponent } from "../../../shared/Grids/custom-grid.component";
import { ServerRequests } from "../../../services/ServerRequests";
import { GridColumn } from "../../../shared/Grids/grid-column.model";
import { DynamicField } from '../../../shared/dialog-boxes/dynamic-form.model';

@Component({
  selector: 'app-craft-more-outlets-monitor',
  templateUrl: './craft-more-outlets-monitor.component.html',
  styleUrl: './craft-more-outlets-monitor.component.css'
})
export class CraftMoreOutletsMonitorComponent implements OnInit {

  @ViewChild('grid') gridComponent!: CustomGridComponent;
  userid: any;
  data: any[] = [];
  hiddenFields: string[] = []; 
  userDesignation: string = '';
  mappopup: boolean = false;
  disablegrid: boolean = false;

  lookupData: any;
allCrafts: any[] = [];
tableData: any[] = [];
selectedProductDetails: any[] = [];
  // DYNAMIC MODAL FIELDS FOR THE GENERIC GRID
  dialogFields: DynamicField[] = [];

  private primaryFields = ['sno', 'bo_status', 'ro_status', 'fo_status', 'user_name', 'createdby', 'actions'];

  columns: GridColumn[] = [
    {
      field: 'actions', header: 'Action', type: 'actions',
      actions: [{ label: 'View', action: 'ntfpcraftmoreoutletsmonitors', tooltip: 'View', icon: '' }]
    },
    { field: 'bo_status', header: 'Status(BO)' },
    { field: 'ro_status', header: 'Status(RO)' },
    { field: 'fo_status', header: 'Status (FO)' },
    { field: 'id', header: 'ID' }, 
    { field: 'craft_id', header: 'Craft ID' }, 
    { field: 'operated_by', header: 'Operated By' },
    { field: 'duration_from', header: 'From Date' },
    { field: 'duration_to', header: 'To Date' }, 
    { field: 'total_revenue', header: 'Total Revenue' }, 
    {field: 'product_details',    header: 'Details',    type: 'actions',    actions: [      { icon: 'fa fa-bars', action: 'view_details' }    ]  }, 
    { field: 'createdby', header: 'Created By' }, 
    { field: 'createdat', header: 'Created At' }
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
    // this.hiddenFields = this.columns.filter(col => !this.primaryFields.includes(col.field)).map(col => col.field);
    this.LoadCraftMoreOutlets(); 
  }

 getLookups() {
  
  forkJoin({
    crafts: this.coreservices.getNtfpOutletCraft(),
    lookups: this.http.get(`${this.coreservices.BASE_URL}/GetAllLookUp`)
  }).subscribe({
    next: (results: any) => {
      // 1. Process Craft Data
      const craftRes = typeof results.crafts === 'string' ? JSON.parse(results.crafts) : results.crafts;
      this.allCrafts = craftRes.Data || [];
      const craftOpts = this.allCrafts.map(c => ({ name: c.outlet_name, value: c.outlet_id }));

      // 2. Process Product Lookups
      const lookRes = typeof results.lookups === 'string' ? JSON.parse(results.lookups.replace('APIResponse:', '')) : results.lookups;
      this.lookupData = lookRes.Data || lookRes;

      // Extract unique categories for the first dropdown
      const categories = [...new Set(this.lookupData.product_type_master.map((x: any) => x.product_name))];
      const catOpts = categories.map(c => ({ name: c, value: c }));

      this.dialogFields = [
        { name: 'craft_id', label: 'SELECT CRAFT', type: 'select', options: craftOpts },
        { name: 'operated_by', label: 'OPERATED BY', type: 'text', readonly: true },
        { name: 'duration_from', label: 'START DATE', type: 'date' },
        { name: 'duration_to', label: 'END DATE', type: 'date' },
        
        // Product Input Section
        { name: 'product_category', label: 'PRODUCT CATEGORY', type: 'select', options: catOpts },
        { name: 'product_sub_category', label: 'PRODUCT SUB CATEGORY', type: 'select', options: [] }, // Initially empty
        { name: 'product_name', label: 'PRODUCT NAME', type: 'text' },
        { name: 'quantity', label: 'QUANTITY', type: 'number' },
        { name: 'rate', label: 'RATE', type: 'number' },
        { name: 'selling_cost', label: 'SELLING COST', type: 'number', readonly: true },
      
        { name: 'total_revenue', label: 'TOTAL COST', type: 'number', readonly: true },

        // SPECIAL FIELD TYPE: The Dynamic Table
        { name: 'lstproduct', label: 'PRODUCT DETAILS', type: 'table' }
        
      ];
    }
  });
}

handleFormChange(event: any) {
  const form = event.form; 
  if (!form) return;
  const { field, value } = event;

  if (field === 'craft_id') {
    const craft = this.allCrafts.find(c => c.outlet_id == value || c.id == value);
    if (craft) form.patchValue({ operated_by: craft.operated_by });
  }

  if (field === 'product_category') {
    const subCategories = this.lookupData.product_type_master
      .filter((x: any) => x.product_name === value)
      .map((x: any) => ({ name: x.subtype, value: x.subtype }));

    this.dialogFields = this.dialogFields.map(f => 
      f.name === 'product_sub_category' ? { ...f, options: subCategories } : f
    );
  }

  // Use form.getRawValue() to calculate to ensure we have both qty and rate
  if (field === 'quantity' || field === 'rate') {
    const qty = parseFloat(field === 'quantity' ? value : form.get('quantity')?.value || 0);
    const rate = parseFloat(field === 'rate' ? value : form.get('rate')?.value || 0);
    const total = qty * rate;

    form.patchValue({ 
      selling_cost: total,
      total_revenue: total 
    });
  }
}

SaveRecord(data: any) {
  // 1. Get the list from the form (emitted by grid)
  // If data.lstproduct is empty, try to see if they filled the fields but didn't click 'Add'
  let products = data.lstproduct || [];
  
  if (products.length === 0 && data.product_name) {
    products.push({
      pro_category: data.product_category,
      pro_sub_category: data.product_sub_category,
      name: data.product_name,
      quantity: data.quantity,
      rate: data.rate,
      selling: data.selling_cost
    });
  }

  // 2. Date Formatter: Converts 30-04-2026 or Date object to 2026-04-30
  const formatDate = (dateVal: any) => {
    if (!dateVal) return null;
    let d = new Date(dateVal);
    
    // If it's a string like DD-MM-YYYY, fix it for JS Date
    if (typeof dateVal === 'string' && dateVal.includes('-')) {
      const parts = dateVal.split('-');
      if (parts[0].length === 2) d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    }
    
    return isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
  };

  // 3. Build Payload
  const payload = {
    "craft_id": data.craft_id?.toString() || "",
    "operated_by": data.operated_by || "",
    "duration_from": formatDate(data.duration_from),
    "duration_to": formatDate(data.duration_to),
    "total_revenue": data.total_revenue?.toString() || "0",
    "product_details": JSON.stringify(products), // This goes to the longtext/blob column
    "lstproduct": products,
    "createdby": this.userid.toString()
  };

  console.log("Final Payload being sent:", payload);

  this.coreservices.insertNtfpOutletCraftMonitor(payload).subscribe({
    next: (res: any) => {
       const result = typeof res === 'string' ? JSON.parse(res) : res;
       if (result.status == 200 || result.Status == "Success") {
         this.snackBar.open('Saved Successfully', 'Close', { duration: 3000 });
         
         // Clear grid state
         if (this.gridComponent) {
           this.gridComponent.tableData = [];
           this.gridComponent.totalRevenue = 0;
           this.gridComponent.showForm = false; // Close modal
         }
         
         this.LoadCraftMoreOutlets();
       } else {
         this.snackBar.open(result.Message || 'Save Failed', 'Close');
       }
    },
    error: (err) => {
      this.snackBar.open('Server Error: Could not save', 'Close');
      console.error(err);
    }
  });
}


  // 3. HANDLE VIEW AND FILE DOWNLOADS
  onGridAction(event: { action: string; row: any }) {
    if (event.action === 'ntfpcraftmoreoutletsmonitors') {
      //this.disablegrid = true;
      let rowToView = { ...event.row };
      if (this.userDesignation === 'BEAT_OFFICER') rowToView.comments = event.row.ro_rej_comments || '-';
      else if (this.userDesignation === 'FIELD_OFFICER') rowToView.comments = event.row.bo_rej_comments || '-';
      setTimeout(() => { this.gridComponent?.openViewPopupFromOutside(rowToView); }, 0);
    }

      if (event.action === 'view_details') {
    try {
      // Parse the JSON string from the database (just like your old jQuery code)
      this.selectedProductDetails = JSON.parse(event.row.product_details);
      this.mappopup = true; // Open the modal
    } catch (e) {
      this.snackBar.open('No product details found', 'Close');
    }
  }
  }



  // 4. LOAD TABLE DATA
  LoadCraftMoreOutlets() {
  this.coreservices.getNtfpOutletCraftMonitor().subscribe({
    next: (res: any) => {
      const parsedRes = typeof res === 'string' ? JSON.parse(res) : res;
      let rawData = parsedRes?.Data ? (typeof parsedRes.Data === 'string' ? JSON.parse(parsedRes.Data) : parsedRes.Data) : [];
      
      this.data = rawData.map((item: any, index: number) => {
        // Fix for "Invalid Date"
        let displayDate = '';
        if (item.createdat) {
          const d = new Date(item.createdat);
          displayDate = !isNaN(d.getTime()) ? d.toLocaleString('en-IN') : item.createdat;
        }

        return {
          ...item,
          sno: index + 1,
          createdat: displayDate,
          ntfpcraftmoreoutletsmonitors:true,
          // Ensure statuses look clean
          bo_status: item.bo_status === 'YES' ? 'Approved' : (item.bo_status === 'NO' ? 'Rejected' : 'Pending'),
          ro_status: item.ro_status === 'YES' ? 'Approved' : (item.ro_status === 'NO' ? 'Rejected' : 'Pending'),
          fo_status: item.fo_status === 'YES' ? 'Approved' : (item.fo_status === 'NO' ? 'Rejected' : 'Pending')
        };
      });
    }
  });
}

  // 5. ROLE APPROVAL LOGIC
  handleStatusUpdate(payload: any) {
    const module = "ntfp_nce_center";
    let Payload = {  
      "Id": payload.id, "comments": payload.comments, status :payload.status, rejectreason:payload.rejectreason
    };

    if (Payload.status == "NO" && this.userDesignation == "RANGE_OFFICER") {
      this.coreservices.Insertcommonrejectdetails("RO", payload.rejectreason, Payload.Id, module).subscribe({
        next: () => { this.LoadCraftMoreOutlets(); this.snackBar.open('Data Saved', 'Close'); }
      });
    } else if(Payload.status == "NO" && this.userDesignation == "BEAT_OFFICER"){
      this.coreservices.Insertcommonrejectdetails("BO", payload.rejectreason, Payload.Id, module).subscribe({
        next: () => { this.LoadCraftMoreOutlets(); this.snackBar.open('Data Saved', 'Close'); }
      });
    } else if (this.userDesignation == "FIELD_OFFICER" && Payload.status == "YES") {
      this.coreservices.CommonApprovalforallroles("FO", "BO", Payload.Id, module).subscribe({
        next: () => { this.LoadCraftMoreOutlets(); this.snackBar.open('Data Saved', 'Close'); }
      });
    } else if (this.userDesignation == "BEAT_OFFICER" && Payload.status == "YES") {
      this.coreservices.CommonApprovalforallroles("BO", "RO", Payload.Id, module).subscribe({
        next: () => { this.LoadCraftMoreOutlets(); this.snackBar.open('Data Saved', 'Close'); }
      });
    } else if (this.userDesignation == "RANGE_OFFICER" && Payload.status == "YES") {
      this.coreservices.commonApprovedByRangeo(Payload.Id, module).subscribe({
        next: () => { this.LoadCraftMoreOutlets(); this.snackBar.open('Data Saved', 'Close'); }
      });
    }
  }

}
