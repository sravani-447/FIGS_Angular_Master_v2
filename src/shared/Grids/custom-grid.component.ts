import { Component, Input, OnInit, OnChanges, SimpleChanges, Output, EventEmitter, HostListener, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GridColumn } from './grid-column.model';
import { DynamicField } from '../dialog-boxes/dynamic-form.model';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ServerRequests } from '../../services/ServerRequests';
import { filter } from 'lodash';
import { setOptions } from 'leaflet';


@Component({
  selector: 'app-custom-grid',
  templateUrl: './custom-grid.component.html',
  styleUrls: ['./custom-grid.component.css']
})
export class CustomGridComponent implements OnInit, OnChanges {

  @Input() enableView: boolean = false;
  @Input() usePillView: boolean = true;
  @Input() editableFields: string[] = [];
  @Input() showViewPopup: boolean = false;  // enable/disable view feature
  @Input() disableValidation: boolean = false;
  @Output() onView = new EventEmitter<any>();     // emit selected row
  @Output() onUpdateView = new EventEmitter<any>();  // emit update data
  @Input() title: string = '';
  @Input() columns: GridColumn[] = [];
  @Input() data: any[] = [];
  @Input() dialogFields: DynamicField[] = [];
  @Input() showAdd: boolean = true;
  @Input() showprintbuttons = true;
  @Input() pdfOnly: boolean = false;
  @Input() displayPrint: boolean = true;
  @Input() displayExcel: boolean = true;
  @Input() displayPdf: boolean = true;
  @Input() RejectReason: boolean = false;
  @Input() Modulewiserejectbox: boolean = false;
  @Input() hiddenFields: string[] = [];
  @Input() hiddenHeaders: string[] = [];
  @Input() viewPopupVisible = false;
  @Input() autoAddJurisdiction = false;
  @Input() showApproveReject: boolean = false;
  selectedRow: any = null;
  isLoading: boolean = false;
  @Output() actionClicked = new EventEmitter<{ action: string; row: any }>();
  // 1. Correct Output Declaration
  @Output() onSaveData = new EventEmitter<any>();
  @Output() fieldChange = new EventEmitter<any>();

  searchText = '';
  showForm = false;
  form!: FormGroup;
  currentPage = 1;
  pageSize = 10;
  isMinimized = false;
  col: any;
  userDesignation: any;
  @Input() viewvisiblity: boolean = false;
  readonlyfields: boolean = false;
  lookupStore: any;
  dfoapproval: any;
  sfoapproval: any;
  selectedValues: any;
  updatedisable: boolean = false;
  popupColumns: any[] = [];
  originalRowSnapshot: any = null;
  statusChanged: boolean = false;
  activeYearPicker: string | null = null;
  yearRangeStart: number = 2021;
  yearsArray: number[] = [];
  tableData: any[] = [];
  totalRevenue: number = 0;
  IsvalidData: boolean = false;
  disableapprovebuttons: boolean = false;
  enableupdate: boolean = false;
  disablejuridictioncolumns: boolean = false;
  JuridictionAccess: boolean = false;


  constructor(private fb: FormBuilder, private snackbar: MatSnackBar, private coreservice: ServerRequests) {
    this.form = this.fb.group({});
    const session = sessionStorage.getItem("Session");
    if (session) {
      const sessionDetails = JSON.parse(session);
      this.userDesignation = sessionDetails.Data[0].designation_name;
      this.sfoapproval = sessionStorage.getItem("SFOApproval");
      this.dfoapproval = sessionStorage.getItem("DFOApproval");
    }
  }

  ngOnInit(): void {
    this.initForm();
    if (this.enableView) {

      const actionColumn = this.columns.find(c => c.type === 'actions');

      if (actionColumn) {
        actionColumn.actions = actionColumn.actions || [];

        actionColumn.actions.unshift({
          icon: 'fa fa-eye',
          action: 'view',
          tooltip: 'View Details',
          color: '#17a2b8'
        });
      }
      this.columns.filter(c => c.type !== 'actions');
    }

    const createdByColumn = this.columns.find(c => c.header === 'Created By');
    const createdAtColumn = this.columns.find(c => c.header === 'Created At');

    if (createdByColumn) {
      createdByColumn.header = 'User Name';
    }

    if (createdAtColumn) {
      createdAtColumn.header = 'Creation Date';
    }
  }
  addSessionJurisdiction() {

    const session = JSON.parse(sessionStorage.getItem('Session') || '{}');

    if (!session?.Data?.length) return;

    const jurisdiction = JSON.parse(session.Data[0].jurisdiction_details)?.Jurisdiction;

    const district = jurisdiction?.district?.[0] || '-';
    const range = jurisdiction?.range?.[0] || '-';
    const beat = jurisdiction?.beat?.[0] || '-';
    const subDivision = jurisdiction?.sub_division?.[0] || '-';

    // Add values into every row
    this.data = this.data.map(row => ({
      ...row,
      district: district,
      subDivision: subDivision,
      range: range,
      beat: beat,
    }));

    // Prevent duplicate column creation
    const exists = this.columns.find(c => c.field === 'district');

    if (!exists) {
      // this.columns.push(
      //   { field: 'district', header: 'District' },
      //   { field: 'subDivision', header: 'Sub Division' },
      //   { field: 'range', header: 'Range' },
      //   { field: 'beat', header: 'Beat' },
      // );
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dialogFields'] && changes['dialogFields'].currentValue) {
      this.initForm();
    }

    if (changes['dialogFields'] && changes['dialogFields'].firstChange) {
      this.initForm();
    }

    if (changes['data'] && changes['data'].currentValue) {
      // this.addSessionJurisdiction();
      this.loadjuridiction(changes['data'].currentValue);
      this.getmonitoringdata(changes['data'].currentValue);
    }
  }


  get totalPages() {
    return Math.ceil(this.filteredData.length / this.pageSize);
  }
  toggleMinimize() {
    this.isMinimized = !this.isMinimized;
  }
  // NEW: Replace 'filteredData' in your HTML with 'pagedData'
  get pagedData() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredData.slice(start, end);
  }

  // Helper methods to change pages
  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  addRowToList() {
    const val = this.form.getRawValue();
    if (!val.product_category || !val.product_name) {
      this.snackbar.open('Please fill product details', 'Close', { duration: 2000 });
      return;
    }

    const newRow = {
      pro_category: val.product_category,
      pro_sub_category: val.product_sub_category,
      name: val.product_name,
      quantity: val.quantity,
      rate: val.rate,
      selling: val.selling_cost
    };

    this.tableData = [...this.tableData, newRow];
    this.totalRevenue += Number(newRow.selling || 0);

    // IMPORTANT: Find the field name for the table (lstproduct) and update form
    const tableField = this.dialogFields.find(f => f.type === 'table');
    if (tableField) {
      this.form.get(tableField.name)?.setValue(this.tableData);
    }

    this.form.get('total_revenue')?.setValue(this.totalRevenue);

    // Clear single-input fields
    this.form.patchValue({
      product_category: '', product_sub_category: '', product_name: '',
      quantity: '', rate: '', selling_cost: ''
    });
  }

  removeLastRow() {
    const removed = this.tableData.pop();
    if (removed) {
      this.totalRevenue -= parseFloat(removed.selling || 0);
      this.form.get('total_revenue')?.setValue(this.totalRevenue);

      const tableField = this.dialogFields.find(f => f.type === 'table');
      if (tableField) {
        this.form.get(tableField.name)?.setValue([...this.tableData]);
      }

    }
  }



  toggleYearPicker(fieldName: string) {
    if (this.activeYearPicker === fieldName) {
      this.activeYearPicker = null;
    } else {
      this.activeYearPicker = fieldName;
      // Set range start based on current value or default
      const currentVal = parseInt(this.form.get(fieldName)?.value);
      if (currentVal) this.yearRangeStart = currentVal - (currentVal % 12);
      this.generateYears();
    }
  }

  generateYears() {
    this.yearsArray = [];
    for (let i = 0; i < 12; i++) {
      this.yearsArray.push(this.yearRangeStart + i);
    }
  }

  changeYearRange(offset: number, event: MouseEvent) {
    event.stopPropagation();
    this.yearRangeStart += offset;
    this.generateYears();
  }

  selectYear(fieldName: string, year: number) {
    this.form.get(fieldName)?.setValue(year.toString());
    this.activeYearPicker = null;
    // Trigger visibility logic in parent
    this.onFieldChange(fieldName, { target: { value: year } });
  }


  onFileSelect(event: any, fieldName: string) {
    const file = event.target.files[0];
    if (file) {
      this.form.patchValue({
        [fieldName]: file
      });
      this.form.get(fieldName)?.updateValueAndValidity();
    }
  }


  initForm() {
    const currentValues = this.form ? this.form.value : {};
    const group: any = {};

    this.dialogFields.forEach(f => {
      const existingValue = currentValues[f.name] !== undefined ? currentValues[f.name] : '';

      // If it's a table, initialize it as an empty array []
      if (f.type === 'table') {
        group[f.name] = [[]];
      } else {
        group[f.name] = [existingValue, (f.hidden || this.disableValidation) ? [] : [Validators.required]];
      }
    });

    this.form = this.fb.group(group);
  }



  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.form.reset();
    }
  }

  // 2. Consolidate submit logic into one function
  save() {
    if (this.form.valid || this.IsvalidData) {
      // Emit the form data to the parent component
      this.onSaveData.emit(this.form.value);

      // Close the modal and reset
      this.showForm = false;
      this.form.reset();
    } else {
      // Mark all as touched to show validation errors in the UI
      this.form.markAllAsTouched();
    }
  }

  // Helper for filtering table data
  //  get filteredData() {

  //   let filtered = [...this.data];

  //   // SEARCH FILTER
  //   if (this.searchText) {
  //     filtered = filtered.filter(row =>
  //       Object.values(row).some(val =>
  //         val?.toString().toLowerCase().includes(this.searchText.toLowerCase())
  //       )
  //     );
  //   }

  //   // ROLE BASED STATUS FILTER
  //   if (this.userDesignation === 'FIELD_OFFICER') {

  //     // FO can see all his data
  //     return filtered;
  //   }

  //   else if (this.userDesignation === 'BEAT_OFFICER') {

  //     // Only FO Approved records visible to BO
  //     return filtered.filter(row =>
  //       row.fo_status === 'Approved' ||
  //       row.fo_status === 'YES'
  //     );
  //   }

  //   else if (this.userDesignation === 'RANGE_OFFICER') {

  //     // Only BO Approved records visible to RO
  //     return filtered.filter(row =>
  //       row.bo_status === 'Approved' ||
  //       row.bo_status === 'YES'
  //     );
  //   }

  //   return filtered;
  // }

  // get filteredData() {

  //   let filtered = [...this.data];

  //   // SEARCH FILTER
  //   if (this.searchText) {
  //     filtered = filtered.filter(row =>
  //       Object.values(row).some(val =>
  //         val?.toString().toLowerCase().includes(this.searchText.toLowerCase())
  //       )
  //     );
  //   }

  //    if (filtered.some(item => item.proposedCapacityModule !== true) && filtered.some(item => item.jfmcdataentrymodule!==true) &&
  //    filtered.some(item=>item.jfmcmontoring !==true) &&   filtered.some(item=>item.checklistmodule !==true)&& filtered.some(item=>item.shgdataentry !==true)) {


  //      if (this.userDesignation === 'FIELD_OFFICER') {
  //        return filtered;
  //      }

  //      else if (this.userDesignation === 'BEAT_OFFICER') {

  //        // Only FO Approved records visible to BO
  //        return filtered.filter(row =>
  //          row.fo_status === 'Approved' ||
  //          row.fo_status === 'YES'
  //        );
  //      }

  //      else if (this.userDesignation === 'RANGE_OFFICER') {

  //        // Only BO Approved records visible to RO
  //        return filtered.filter(row =>
  //          row.bo_status === 'Approved' ||
  //          row.bo_status === 'YES'
  //        );
  //      }
  //      else {
  //       return filtered.filter(row =>
  //          row.bo_status === 'Approved' ||
  //          row.bo_status === 'YES' ||
  //            row.fo_status === 'Approved' ||
  //          row.fo_status === 'YES'

  //        );
  //      }
  //    }
  //   return filtered;
  // }

  get filteredData() {

    let filtered = [...this.data];
    let actualfilterdata = [];
    this.JuridictionAccess = filtered.some((item: any) => item.adminmodule === true || item.jfmcdataentrymodule == true || item.pmattendance == true);
   



    // Uncomment this line for Assign Juridction.
    if (!this.JuridictionAccess) {
      // this.loadjuridiction(filtered);

      const session = sessionStorage.getItem('Session');

      let sessionDistricts: string[] = [];

      if (session) {
        const parsedSession = JSON.parse(session);

        sessionDistricts =
          JSON.parse(parsedSession.Data[0].jurisdiction_details || '{}')
            ?.Jurisdiction?.district || [];
        sessionStorage.setItem('sessionDistricts', JSON.stringify(sessionDistricts));

      }

      // ✅ filter your data
      // filtered = this.data.filter(c=>c.district == sessionDistricts);



      filtered = this.data.filter((c: any) =>
        sessionDistricts.includes(c.district)
      );
      sessionStorage.setItem('filterddata', JSON.stringify(filtered));
    }




    // SEARCH FILTER
    if (this.searchText) {
      filtered = filtered.filter(row =>
        Object.values(row).some(val =>
          val?.toString().toLowerCase().includes(this.searchText.toLowerCase())
        )
      );
    }

    if (filtered.some(item => item.proposedCapacityModule !== true) && filtered.some(item => item.jfmcdataentrymodule !== true && filtered.some(item => item.adminmodule !== true))
      &&
      filtered.some(item => item.jfmcmontoring !== true) && filtered.some(item => item.checklistmodule !== true) && filtered.some(item => item.shgdataentry !== true)
      && filtered.some(item => item.adminmodule !== true)
      && filtered.some(item => item.ntfpcreationccfccentermodule !== true) && filtered.some(item => item.ntfpcreationcraftmoreoutlets !== true)
      && filtered.some(item => item.ntfpexibitionfair !== true) && filtered.some(item => item.ntfpSurvey !== true) && filtered.some(item => item.ntfpresourceRegenerate !== true)
      && filtered.some(item => item.ntfpresourceHarvesting !== true) && filtered.some(item => item.ntfpcollection !== true)
      && filtered.some(item => item.ntfpMarketingStalls !== true)
      && filtered.some(item => item.ntfpprocessingQualityControl !== true)
      && filtered.some(item => item.catchmentsmcwatershed !== true)
      && filtered.some(item => item.catchmentsmcwatertreatment !== true)
      && filtered.some(item => item.catchmentsmcwatertubewells !== true)
      && filtered.some(item => item.catchmentsmcwaterweatherdata !== true)
      && filtered.some(item => item.livelihoodmodule !== true)
      && filtered.some(item => item.capacityapprovedmodule !== true)
      && filtered.some(item => item.ntfpcraftmoreoutletsmonitors !== true)
      && filtered.some(item => item.ProjectmanagementAssetcreation !== true)
      && filtered.some(item => item.ProjectmanagementAssetcreation !== true)
      && filtered.some(item => item.jfmcmeeting !== true)
      && filtered.some(item => item.checkdamdetails !== true)
      && filtered.some(item => item.productiondetails !== true)
      && filtered.some(item => item.speciesdetails !== true)
      && filtered.some(item => item.speciesdetails !== true)
      && filtered.some(item => item.targetdetails !== true)
      && filtered.some(item => item.jfmcdataentrymodule !== true)
      && filtered.some(item => item.pmattendance !== true)
      && filtered.some(item => item.nurseryinfra !== true)
      && filtered.some(item => item.nurseryinfracost !== true)
      && filtered.some(item => item.fmplantationadvwork !== true)
      && filtered.some(item => item.fmnurserysitemaster !== true)
      && filtered.some(item => item.CatchmentSmcImplementation !== true)
    ) {


      if (this.userDesignation === 'FIELD_OFFICER') {
        return filtered;
      }

      else if (this.userDesignation === 'BEAT_OFFICER') {

        // Only FO Approved records visible to BO
        actualfilterdata = filtered.filter(row =>
          row.fo_status === 'Approved' ||
          row.fo_status === 'YES' || row.fo_status == ''
        );
        return actualfilterdata;
      }

      else if (this.userDesignation === 'RANGE_OFFICER') {

        // Only BO Approved records visible to RO
        actualfilterdata = filtered.filter(row =>
          row.bo_status === 'Approved' ||
          row.bo_status === 'YES' || row.bo_status == ''
        );
        return actualfilterdata;

      }
      else {
        actualfilterdata = filtered.filter(row =>
          row.bo_status == 'Approved'
          && row.fo_status == 'Approved'
          && row.ro_status == 'Approved'
          && row.status_id != 6
        );
        return actualfilterdata;
      }
    }
    console.log('Filtered Data:', filtered);
    return filtered;
  }
  loadjuridiction(filtered: any) {
    const payload = {
      userIds: filtered.map((x: any) => x.createdby)
    };
    if (!this.JuridictionAccess) {
      this.coreservice.Getjuridictiondetails(payload)
        .subscribe((res: any) => {
          console.log(res);
          this.data = this.data.map(row => {

            const jurisdiction = res.find(
              (j: any) => j.user_id === row.createdby || j.user_name == row.createdby
            );
                if(row.jfmcdataentrymodule ==  true || row.adminmodule === true || row.pmattendance === true ||row.nurseryinfracost == true || row.fmplantationadvwork == true || row.fmnurserysitemaster == true){
                  this.disablejuridictioncolumns =  true;
                }
            return {
              ...row,
              district: jurisdiction?.district_name || '',
              subDivision: jurisdiction?.subdivision_name || '',
              range: jurisdiction?.range_name || '',
              beat: jurisdiction?.beat_name || ''
            };
          });

          // Prevent duplicate column creation
          if (!this.columns.some(c => c.field === 'district')) {
            if (!this.disablejuridictioncolumns) {
              this.columns.push(
                { field: 'district', header: 'District' },
                { field: 'subDivision', header: 'Sub Division' },
                { field: 'range', header: 'Range' },
                { field: 'beat', header: 'Beat' }
              );
              // Trigger change detection if needed
              this.columns = [...this.columns];
            }
          }

        }, error => {
          console.error('Error loading jurisdiction details:', error);
        });
    }
  }
getmonitoringdata(payload: any) {
  const target = Array.isArray(payload) ? payload[0] : payload;

  if (!target) {
    console.error("Payload is empty or invalid.");
    return;
  }

  const data = {
    ModuleName: target.Main_module,
    SubModuleName: target.Sub_module,
    ChildModuleName: target.child_Module,
    Id: String(target.id)
  };

  this.coreservice.getmontoringdata(data).subscribe({
    next: (res: any[]) => {
      if (!res || res.length === 0 || !this.data) return;
     
      this.data = this.data.map((row) => {
        const matchingRes = res.find(
          (item) => String(item.module_id) === String(row.id)
        );
        return {
          ...row,
          status: matchingRes?.status ?? '',
          remark:
            matchingRes?.status === 'Correct'
              ? ''
              : (matchingRes?.remarks ?? '')
        };
      });

      // 2. Prevent duplicate column creation on multiple API calls
      const hasStatusColumn = this.columns.some(c => c.field === 'status');
      if(this.userDesignation == 'SUB_DISTRICT_OFFICER' 
        || this.userDesignation == 'DISTRICT_OFFICER' 
        || this.userDesignation == 'DIRECTOR_M_AND_E' 
        || this.userDesignation == 'DIRECTOR_LIVELIHOOD_COORDINATOR'
        || this.userDesignation == "RANGE_OFFICER"
      ){
      if (!hasStatusColumn) {
        if(this.data.filter(c=>c.remark != undefined)){
          this.columns = [
          ...this.columns,
          { field: 'status', header: 'Status' },
          { field: 'remark', header: 'Remarks' }
        ];
        }
        else{
        this.columns = [
          ...this.columns,
          { field: 'status', header: 'Status' },
          // { field: 'remark', header: 'Remarks' }
        ];
      }
      }
    }
    },
    error: (error) => {
      console.error('Error loading jurisdiction details:', error);
    }
  });
}
  getStatusWeight(value: any): string {
    const status = String(value || '').toLowerCase().trim();
    return status === 'approved' ? '800' : '400';
  }

  // onAction(action: string, row: any) {
  //   console.log(`Action: ${action}`, row);
  //   sessionStorage.setItem(action, JSON.stringify(row));
  //   this.actionClicked.emit({ action, row });

  //   if (action === 'view' || action == "Adminview" || action == "proposed action view" || action == "Add jurisdiction" || action == "Edit") {
  //    this.originalRowSnapshot = JSON.parse(JSON.stringify(row)); 
  //     this.selectedRow = { ...row };
  //     this.viewPopupVisible = true;
  //     this.popupColumns = this.columns.filter(c => c.field !== 'actions');
  //     this.isMinimized = true;

  //     // --- NEW LOGIC: DETECT IF ALREADY PROCESSED (APPROVED OR REJECTED) ---

  //     // We check the "_display" fields because your MeetingComponent uses those for the "Rejected" text
  //     let currentStatusValue = '';

  //     if (this.userDesignation === 'FIELD_OFFICER') {
  //       currentStatusValue = this.selectedRow.fo_status_display || '';
  //     } else if (this.userDesignation === 'BEAT_OFFICER') {
  //       currentStatusValue = this.selectedRow.bo_status_display || '';
  //     } else if (this.userDesignation === 'RANGE_OFFICER') {
  //       currentStatusValue = this.selectedRow.ro_status_display || '';
  //     }

  //     // If the status is ALREADY 'Approved' or 'Rejected', set viewvisiblity to true (hides buttons)
  //     if (currentStatusValue === 'Approved' || currentStatusValue === 'Rejected') {
  //       this.viewvisiblity = true;
  //       this.readonlyfields = true;
  //     } 
  //     else if (action === "Adminview") {
  //       this.viewvisiblity = true;
  //     } 
  //     else {
  //       // Otherwise show the buttons
  //       this.viewvisiblity = false;
  //       this.updatedisable = false;
  //     }

  //     // --- MAINTAINING YOUR SYSTEM STATUS LOGIC ---
  //     // If it's a Proposed Action View or specific Status ID, hide buttons
  //     const column = this.columns.find(c => c.actions?.[0]?.action === 'proposed action view');
  //     const officerRoles = ["RANGE_OFFICER", "BEAT_OFFICER", "FIELD_OFFICER"];

  //     if (column != null) {
  //       if (officerRoles.includes(this.userDesignation)) {
  //         // Do nothing, let the currentStatusValue logic above handle it
  //       }
  //       else if ((this.selectedRow.status_id !== 4 && this.selectedRow.status_id !== 5 && this.selectedRow.status_id !== 6) && this.userDesignation == "SUB_DISTRICT_OFFICER") {
  //         this.viewvisiblity = false;
  //       }
  //       else if (this.selectedRow.status_id !== 5 && this.selectedRow.status_id !== 6 && this.userDesignation == "DISTRICT_OFFICER") {
  //         this.viewvisiblity = false;
  //       }
  //       else if (this.selectedRow.status_id !== 6 && (this.userDesignation == "DIRECTOR_M_AND_E" || this.userDesignation == "DIRECTOR_LIVELIHOOD_COORDINATOR")) {
  //         this.viewvisiblity = false;
  //       }
  //       else if (this.selectedRow.status_id === 1 || this.selectedRow.status_id === 2) {
  //         this.viewvisiblity = false;
  //       }
  //       else {
  //         this.viewvisiblity = true;
  //       }
  //     }

  //     // Final check for read-only fields
  //     if (this.viewvisiblity || this.selectedRow?.status_id == 2) {
  //       this.readonlyfields = true;
  //     } else {
  //       this.readonlyfields = false;
  //     }

  //     return;
  //   }

  //   this.actionClicked.emit({ action, row });
  // }

  onAction(action: string, row: any) {
    console.log(`Action: ${action}`, row);
    sessionStorage.setItem(action, JSON.stringify(row));
    this.actionClicked.emit({ action, row });

    this.statusChanged = false;
    if (this.userDesignation == "RANGE_OFFICER" || this.userDesignation == 'BEAT_OFFICER' || this.userDesignation == 'FIELD_OFFICER'
      || this.userDesignation == 'SUB_DISTRICT_OFFICER' || this.userDesignation == 'DISTRICT_OFFICER' || this.userDesignation == 'DIRECTOR_M_AND_E' || this.userDesignation == 'DIRECTOR_LIVELIHOOD_COORDINATOR') {
      this.disableapprovebuttons = false;
    }
    //for Other logins disable Status Buttons and Editable Buttons. 
    else {
      this.disableapprovebuttons = true;
      this.readonlyfields = true;
    }
    if (action === "checklist_view" || action === "monitoring_view" || action == 'jfmcmeeting'
      //  || action == "view_creation_ccf_center" || action == "view_craftsandmore"
      //  || action == "view_ntfp_details" || action == "view_ntfpmarketing" || action =="view_ntfp_processing" || action =="view_survey"
      //  || action == "view_resource_generation" || action == "view_resouce_harvesting" || action === "smc_Piezometric wells_Tubewells"
      //  || action === "ntfpcraftmoreoutletsmonitors" || action=="Asset_Creation_View" || action =="Asset_Maintence_View"
    ) {
      this.disableapprovebuttons = true;

    }
    if (action === "monitoring_view" || action === "checklist_view") {
      this.enableupdate = true;
      this.readonlyfields = false;
    }
    if (action === 'view' || action == "Adminview" || action == "proposed action view" || action == "Add jurisdiction" || action == "Edit" || action == "checklist_view" || action === "monitoring_view"
      || action == "view_creation_ccf_center" || action == "view_craftsandmore" ||
      action == "view_ntfp_details" || action == "view_ntfpmarketing" || action == "view_ntfp_processing" ||
      action == "view_survey" || action == "view_resource_generation"
      || action == "view_resouce_harvesting" || action === "smc_Piezometric wells_Tubewells" || action === "ntfpcraftmoreoutletsmonitors"
      || action === "Asset_Creation_View" || action === "Asset_Maintence_View"
      || action === "checkdam_view" || action === "production_view" || action === "species_view" || action === "target_view") {
      this.originalRowSnapshot = JSON.parse(JSON.stringify(row));
      this.selectedRow = { ...row };

      this.viewPopupVisible = true;
      console.log('selected view', this.selectedRow);
      this.popupColumns = this.columns.filter(c => c.field !== 'actions');
      this.isMinimized = true;
      let visibilty = this.selectedRow?.ro_status === 'Approved' && this.userDesignation == "RANGE_OFFICER" || this.selectedRow?.bo_status === 'Approved' && this.userDesignation == 'BEAT_OFFICER' || this.selectedRow?.fo_status === 'Approved' && this.userDesignation == 'FIELD_OFFICER' || this.selectedRow?.status_id == 2
        || this.selectedRow.status_id === 4 || this.selectedRow.status_id === 5 || this.selectedRow.status_id === 6;
      if (visibilty) {
        this.viewvisiblity = true;
        //this.updatedisable = true;
      }
      else if (action === "Adminview") {
        this.viewvisiblity = true;
      }
      else {
        this.viewvisiblity = false;
        this.updatedisable = false;
      }
      const column = this.columns.find(c => c.actions?.[0]?.action === 'proposed action view');
      const officerRoles = [
        "RANGE_OFFICER",
        "BEAT_OFFICER",
        "FIELD_OFFICER"
      ];
      if (column != null) {
        if (officerRoles.includes(this.userDesignation)) {
          this.viewvisiblity = true;
        }
        else if (
          (this.selectedRow.status_id !== 4 && this.selectedRow.status_id !== 5 && this.selectedRow.status_id !== 6) && this.userDesignation == "SUB_DISTRICT_OFFICER"
        ) {
          this.viewvisiblity = false;
        }
        else if (this.selectedRow.status_id !== 5 && this.selectedRow.status_id !== 6 && this.userDesignation == "DISTRICT_OFFICER") {
          this.viewvisiblity = false;
        }
        else if (this.selectedRow.status_id !== 6 && this.userDesignation == "DIRECTOR_M_AND_E" || this.selectedRow.status_id !== 6 && this.userDesignation == "DIRECTOR_LIVELIHOOD_COORDINATOR") {
          this.viewvisiblity = false;
        }
        else if (this.selectedRow.status_id === 1 || this.selectedRow.status_id === 2) {
          this.viewvisiblity = false;
        }
        else {
          this.viewvisiblity = true;
        }

      }
      if (
        (this.userDesignation === "BEAT_OFFICER" && this.selectedRow?.bo_status === 'Approved') ||
        (this.userDesignation === "RANGE_OFFICER" && this.selectedRow?.ro_status === 'Approved') ||
        (this.userDesignation === "FIELD_OFFICER" && this.selectedRow?.fo_status === 'Approved') ||
        this.selectedRow?.status_id == 2 || this.disableapprovebuttons == true
      ) {
        if (this.enableupdate != true) {
          this.readonlyfields = true;
        }
      }
      else {
        this.readonlyfields = false;
      }


      return;




    }

    this.actionClicked.emit({ action, row });
  }


  printPage() {
    // 1. Build the Table Headers (excluding Action columns)
    const headers = this.columns
      .filter(col => col.type !== 'actions') // Remove View/Edit buttons column
      .map(col => `<th style="background-color: #f2994a; color: white;">${col.header}</th>`)
      .join('');

    // 2. Build the Table Body using 'filteredData' (ALL DATA, not just current page)
    const rows = this.filteredData.map(row => {
      const cells = this.columns
        .filter(col => col.type !== 'actions')
        .map(col => {
          let val = row[col.field!] || '-';
          // Check if it is a Status column to add styling (Optional)
          if (col.type === 'status') {
            // You can add logic here to colorize status if needed, 
            // for now we print the text value
          }
          return `<td style="border: 1px solid #000; padding: 8px;">${val}</td>`;
        })
        .join('');
      return `<tr>${cells}</tr>`;
    }).join('');

    // 3. Construct the Full HTML
    const fullTableHtml = `
      <h2 style="text-align:center; font-family: sans-serif;">${this.title}</h2>
      <table style="width: 100%; border-collapse: collapse; font-family: sans-serif; font-size: 12px;">
        <thead>
          <tr>${headers}</tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `;

    // 4. Create Hidden Iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    // 5. Write to Iframe and Print
    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(`
        <html>
          <head>
            <title>Print</title>
            <style>
              /* Styles for the print layout */
              body { margin: 20px; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #000; padding: 8px; text-align: left; }
              th { -webkit-print-color-adjust: exact; background-color: #f2994a !important; color: white !important; }
              tr { page-break-inside: avoid; } /* Tries to keep rows intact across pages */
            </style>
          </head>
          <body>${fullTableHtml}</body>
        </html>
      `);
      doc.close();

      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();

      // Remove iframe after 1 second
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }
  }


  csvPage() {
    // Map grid data
    const worksheetData = this.data.map(row => {
      const obj: any = {};
      this.columns.forEach(col => {
        obj[col.header] = row[col.field];
      });
      return obj;
    });

    // Convert JSON → worksheet
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(worksheetData);

    // Convert worksheet → CSV
    const csv: string = XLSX.utils.sheet_to_csv(worksheet);

    // Create CSV file and trigger download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'Grid_Data.csv' + this.title ? `_${this.title.replace(/\s+/g, '_')}` : '';
    link.click();

    window.URL.revokeObjectURL(url);
  }

  pdfPage() {
    // 1. Create your document instance
    const doc = new jsPDF('l', 'pt', 'a4');

    // Filter out internal or presentation UI columns
    const validColumns = this.columns.filter(col =>
      col.header &&
      col.type !== 'actions' &&
      col.header.toLowerCase() !== 'action' &&
      col.header.toLowerCase() !== 'map'
    );

    const headers = validColumns.map(col => col.header);
    const data = this.data.map(row =>
      validColumns.map(col => row[col.field] !== undefined && row[col.field] !== null ? String(row[col.field]) : '')
    );

    const dynamicFontSize = validColumns.length > 12 ? 7 : (validColumns.length > 8 ? 8 : 9);

    doc.setFontSize(14);
    doc.text('Grid Data Report - ' + (this.title || ''), 40, 30);

    // 2. FIXED: Call autoTable as a direct function and pass 'doc' as the first argument
    autoTable(doc, {
      head: [headers],
      body: data,
      startY: 50,
      margin: { left: 20, right: 20 },

      styles: {
        fontSize: dynamicFontSize,
        cellPadding: 4,
        textColor: [0, 0, 0],
        valign: 'middle',
        overflow: 'linebreak',
        cellWidth: 'auto'
      },

      headStyles: {
        fillColor: [230, 145, 56],   // ORANGE header
        textColor: [255, 255, 255],  // WHITE text
        fontStyle: 'bold',
        halign: 'center',
        fontSize: dynamicFontSize + 0.5
      },

      alternateRowStyles: {
        fillColor: [245, 245, 245]   // LIGHT GREY rows
      },

      bodyStyles: {
        fillColor: [255, 255, 255]
      },

      columnStyles: {
        0: { halign: 'center' }
      },

      didParseCell: function (cellData: any) {
        if (cellData.section === 'body') {
          const textVal = String(cellData.cell.raw || '');
          if (textVal.toLowerCase() === 'approved') {
            cellData.cell.styles.textColor = [34, 139, 34]; // GREEN
            cellData.cell.styles.fontStyle = 'bold';
          }
        }
      }
    });

    doc.save('Grid_Data.pdf' + this.title ? `_${this.title.replace(/\s+/g, '_')}` : '');
  }
  sortField: string = '';
  sortDir: 'asc' | 'desc' = 'asc';

  sort(field: string) {
    if (this.sortField === field) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDir = 'asc';
    }

    this.data = [...this.data].sort((a, b) => {
      if (a[field] > b[field]) return this.sortDir === 'asc' ? 1 : -1;
      if (a[field] < b[field]) return this.sortDir === 'asc' ? -1 : 1;
      return 0;
    });
  }


  closeViewPopup() {
    this.viewPopupVisible = false;
  }

  closeView() {
    this.viewPopupVisible = false;
    this.isMinimized = false;
  }

  getRejectionHistory() {
    const history: any[] = [];
    const row = this.selectedRow;
    if (!row) return history;

    // 1. PARSE MANUAL UPDATES Safely
    if (row.update_log_history) {
      const logs = row.update_log_history.split('###');
      logs.forEach((log: string) => {
        if (log.trim()) {
          history.push({
            type: 'UPDATE',
            by: log.split(' by ')[1]?.split(' on ')[0] || 'User',
            action: 'Field Updated',
            details: log.split(': ')[1] || log,
            date: log.split(' on ')[1]?.split(': ')[0] + ':' + log.split(' on ')[1]?.split(': ')[1] || '',
            color: '#3b82f6'
          });
        }
      });
    }

    // 2. AUDIT LOG PROCESSING
    const officerRoles = [
      { prefix: 'fo', label: 'Field Officer' },
      { prefix: 'bo', label: 'Beat Officer' },
      { prefix: 'ro', label: 'Range Officer' }
    ];

    officerRoles.forEach(role => {
      const rejComment = row[`${role.prefix}_rej_comments`];
      if (rejComment && rejComment !== 'null' && rejComment !== '-') {
        history.push({
          type: 'REJECT',
          by: role.label,
          action: 'Rejected',
          details: rejComment,
          date: row[`${role.prefix}_rej_date`] || 'N/A',
          color: '#ef4444'
        });
      }

      if (row[`${role.prefix}_status`] === 'Approved' || row[`${role.prefix}_status`] === 'YES') {
        history.push({
          type: 'APPROVE',
          by: role.label,
          action: 'Approved',
          details: 'Record verified and approved.',
          date: '',
          color: '#10b981'
        });
      }
    });

    // 👇 FIX: Use the spread operator [...] to create a fresh array reference 
    // This prevents Angular from getting stuck in an infinite change detection loop
    return [...history].reverse();
  }

  statusbar(type: any) {
    this.statusChanged = true;
    // 1. Set the status value
    if (type === "YES") {
      this.selectedRow.status = "YES";
      this.RejectReason = false;
    } else if (type === "NO") {
      this.selectedRow.status = "NO";
      this.RejectReason = true;
    } else {
      return;
    }

    const isApproved = this.selectedRow.status === "YES";

    // 2. Setup the Notification UI (Visual feedback)
    let message = isApproved ? "Approved Successfully!" : "Rejected Successfully!";
    let bgColor = isApproved ? "#4CAF50" : "#e90f0f";

    const alertBox = document.createElement("div");
    alertBox.innerText = message;
    alertBox.style.position = "fixed";
    alertBox.style.top = "20px";
    alertBox.style.right = "20px";
    alertBox.style.background = bgColor;
    alertBox.style.color = "white";
    alertBox.style.padding = "12px 25px";
    alertBox.style.borderRadius = "8px";
    alertBox.style.zIndex = "9999";
    alertBox.style.fontWeight = "bold";
    alertBox.style.boxShadow = "0 4px 10px rgba(0,0,0,0.3)";

    document.body.appendChild(alertBox);

    // Remove the alert after 1 second
    setTimeout(() => {
      alertBox.remove();
    }, 1000);

    // 3. IMMEDIATE SUBMISSION LOGIC

    // If user clicked APPROVE -> Submit and close immediately
    if (isApproved) {
      this.submitStatus();
    }

    // If user clicked REJECT ->
    else {
      // If we DON'T need a reason box, submit and close immediately
      if (!this.Modulewiserejectbox) {
        this.submitStatus();
      }
      // If we DO need a reason box, do nothing here. 
      // The HTML will show the textarea and a "Confirm Rejection" button.
    }
  }

  submitStatus() {

    let changeSummary: string[] = [];

    // 1. Check for changes in editable fields (A -> B)
    if (this.editableFields && this.originalRowSnapshot) {
      this.editableFields.forEach(field => {
        const oldVal = this.originalRowSnapshot[field] || 'Empty';
        const newVal = this.selectedRow[field] || 'Empty';

        if (oldVal !== newVal) {
          changeSummary.push(`[${field.toUpperCase()}] changed from "${oldVal}" to "${newVal}"`);
        }
      });
    }

    // 2. If changes exist, create a log entry
    if (changeSummary.length > 0) {
      const timestamp = new Date().toLocaleString('en-IN');
      const newLog = `Update by ${this.userDesignation} on ${timestamp}: ${changeSummary.join(' | ')}`;

      // Append to a hidden field that gets saved to DB
      // We use a separator like '###' to split multiple updates later
      this.selectedRow.update_log_history = (this.selectedRow.update_log_history || '') + '###' + newLog;
    }
    // If the action is a Rejection, stamp the current date
    if (this.selectedRow.status === 'NO') {
      const today = new Date().toISOString(); // Gets current timestamp

      if (this.userDesignation === 'FIELD_OFFICER') {
        this.selectedRow.fo_rej_date = today;
        this.selectedRow.fo_rej_comments = this.selectedRow.rejectreason;
      } else if (this.userDesignation === 'BEAT_OFFICER') {
        this.selectedRow.bo_rej_date = today;
        this.selectedRow.bo_rej_comments = this.selectedRow.rejectreason;
      } else if (this.userDesignation === 'RANGE_OFFICER') {
        this.selectedRow.ro_rej_date = today;
        this.selectedRow.ro_rej_comments = this.selectedRow.rejectreason;
      }
    }

    const payloadToEmit = {
      ...this.selectedRow,
      action: this.statusChanged ? 'statusChange' : 'update' // <-- Assign action type
    };

    // Emit the data to parent (Meeting or Panchasutra component)
    this.onUpdateView.emit(this.selectedRow);

    this.viewPopupVisible = false;
    this.isMinimized = false;
  }
  openViewPopupFromOutside(row: any) {
    this.selectedRow = { ...row };
    this.viewPopupVisible = true;
  }

  isEditable(field: string | number): boolean {
    return this.editableFields?.includes(String(field));
  }

  getValue(key: unknown) {
    return this.selectedRow[key as string];
  }

  setValue(key: unknown, value: any) {
    this.selectedRow[key as string] = value;
  }

  handleActionClick(actionName: string) {
    this.actionClicked.emit({
      action: actionName,
      row: this.selectedRow
    });
    if (actionName == "Seeding View") {
      this.viewPopupVisible = false;
    }

  }
  get visibleColumns(): GridColumn[] {
    return this.columns.filter(col =>
      !this.hiddenFields.includes(col.field) &&
      !this.hiddenHeaders.includes(col.header)
    );
  }
  // onFieldChange(fieldName: string, value: any) {
  //   var data = value.target.value
  //   // emit event to parent

  //   this.fieldChange.emit({
  //     field: fieldName,
  //     value: data
  //   });

  // }


  onFieldChange(fieldName: string, event: any) {
    var data = event?.target?.value ?? '';
    // emit event to parent
    if (fieldName !== "level_of_participants" && fieldName !== "financial_year" && fieldName !== "scheme_master" && fieldName !== "activity_type_master" && fieldName !== "category_of_activity" && fieldName !== "mode_of_training"
      && fieldName !== "district" && fieldName !== "subdivision" && fieldName !== "range"
      && fieldName != 'board_topic' && fieldName != 'topic_description' && fieldName != 'trainees_count' && fieldName != 'duration' && fieldName != 'batches'
      && fieldName != 'FundRequired'
    ) {
      {
        this.fieldChange.emit({
          field: fieldName,
          value: data,
          form: this.form
        });
      }
    }
  }
  isDropdownOpen: any = {};

  toggleDropdown(fieldName: string, event: any) {
    const value = event?.target?.value;
    // Initialize if not exists
    if (!this.selectedValues) {
      this.selectedValues = {};
    }

    if (!this.selectedValues[fieldName]) {
      this.selectedValues[fieldName] = [];
    }

    const currentValues = this.selectedValues[fieldName];

    // Toggle logic (add/remove)
    const index = currentValues.indexOf(value);
    if (index > -1) {
      currentValues.splice(index, 1); // remove if already selected
    } else {
      currentValues.push(value); // add if not selected
    }

    // Update dropdown state
    this.isDropdownOpen[fieldName] = !this.isDropdownOpen[fieldName];

    // Emit updated full list (NOT just single value)
    // this.fieldChange.emit({
    //   field: fieldName,
    //   value: value // send full array
    // });
  }


  // ✅ checkbox select
  onCheckboxChange(fieldName: string, value: any, event: any) {
    let selected = this.form.get(fieldName)?.value || [];
    if (event.target.checked) {
      selected.push(value);
    } else {
      selected = selected.filter((v: any) => v !== value);
    }
    this.form.get(fieldName)?.setValue(selected);
    // Emit fieldChange for cascading dropdowns
    // this.fieldChange.emit({
    //   field: fieldName,
    //   value: selected
    // });
  }


  getOptionName(field: any, value: any): string {
    if (!field.options || field.options.length === 0) {
      return 'Loading...';
    }
    const option = field.options.find((opt: any) => opt.value == value);
    if (option) {
      return option.name;
    }
    return 'Selected Item';
  }

  removeChip(fieldName: string, value: any, event: MouseEvent) {
    event.stopPropagation(); // Prevents the dropdown from opening when clicking 'x'

    let selected = this.form.get(fieldName)?.value || [];
    selected = selected.filter((v: any) => v !== value);

    this.form.get(fieldName)?.setValue(selected);

    this.fieldChange.emit({
      field: fieldName,
      value: selected
    });
  }

  // ✅ Logic to toggle selection without a checkbox
  toggleSelection(fieldName: string, value: any, event: MouseEvent) {
    event.stopPropagation(); // Prevents closing the dropdown

    let selected = this.form.get(fieldName)?.value || [];

    if (selected.includes(value)) {
      selected = selected.filter((v: any) => v !== value);
    } else {
      selected = [...selected, value]; // Add to selection
    }

    this.form.get(fieldName)?.setValue(selected);
    this.fieldChange.emit({ field: fieldName, value: selected });
  }

  getSelectedNames(fieldName: string) {

    const values = this.form.get(fieldName)?.value || [];

    const field = this.dialogFields.find(f => f.name === fieldName);

    if (!field || !field.options) return '';

    return field.options
      .filter(opt => values.includes(opt.value))
      .map(opt => opt.name)
      .join(', ');
  }
  initDynamicForm() {
    const group: any = {};

    this.dialogFields.forEach(field => {
      if (field.type === 'multiselect') {
        group[field.name] = [[]]; // ✅ array
      } else {
        group[field.name] = [''];
      }
    });

    this.form = this.fb.group(group);
  }


  // ✅ checkbox checked
  isChecked(fieldName: string, value: any) {
    const values = this.form.get(fieldName)?.value || [];
    return values.includes(value);
  }



  generateRowPdf(row: any) {
    const doc = new jsPDF();

    // 🔷 Title
    doc.setFontSize(16);
    doc.text('Module Record Details', 14, 15);



    // 🔷 Prepare Table Data
    const body = Object.keys(row).map(key => [
      this.formatLabel(key),
      row[key] ?? ''
    ]);

    // 🔷 Table
    autoTable(doc, {
      startY: 22,
      head: [['Field', 'Value']],
      body: body,
      theme: 'grid', // clean table
      styles: {
        fontSize: 10
      },
      headStyles: {
        fillColor: [41, 128, 185], // blue header
      },
      columnStyles: {
        0: { cellWidth: 60 }, // field column width
        1: { cellWidth: 'auto' }
      }
    });

    // 🔷 Footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(9);
    doc.text('Generated by FIGS System', 14, pageHeight - 10);

    // 🔷 Save
    doc.save('Module_Record.pdf');
  }
  formatLabel(key: string): string {
    return key
      .replace('_master', '')
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, c => c.toUpperCase());
  }



}