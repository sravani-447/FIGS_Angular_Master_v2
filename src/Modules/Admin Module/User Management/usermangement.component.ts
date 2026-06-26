import { Component, OnInit, ViewChild, HostListener } from "@angular/core";
import { GridColumn } from "../../../shared/Grids/grid-column.model";
import { ServerRequests } from "../../../services/ServerRequests";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { DynamicField } from "../../../shared/dialog-boxes/dynamic-form.model";
import { TrainingMaster } from "../../../models/training-master.model";
import jsPDF from "jspdf";
import { CustomGridComponent } from "../../../shared/Grids/custom-grid.component";
import { range } from "rxjs";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
  selector: 'app-adminmanagement',
  templateUrl: './usermanagement.component.html',
   styleUrls: ['./usermanagement.component.css']
})
export class AdminmanagmentComponent implements OnInit {

  data: any[] = [];
  dialogFields: DynamicField[] = [];
  form!: FormGroup;
  isFormVisible: boolean = false;
  trainingData: TrainingMaster[] = [];
  showViewPopup: boolean = false;
  viewUserData: any;
  selectedUser: any;
  showPopup: boolean = false;
  dialogTitle: string = '';
  jurdictionlist: any[] = [];

   currentAction: string = '';
  selectedRow: any;
  showConfirmPopup: boolean = false;
  confirmationMessage: string = '';

  jurisdictionFields: DynamicField[] = [];

  showViewModal = false;
showEditModal = false;
showJurisdictionModal = false;
showConfirmModal = false;

confirmTitle = '';
confirmMsg = '';
confirmBtnText = '';

designationOptions: any[] = []; 
isDropdownOpen: { [key: string]: boolean } = {};
genderOptions = [
  { name: 'Male', value: 'Male' },
  { name: 'Female', value: 'Female' },
  { name: 'Others', value: 'Others' }
];


  @ViewChild('grid') gridComponent!: CustomGridComponent;
  userid: any;

  constructor(
    public coreservices: ServerRequests,
    private fb: FormBuilder,
        private snackBar: MatSnackBar,
  ) { this.initForm(); }

  ngOnInit(): void {
    this.initializeFieldDefinitions();
     this.initDynamicForm();
    this.getLookups();
    this.getuserlist();
    
  }

 initForm() {
  this.form = this.fb.group({
    fname: ['', Validators.required],
    lname: ['', Validators.required],
    email: ['', [
      Validators.required, 
      Validators.pattern("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$")
    ]],
    mobile: ['', [
      Validators.required, 
      Validators.pattern("^[0-9]{10}$")
    ]],
    // Bound the custom duplicate validator here
    username: ['', [Validators.required, this.duplicateUsernameValidator]], 
    password: ['', Validators.minLength(6)],
    designation_id: ['', Validators.required],
    gender: ['', Validators.required],
    district_id: [[]],
    subdivision_id: [[]],
    range_id: [[]],
    beat_id: [[]]
  });
}

  initializeFieldDefinitions() {
  this.dialogFields = [
    { name: 'fname', label: 'First Name', type: 'text' },
    { name: 'lname', label: 'Last Name', type: 'text' },
    { name: 'email', label: 'Email', type: 'text' },
    { name: 'mobile', label: 'Mobile', type: 'text' },
    { name: 'username', label: 'UserName', type: 'text' },
    { name: 'password', label: 'Password', type: 'text' },
    { name: 'gender', label: 'Gender', type: 'text' },
    { name: 'designation_id', label: 'Designation', type: 'select', options: this.designationOptions },
  ];

  this.jurisdictionFields = [
    { name: 'district_id', label: 'District', type: 'multiselect', options: [] },
    { name: 'subdivision_id', label: 'Sub District', type: 'multiselect', options: [] },
    { name: 'range_id', label: 'Range', type: 'multiselect', options: [] },
    { name: 'beat_id', label: 'Beat', type: 'multiselect', options: [] }
  ];
}

isUserBlocked(row: any): boolean {
  return row?.status?.toLowerCase()?.trim() === 'block';
}

  //  GRID COLUMNS
 columns: GridColumn[] = [
  { field: 'user_name', header: 'User Name' },
  { field: 'status', header: 'Status', type: 'status' },
  { field: 'designation_name', header: 'Designation' },
  { field: 'user_id', header: 'User Id' },
  {
    field: 'actions',
    header: 'Actions',
    type: 'actions',
    actions: [
      {
        icon: 'fa fa-eye',
        action: 'Adminview',
        tooltip: 'View',
        color: '#2ecc71',
        visible: (row: any) => true // Always visible
      },
      {
        icon: 'fa fa-pencil',
        action: 'Edit',
        tooltip: 'Edit',
        color: '#3498db',
        visible: (row: any) => !this.isUserBlocked(row)
      },
      {
        icon: 'fa fa-globe',
        action: 'Jurisdiction',
        tooltip: 'Jurisdiction',
        color: '#1abc9c',
        visible: (row: any) => !this.isUserBlocked(row)
      },
      {
        icon: 'fa fa-ban',
        action: 'Block',
        tooltip: 'Block',
        color: '#9b59b6',
        visible: (row: any) => !this.isUserBlocked(row)
      },
      {
        icon: 'fa fa-user-check', // Unblock action button
        action: 'Unblock',
        tooltip: 'Unblock',
        color: '#2ecc71',
        visible: (row: any) => this.isUserBlocked(row)
      },
      {
        icon: 'fa fa-key',
        action: 'ResetPassword',
        tooltip: 'Reset Password',
        color: '#f39c12',
        visible: (row: any) => !this.isUserBlocked(row)
      },
      {
        icon: 'fa fa-trash',
        action: 'Delete',
        tooltip: 'Delete',
        color: '#e74c3c',
        visible: (row: any) => !this.isUserBlocked(row)
      }
    ]
  }
];

@HostListener('document:click', ['$event'])
handleOutsideClick(event: Event) {
  this.isDropdownOpen = {};
}

  //  LOOKUPS
getLookups() {
  this.coreservices.GetUserLookup().subscribe({
    next: (res: any) => {
      let lookupData = res?.Data;
      if (typeof lookupData === 'string') lookupData = JSON.parse(lookupData);
      if (!lookupData || !lookupData['designation_master']) return;

      const designationOptions = lookupData['designation_master']
        .filter((d: any) => d.status === 'active')
        .map((item: any) => ({
          name: item.display_name,
          value: item.designation_id
        }));

      this.designationOptions = designationOptions;

      this.coreservices.GetAllJurisdictionList().subscribe({
        next: (jurRes: any) => {
          this.jurdictionlist = jurRes?.Data || [];

          this.dialogFields = [
            { name: 'fname', label: 'First Name', type: 'text' },
            { name: 'lname', label: 'Last Name', type: 'text' },
            { name: 'email', label: 'Email', type: 'text' },
            { name: 'mobile', label: 'Mobile', type: 'text' },
            { name: 'username', label: 'UserName', type: 'text' },
            { name: 'password', label: 'Password', type: 'text' },
            { name: 'gender', label: 'Gender', type: 'select', options: this.genderOptions },
            { name: 'designation_id', label: 'Designation', type: 'select', options: designationOptions },
          ];

          this.dialogFields.forEach((f: any) => {
            f.required = true; // Most grid components look for this
            if (f.name === 'email') f.pattern = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$";
            if (f.name === 'mobile') f.pattern = "^[0-9]{10}$";
          });

          this.initDynamicForm();
        }
      });
    }
  });
}

getConfirmBtnStyle(): { [key: string]: string } {
  const action = this.confirmBtnText?.toLowerCase();
  
  if (action === 'unblock') {
    return { 'background-color': '#2ecc71', 'color': '#ffffff', 'border': 'none' };
  } else if (action === 'block' || action === 'delete') {
    return { 'background-color': '#e74c3c', 'color': '#ffffff', 'border': 'none' };
  } else if (action === 'reset') {
    return { 'background-color': '#f39c12', 'color': '#ffffff', 'border': 'none' };
  }
  
  return { 'background-color': '#3498db', 'color': '#ffffff', 'border': 'none' };
}

setupJurisdictionFields() {
  const districtOptions = [...new Map(
    this.jurdictionlist.map((item: any) => [
      item.district_id,
      { name: item.district_name, value: item.district_id }
    ])
  ).values()];

  this.jurisdictionFields = [
    { name: 'district_id', label: 'District', type: 'multiselect', options: districtOptions },
    { name: 'subdivision_id', label: 'Sub District', type: 'multiselect', options: [] },
    { name: 'range_id', label: 'Range', type: 'multiselect', options: [] },
    { name: 'beat_id', label: 'Beat', type: 'multiselect', options: [] }
  ];
}


dropdownchange(event: { field: string; value: any }) {
  const selectedValues = event.value || [];

  if (event.field === 'district_id') {
    // 1. Filter out Sub-Districts mapping to the selected Districts
    const filteredSubs = [...new Map(
      this.jurdictionlist
        .filter(item => selectedValues.some((val: any) => val == item.district_id))
        .map(item => [item.subdivision_id, { name: item.subdivision_name, value: item.subdivision_id }])
    ).values()];
    this.updateFieldOptions('subdivision_id', filteredSubs);

    // 2. Select ALL of these filtered Sub-Districts automatically
    const allSubIds = filteredSubs.map(s => s.value);
    this.form.patchValue({ subdivision_id: allSubIds });

    // 3. Cascade down to the next level
    this.dropdownchange({ field: 'subdivision_id', value: allSubIds });

  } else if (event.field === 'subdivision_id') {
    // 1. Filter out Ranges mapping to the selected Sub-Districts
    const filteredRanges = [...new Map(
      this.jurdictionlist
        .filter(item => selectedValues.some((val: any) => val == item.subdivision_id))
        .map(item => [item.range_id, { name: item.range_name, value: item.range_id }])
    ).values()];
    this.updateFieldOptions('range_id', filteredRanges);

    // 2. Select ALL of these filtered Ranges automatically
    const allRangeIds = filteredRanges.map(r => r.value);
    this.form.patchValue({ range_id: allRangeIds });

    // 3. Cascade down to the next level
    this.dropdownchange({ field: 'range_id', value: allRangeIds });

  } else if (event.field === 'range_id') {
    // 1. Filter out Beats mapping to the selected Ranges
    const filteredBeats = [...new Map(
      this.jurdictionlist
        .filter(item => selectedValues.some((val: any) => val == item.range_id))
        .map(item => [item.beat_id, { name: item.beat_name, value: item.beat_id }])
    ).values()];
    this.updateFieldOptions('beat_id', filteredBeats);

    // 2. Select ALL of these filtered Beats automatically
    const allBeatIds = filteredBeats.map(b => b.value);
    this.form.patchValue({ beat_id: allBeatIds });
  }
}

  toggleDropdown(fieldName: string) {
  const isAlreadyOpen = !!this.isDropdownOpen[fieldName];
  this.isDropdownOpen = {}; // Close others
  this.isDropdownOpen[fieldName] = !isAlreadyOpen;
}

getOptionName(field: any, valId: any): string {
  if (!field || !field.options) return '';
  const found = field.options.find((opt: any) => opt.value == valId);
  return found ? found.name : valId;
}

removeChip(fieldName: string, value: any, event: Event) {
  event.stopPropagation(); // Prevents the dropdown from opening/closing
  const currentValues = this.form.get(fieldName)?.value || [];
  const newValues = currentValues.filter((v: any) => v !== value);
  
  this.form.get(fieldName)?.patchValue(newValues);
  
  this.dropdownchange({ field: fieldName, value: newValues });
}

isChecked(fieldName: string, value: any) {
  const currentValues = this.form.get(fieldName)?.value || [];
  return currentValues.includes(value);
}

toggleSelection(fieldName: string, value: any, event: Event) {
  event.stopPropagation();
  let currentValues = this.form.get(fieldName)?.value || [];

  if (currentValues.includes(value)) {
    currentValues = currentValues.filter((v: any) => v !== value);
  } else {
    currentValues.push(value);
  }

  this.form.get(fieldName)?.setValue([...currentValues]);
  
  this.dropdownchange({ field: fieldName, value: currentValues });
}

isSelected(fieldName: string, value: any): boolean {
  const current = this.form.get(fieldName)?.value || [];
  return current.includes(value);
}

handleJurisdictionSubmit() {
  const val = this.form.value;
  
  const selectedDistricts = val.district_id || [];
  const selectedSubs = val.subdivision_id || [];
  const selectedRanges = val.range_id || [];
  const selectedBeats = val.beat_id || [];

  // INSTANT FILTER: Only pull combinations that actually exist in your master data list
  const validJurisdictions = this.jurdictionlist.filter(item => 
    selectedDistricts.some((d: any) => d == item.district_id) &&
    selectedSubs.some((s: any) => s == item.subdivision_id) &&
    selectedRanges.some((r: any) => r == item.range_id) &&
    selectedBeats.some((b: any) => b == item.beat_id)
  );

  // Map directly to your payload structure
  const jurisdictionPayload = validJurisdictions.map(item => ({
    user_id: this.selectedRow.user_id,
    district_id: Number(item.district_id),
    subdivision_id: Number(item.subdivision_id),
    range_id: Number(item.range_id),
    beat_id: Number(item.beat_id)
  }));

  if (jurisdictionPayload.length === 0) {
    this.snackBar.open('Please select at least one jurisdiction', 'Close', { duration: 2000 });
    return;
  }

  this.coreservices.assignJurisdiction(jurisdictionPayload).subscribe({
    next: () => {
      this.onActionSuccess(); // Closes modal and refreshes list
    },
    error: (err) => {
      console.error(err);
      this.snackBar.open('Failed to save jurisdiction mappings.', 'Close', { duration: 3000 });
    }
  });
}


initDynamicForm() {
  const formGroupConfig: any = {};
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  const mobilePattern = /^[0-9]{10}$/;

  this.dialogFields.forEach(field => {
    let validators = [Validators.required];
    if (field.name === 'email') validators.push(Validators.pattern(emailPattern));
    else if (field.name === 'mobile') validators.push(Validators.pattern(mobilePattern));
    else if (field.name === 'password') validators.push(Validators.minLength(6));
    // Apply the real-time duplicate check here
    else if (field.name === 'username') validators.push(this.duplicateUsernameValidator); 

    formGroupConfig[field.name] = ['', validators];
  });

  if (!this.form) {
    this.form = this.fb.group(formGroupConfig);
  } else {
    Object.keys(formGroupConfig).forEach(key => {
      if (!this.form.contains(key)) {
        this.form.addControl(key, this.fb.control('', formGroupConfig[key][1]));
      } else {
        // Dynamically update validators for existing controls
        this.form.get(key)?.setValidators(formGroupConfig[key][1]);
        this.form.get(key)?.updateValueAndValidity();
      }
    });
  }
}

updateFieldOptions(fieldName: string, options: any[]) {
  const df = this.dialogFields.find(f => f.name === fieldName);
  if (df) df.options = options;

  const jf = this.jurisdictionFields.find(f => f.name === fieldName);
  if (jf) jf.options = options;
}

handleSaveRecord(gridData: any) {
  const newUsername = gridData.username?.trim();
  let duplicaterEntry;

  // Check if the username already exists in the current list (case-insensitive check)
  const duplicateExists = this.data.some(
    (user) => user.user_name?.toLowerCase().trim() === newUsername?.toLowerCase()
  );

  if (duplicateExists) {
    duplicaterEntry = true;
    // this.snackBar.open(
    //   'This username already exists. Please make some changes to your ID.', 
    //   'Close', 
    //   { duration: 4000 }
    // );
    // return; // Abort registration
  }

  const payload = {
    fname: gridData.fname,
    lname: gridData.lname,
    EmailId: gridData.email,
    ContactNumber: gridData.mobile,
    UserName: newUsername,
    Password: gridData.password,
    Gender: gridData.gender,
    DesignationId: Number(gridData.designation_id),
    Status: "active"
  };

  console.log('Registering user with payload:', payload);
if(!duplicaterEntry){
  this.coreservices.registerUserAsync(payload).subscribe({
    next: (res: any) => {
      this.snackBar.open('User Registered Successfully!', 'Close', { duration: 3000 });
      this.getuserlist(); // Refresh table
      this.isFormVisible = false; 
    },
    error: (err) => {
      console.error('Registration error:', err);
      this.snackBar.open('Failed to save user.', 'Close', { duration: 3000 });
    }
  });
}
else{
  alert("Already Username is Exists !");
} 
}
  assignjuridiction(gridData: any) {
   
  }

getuserlist() {
  this.coreservices.getaUserManagmentlist().subscribe({
    next: (res: any) => {
      let parsedRes = typeof res === 'string' ? JSON.parse(res) : res;

      this.data = parsedRes?.Data || [];

      // If you meant to add/modify a flag, do it properly:
      this.data = this.data.map((item: any) => ({
        ...item,
        adminmodule: true
      }));
    },
    error: (err: any) => {
      console.error(err);
    }
  });
}


onGridAction(event: { action: string; row: any }) {
  this.selectedRow = event.row;
  this.currentAction = event.action;
  
  if (this.resetModals) this.resetModals();

  switch (event.action) {
    case "Adminview":
      this.coreservices.getJurisdictionByUser(event.row.user_id).subscribe((res: any) => {
        const parsed = typeof res === 'string' ? JSON.parse(res) : res;
        this.viewUserData = parsed.Data[0];
        if(this.viewUserData && this.viewUserData.jurisdiction_details) {
            this.viewUserData.details = JSON.parse(this.viewUserData.jurisdiction_details);
        }
        this.showViewModal = true;
      });
      break;

    case "Edit":
      this.dialogTitle = "Edit User Details";
      this.selectedRow = event.row; 
      
      // RE-INITIALIZE form controls so they exist for validation
      this.initForm(); 
      this.form.reset();

      setTimeout(() => {
        this.form.patchValue({
          fname: event.row.fname,
          lname: event.row.lname,
          email: event.row.emailid,
          mobile: event.row.contact_number,
          username: event.row.user_name,
          password: event.row.password || '',
          designation_id: event.row.designation_id ? event.row.designation_id.toString() : '',
          gender: event.row.gender
        });
        
        this.showEditModal = true;
      }, 50); 
      break;

    case "Jurisdiction":
      // Reinitialize clean schema for the jurisdiction elements explicitly
      this.form = this.fb.group({
        district_id: [[]],
        subdivision_id: [[]],
        range_id: [[]],
        beat_id: [[]]
      });

      this.setupJurisdictionFields();
      this.showJurisdictionModal = true;
      break;

    case "Block":
      this.setConfirm("Block User", "Do you really want to block user?", "Block");
      this.showConfirmModal = true;
      break;

       case "Unblock":
      this.setConfirm("Unblock User", "Do you really want to unblock user?", "Unblock");
      this.showConfirmModal = true;
      break;

    case "ResetPassword":
      this.setConfirm("Reset Password", "Do you really want to reset password?", "Reset");
      this.showConfirmModal = true;
      break;

    case "Delete":
      this.setConfirm("Remove User", "Do you really want to remove user?", "Delete");
      this.showConfirmModal = true;
      break;
  }
}

setConfirm(title: string, msg: string, btn: string) {
  this.confirmTitle = title;
  this.confirmMsg = msg;
  this.confirmBtnText = btn;
  this.showConfirmModal = true;
}

resetModals() {
  this.showViewModal = false;
  this.showEditModal = false;
  this.showJurisdictionModal = false;
  this.showConfirmModal = false;
}

  openView(row: any) {
    this.showViewPopup = true;
    // Call API to get latest jurisdiction details like old jQuery code
    this.coreservices.getuserdetails(row.user_name).subscribe(res => {
        this.viewUserData = res.Data[0];
    });
  }

   openEdit(row: any) {
    this.showPopup = true; 
    this.dialogTitle = "Edit User Details";
    this.form.patchValue({
        fname: row.fname,
        lname: row.lname,
        email: row.emailid,
        mobile: row.contact_number,
        username: row.user_name,
        designation_id: row.designation_id
    });
  }


 handleConfirmSubmit() {
  let status = this.confirmBtnText.toLowerCase();
  
  if (status === 'reset') {
    const payload = { UserName: this.selectedRow.user_name, Status: 'reset' };
    this.coreservices.resetUser(payload).subscribe(() => this.onActionSuccess());
  } else {
    const targetStatus = status === 'unblock' ? 'active' : status;
    const payload = { user_id: this.selectedRow.user_id, Status: targetStatus };
    
    this.coreservices.updateUserStatusAsync(payload).subscribe(() => this.onActionSuccess());
  }
}

onActionSuccess() {
  this.resetModals();
  this.snackBar.open('Action processed successfully', 'Close', { duration: 2000 });
  this.getuserlist();
}

duplicateUsernameValidator = (control: any) => {
  if (!control || !control.value) return null;
  const enteredVal = control.value.trim().toLowerCase();
  
  const exists = this.data.some(user => {
    // If we are currently editing an existing user, skip comparison with their own current username
    if (this.showEditModal && this.selectedRow && user.user_id === this.selectedRow.user_id) {
      return false;
    }
    return user.user_name?.trim().toLowerCase() === enteredVal;
  });

  return exists ? { duplicateUsername: true } : null;
};

handleEditSubmit() {
  const val = this.form.value;
  const updatedUsername = val.username?.trim();

  // Check if another user (excluding the current one) has this username
  const duplicateExists = this.data.some(
    (user) => 
      user.user_id !== this.selectedRow.user_id && 
      user.user_name?.toLowerCase().trim() === updatedUsername?.toLowerCase()
  );

  if (duplicateExists) {
    this.snackBar.open(
      'This username already exists. Please make some changes to your ID.', 
      'Close', 
      { duration: 4000 }
    );
    return; // Abort submission
  }

  const objUpdate = {
    "user_id": this.selectedRow.user_id,
    "UserName": updatedUsername,
    "Password": val.password,
    "DesignationId": Number(val.designation_id),
    "EmailId": val.email,
    "fname": val.fname,
    "lname": val.lname,
    "ContactNumber": val.mobile
  };

  this.coreservices.updateUserAsync(objUpdate).subscribe({
    next: (res: any) => {
      this.snackBar.open('User Updated Successfully', 'Close', { duration: 2000 });
      this.onActionSuccess();
    },
    error: (err: any) => {
      console.log('Handled Redirect/CORS - Refreshing list...');
      this.snackBar.open('Update Processed', 'Close', { duration: 2000 });
      this.onActionSuccess(); 
    }
  });
}
  confirmAction() {
  let status = '';
  if (this.currentAction === 'Block') status = 'block';
  if (this.currentAction === 'Delete') status = 'delete';
  if (this.currentAction === 'ResetPassword') status = 'reset';

  const payload = {
    user_id: this.selectedRow.user_id,
    Status: status,
    UserName: this.selectedRow.user_name
  };

  this.coreservices.updateUserAsync(payload).subscribe({
    next: (res: any) => {
      this.snackBar.open(res.message || 'Action Successful', 'Close', { duration: 3000 });
      this.showConfirmModal = false; // Also use the Modal name here
      this.getuserlist();
    }
  });
}

openJurisdiction(row: any) {
    this.selectedRow = row;
    this.showJurisdictionModal = true; 
    
    const districts = [...new Map(this.jurdictionlist.map(item => [item.district_id, { name: item.district_name, value: item.district_id }])).values()];
    const field = this.jurisdictionFields.find(f => f.name === 'district_id');
    if (field) field.options = districts;
}


handleConfirmAction() {
  let payload: any = { user_id: this.selectedRow.user_id };
  
  if (this.confirmBtnText === 'Block') payload.Status = 'block';
  if (this.confirmBtnText === 'Delete') payload.Status = 'delete';
  if (this.confirmBtnText === 'Unblock') payload.Status = 'active'; // Sets status to active
  
  if (this.confirmBtnText === 'Reset') {
    payload = { UserName: this.selectedRow.user_name, Status: 'reset' };
    this.coreservices.resetUser(payload).subscribe((res: any) => this.onActionSuccess());
  } else {
    this.coreservices.updateUserStatusAsync(payload).subscribe((res: any) => this.onActionSuccess());
  }
}


isAllFieldSelected(field: any): boolean {
  const currentSelection = this.form.get(field.name)?.value || [];
  if (!field.options || field.options.length === 0) return false;
  return currentSelection.length === field.options.length;
}
toggleSelectAllField(field: any, event: Event): void {
  event.stopPropagation(); // Stop dropdown closing trigger loops
  
  const formControl = this.form.get(field.name);
  if (!formControl) return;

  let newValues: any[] = [];

  if (this.isAllFieldSelected(field)) {
    // Action: Deselect All items completely
    formControl.setValue([]);
    newValues = [];
  } else {
    // Action: Select All items by harvesting all mapped values
    newValues = field.options.map((opt: any) => opt.value);
    formControl.setValue(newValues);
  }
  
  formControl.markAsTouched();
  formControl.updateValueAndValidity();

  // CRITICAL FIX: Trigger the cascade manually when Select All/Deselect All is clicked
  this.dropdownchange({ field: field.name, value: newValues });
}
  closeDialog() {
    this.showViewPopup = false;
    this.viewUserData = {};
    this.showPopup = false;
  }
}