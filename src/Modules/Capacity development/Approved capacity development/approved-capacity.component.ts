import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ServerRequests } from '../../../services/ServerRequests';
import { GridColumn } from '../../../shared/Grids/grid-column.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { sessionapproved } from './approvedsesion';
import { Router } from '@angular/router';
@Component({
  selector: 'app-approved-capacity',
  templateUrl: './approved-capacity.component.html',
  styleUrls: ['./approved-capacity.component.css']
})
export class ApprovedCapacityComponent implements OnInit {

  // --- Data Variables ---
  data: any[] = [];
  disablebox: boolean = false;
  session: sessionapproved = new sessionapproved();
  showPanel = false;
  panelData: any;
  trainingduration: any;
  training_venue: string = '';
  tableData: any[] = [];
  // --- UI Flags ---
  isAddingNew = false;
  currentStep = 1;
  showsessionlist = false;
  enabletrainingDuration: boolean = false;

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
  participantsList: TrainingParticipantDetailsCommunity[] = [];
  minDate: string = '';
  maxDate: string = '';

  columns: GridColumn[] = [
    { field: 'sno', header: 'SL.NO.' },
    { field: 'topic_description', header: 'TRAINING NAME' },
    { field: 'training_start_date', header: 'START DATE' },
    { field: 'training_end_date', header: 'END DATE' },
    { field: 'venue', header: 'VENUE' },
    { field: 'duration_of_training', header: 'DURATION' },

    // Action 1: List of Participants (Eye Icon)
    {
      header: 'LIST OF PARTICIPANTS',
      type: 'actions',
      field: '',
      actions: [
        { icon: 'fa fa-eye', action: 'viewParticipants', tooltip: 'View Participants' }
      ]
    },

    // Action 2: Session Details (Eye Icon)
    {
      header: 'SESSION DETAILS',
      type: 'actions',
      field: '',
      actions: [
        { icon: 'fa fa-eye', action: 'viewSessions', tooltip: 'View Session Details' }
      ]
    },

    // Action 3: Feedback Form (Eye Icon)
    {
      header: 'TRAINING FEEDBACK FORM',
      type: 'actions',
      field: '',
      actions: [
        { icon: 'fa fa-eye', action: 'viewFeedback', tooltip: 'View Feedback Form' }
      ]
    }
  ];
  duration_of_training: any;
  trainingID: any;
  sessionList: any[] = [];
  datavalid: boolean = false;

  constructor(
    private coreservices: ServerRequests,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.getLookups();
    this.getapprovedTraininglist();
    this.getproposedTrainingList();
  }

  // --- DATA LOADING ---
  getapprovedTraininglist() {
    this.coreservices.getapprovedtrainiglist().subscribe({
      next: res => {
        const list = res?.Data ?? [];
        // ✅ Combine everything in ONE map
        this.data = list.map((item: any, index: number) => ({
          ...item,
          // ✅ Serial Number
          sno: index + 1,
          capacityapprovedmodule:true,
          // ✅ Date Formatting
          training_start_date: this.formatDate(item.training_start_date),
          training_end_date: this.formatDate(item.training_end_date)
        }));
        console.log(this.data);
        sessionStorage.setItem('approvedtraininglist', JSON.stringify(this.data));
        // ✅ SET DATE RANGE FROM FIRST RECORD (safe)
        if (this.data.length > 0) {
          const firstTraining = this.data[0];
          this.trainingID = firstTraining.training_id;
          this.duration_of_training = firstTraining.duration_of_training;
          this.setDateRangeFromTraining(
            firstTraining.training_start_date,
            firstTraining.training_end_date
          );
        }

      },
      error: err => console.error('Grid Data Error:', err)
    });
  }

  // --- GRID ACTIONS ---

  onGridAction(event: { action: string; row: any }) {
    switch (event.action) {
      case 'viewParticipants':
        this.viewParticipantslist(event.row);
        break;
      case 'viewSessions':
        this.viewSessionslist(event.row);
        break;
      case 'viewFeedback':
        const id = event.row.training_id;

        // Logic to determine if it's department or community
        // Based on your log, ID 122 has participants_type_id: 2
        const ptype = (event.row.participants_type_id == 2) ? 'community' : 'department';

        this.snackBar.open(
          `Opening Feed Back URL:${window.location.origin}/capacity/Approvedfeedback?trainingid=${id}`,
          '',
          { duration: 10000 }
        );

        break;
    }
  }


  // --- VIEW PARTICIPANTS ---
  viewParticipantslist(row: any): void {
    if (!row) return;
    this.disablebox = true; // Hide Grid
    let participantstypeId= 1;

    this.coreservices
      .getapprovedPartispantslist(row.training_id, participantstypeId)
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
    let fileTypeValid = true;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      if (file.type !== 'application/excel' && file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' && file.type !== 'text/csv') {
        alert('Only Excel,CSV files are allowed');
        input.value = ''; // reset input
        fileTypeValid = false;
        return;
      }
      else {
        this.participantFile = file;
        this.participantFileName = file.name;
      }
      this.snackBar.open(`Selected: ${this.participantFileName}`, 'Ok', {
        duration: 2000
      });
      if (fileTypeValid) {
        const reader = new FileReader();

        reader.onload = () => {
          const csvData = reader.result as string;

          // ✅ Parse CSV
          const rawData = this.parseCSV(csvData);

          // ✅ Normalize function (handles Excel issues)
          const normalize = (val: any) => {
            if (!val) return '';
            return String(val)
              .replace(/"/g, '')   // remove quotes
              .replace(/\s+/g, '') // remove spaces
              .trim();
          };

          // ✅ Map data properly
          this.participantsList = rawData.map((p: any) => ({
            Name: normalize(p.Participant_Name),
            Age: normalize(p.Age),
            Gender: normalize(p.Gender),
            Adhar_number: normalize(p.Aadhar_Number),
            Phone_number: normalize(p.Mobile_Number),
            training_id: this.trainingID || 0
          }));

          console.log('Parsed Data:', this.participantsList); // debug

          // ✅ Validation (exact 10 digits)
          this.tableData = this.participantsList.map(p => {
            const mobile = String(p.Phone_number);
            const aadhar = String(p.Adhar_number);

            const isInvalid =
              !/^\d{10}$/.test(mobile) ||   // ✅ Mobile → 10 digits
              !/^\d{12}$/.test(aadhar);    // ✅ Aadhar → 12 digits

            return { ...p, isInvalid };
          });

          const hasInvalid = this.tableData.some(p => p.isInvalid);

          if (hasInvalid) {
            this.snackBar.open(
              'Phone number must be 10 digits and Aadhar must be 12 digits (numbers only).',
              'Close',
              { duration: 4000 }
            );
            this.datavalid = true;
            return;
          }
          if (hasInvalid == false) {
            // ✅ API CALL
            this.datavalid = false;
            this.coreservices.InsertDepartmentParticipants(this.participantsList).subscribe({
              next: (res) => {
                this.snackBar.open('Participants uploaded successfully!', 'Close', {
                  duration: 3000
                });
              },
              error: (err) => {
                console.error('Upload Error:', err);
                this.snackBar.open('Upload failed!', 'Close', {
                  duration: 3000
                });
              }
            });
          }
          else {
            this.snackBar.open('Participants uploaded Failed!', 'Close', {
              duration: 3000
            });
          };
        }
        reader.readAsText(file);
      }
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
    const csvData = "Participant_Name,Age,Gender,Mobile_Number,Aadhar_Number,Designation";

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
    this.showsessionlist = false;
    this.session = new sessionapproved();
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
    if (this.currentStep === 1) {
      // Check if dropdown is empty
      if (!this.listofTrainingsID) {
        this.showTrainingError = true; // Trigger the error message
        return; // Stop here, don't go to next step
      }
    }

    if (this.currentStep < 3) this.currentStep++;
  }



  prevStep() { if (this.currentStep > 1) this.currentStep--; }

  // submitForm() {
  //   this.saveTrainingSession();
  //   this.snackBar.open('Training Session Created Successfully!', 'Close', { duration: 3000 });
  //   this.toggleAddNew(false);
  // }

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
      next: (res) => {
        this.lookupData = res?.Data;
        if (!this.lookupData) return;
        const list = (k: string) => { const d = res.Data[k]; return Array.isArray(d) ? d : [d]; };
        this.activityType = list('activity_type_master');
        this.partispantstype = list('participants_type_master');
        this.categoryofactivity = list('category_of_activity');
      }
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

          // this.listofTrainings = listArr;
          //this.sessionTraingId = listArr;

          // console.log("6. Final listofTrainings Array:", this.listofTrainings);

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
      this.getproposedTrainingList();
      const training = this.sessionTraingId?.find((t: any) => t.topic === this.listofTrainingsID);
      if (training) {
        this.trainingduration = training.duration_of_training;
        this.trainingID = training.training_id;
        //this.setDateRange();

      }
      this.showTrainingError = false; // Hide error immediately on selection
    }
  }
  getproposedTrainingList() {
    this.coreservices.getAllTrainingDetails(-1).subscribe({
      next: res => {
        let response = res?.Data ?? [];
        sessionStorage.setItem(
          'Approved Training Duration',
          JSON.stringify(response)
        );

        this.sessionTraingId = response;
        this.listofTrainings = response.filter((item: any) => item.status_id == 6);

        const startDate = this.formatDate(response[0].training_start_date);
        const endDate = this.formatDate(response[0].training_end_date);

        this.setDateRangeFromTraining(startDate, endDate);

      },
      error: err => console.error('Grid Data Error:', err)
    });
  }

  Addsession() {

    if (!this.validation()) {
      return;
    }

    let payload = {
      training_id: this.trainingID,
      nameSession: this.session.nameSession,
      nameResource: this.session.nameResource,
      resourceSpec: this.session.resourceSpec,
      startDate: this.session.startDate,
      endDate: this.session.endDate,
      resourceFileName: this.session.resourceFileName,
      resourceData: this.session.fileSizeBytes
    };

    this.sessionList.push(payload);
    this.savedSessionsList.push(payload);
    this.showsessionlist = true;

    console.log('Formatted Payload:', payload);

    this.snackBar.open('Session added successfully!', 'Close', { duration: 2000 });
  }
  validation(): boolean {
    if (this.session.fileSizeBytes == null || this.session.resourceFileName == null) {
      this.snackBar.open('Please upload the resource file for the session.', 'Close', { duration: 3000 });
      return false;
    }
    const maxDays = Number(this.trainingduration);

    // ✅ Get all dates from sessionList + current session
    const allDates = [
      ...this.sessionList.map(s => s.startDate),
      this.session.startDate
    ];

    // ✅ Extract only date part (ignore time)
    const uniqueDates = new Set(
      allDates.map(date => new Date(date).toISOString().split('T')[0])
    );

    console.log('Unique Dates:', uniqueDates);

    // ❌ If unique days exceed training duration
    if (uniqueDates.size > maxDays) {
      this.snackBar.open(
        `You can only select ${maxDays} unique training days`,
        'Close',
        { duration: 3000 }
      );
      return false;
    }

    return true;
  }
  saveAllSessions() {


    this.savedSessionsList = [];
    this.showsessionlist = true;
    if (this.sessionList.length === 0) {
      this.snackBar.open('No sessions to save', 'Close', { duration: 2000 });
      return;
    }
    for (let item of this.sessionList) {
      console.log('Saving session:', item);
      this.coreservices.savesessionRecord(item).subscribe({
        next: res => {
          console.log('Saved:', item);
          this.savedSessionsList.push(item);
        },
        error: err => {
          console.error('Error saving:', item, err);
        }
      });

    }

    this.snackBar.open('All sessions sent to server!', 'Close', { duration: 3000 });
  }

  saveTrainingSession() {
    if (this.datavalid == false) {
      this.saveAllSessions();
      this.SaveGeneralInfoData();
      // 1. Validation: Check if all fields are filled
      if (!this.session.nameSession ||
        !this.session.nameResource ||
        !this.session.resourceSpec ||
        !this.session.startDate ||
        !this.session.endDate ||
        !this.session.resourceFileName) {

        this.snackBar.open('Please fill all the fields before adding a session', 'Close', { duration: 3000 });
        return; // Stop execution here if validation fails
      }

      // 2. Find the Training ID from the selected topic
      const training = this.sessionTraingId?.find((t: any) => t.topic === this.listofTrainingsID);

      // 3. Prepare Payload for API
      let payload = {
        training_id: this.trainingID,
        nameSession: this.session.nameSession,
        nameResource: this.session.nameResource,
        resourceSpec: this.session.resourceSpec,
        startDate: this.session.startDate,
        endDate: this.session.endDate,
        resourceFileName: this.session.resourceFileName,
        resourceData: this.session.fileSizeBytes
      };
      if (this.participantFileName == null && this.participantFile == null) {
        this.snackBar.open('Participant file will also be uploaded with the session.', 'Close', { duration: 3000 });
        return;
      }

      // 4. Call API to Save
      this.coreservices.savesessionRecord(payload).subscribe({
        next: res => {
          this.snackBar.open('Session Saved!', 'Close', { duration: 3000 });
          this.getapprovedTraininglist();
          this.savedSessionsList.push({
            ...this.session,
            actualFileObj: this.selectedFile
          });
          this.snackBar.open('Training Session Created Successfully!', 'Close', { duration: 3000 });
          this.toggleAddNew(false);
          this.showsessionlist = true;

          // 6. Reset form for the next entry
          this.session = new sessionapproved();
          this.selectedFile = null;
        },
        error: err => console.error(err)
      });
    }
    else {
      this.snackBar.open('Please Upload the proper CSV Format!', 'Close', { duration: 3000 });
    }
  }
  SaveGeneralInfoData() {
    const updatePayload = {
      training_id: this.trainingID,
      training_start_date: this.formatDate(this.session.date),
      training_end_date: this.formatDate(this.session.endDate),
      training_venue: this.training_venue,
      training_duration_days: this.trainingduration,
    };
    this.coreservices.updateapprovaltrainingdetails(updatePayload).subscribe({
      next: res => {
        this.snackBar.open('Approved Data Saved Successfully!', 'Close', { duration: 3000 });
      },
      error: err => console.error('Update Error:', err)
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files?.length) {
      const file = input.files[0];

      // ✅ Check file type (PDF only)
      if (file.type !== 'application/pdf') {
        alert('Only PDF files are allowed');
        input.value = ''; // reset input
        return;
      }

      this.selectedFile = file;

      // File name
      this.session.resourceFileName = file.name;

      // Convert to Base64
      const reader = new FileReader();

      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        this.session.fileSizeBytes = base64String;

        console.log("Base64:", base64String);
      };

      reader.readAsDataURL(file);
    }
  }
  openLocalFile(fileObj: any) {
    if (fileObj && fileObj instanceof File) {
      const fileURL = URL.createObjectURL(fileObj);
      window.open(fileURL, '_blank');
    } else {
      this.snackBar.open("File not found locally (it might be saved on server only).", "Ok", { duration: 2000 });
    }
  }

  deleteSession(index: number) {
    if (confirm("Are you sure you want to remove this session?")) {
      this.savedSessionsList.splice(index, 1); // Remove from list

      // If list is empty, hide the table
      if (this.savedSessionsList.length === 0) {
        this.showsessionlist = false;
      }
    }
  }
  parseCSV(data: string): any[] {
    const lines = data.split('\n').map(l => l.trim()).filter(l => l);

    const headers = lines[0].split(',').map(h => h.trim());

    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());

      let obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = values[index] || '';
      });

      return obj;
    });
  }
  dateformat(date: string): string {
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = ('0' + (date.getMonth() + 1)).slice(-2);
      const day = ('0' + date.getDate()).slice(-2);
      return `${year}-${month}-${day}`;
    };
    return formatDate(new Date(date));
  }
  setDateRangeFromTraining(startDateInput: any, endDateInput: any) {

    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = ('0' + (date.getMonth() + 1)).slice(-2);
      const day = ('0' + date.getDate()).slice(-2);
      return `${year}-${month}-${day}`;
    };

    if (!startDateInput || !endDateInput) return;

    const startDate = new Date(startDateInput);
    const endDate = new Date(endDateInput);

    this.minDate = formatDate(startDate);
    this.maxDate = formatDate(endDate);

    this.session.startDate = this.minDate;
    this.session.endDate = this.maxDate;
    this.session.date = this.minDate; // Default to start date, can be changed by user


  }
  calculateDateRange() {
    this.enabletrainingDuration = true;
    if (!this.session.startDate || !this.trainingduration) return;

    const start = new Date(this.session.startDate);

    // Clone start date
    const end = new Date(start);

    // Add duration (example: 10 days)
    end.setDate(start.getDate() + (this.trainingduration - 1));

    const formatDate = (date: Date) => {
      const day = ('0' + date.getDate()).slice(-2);
      const month = ('0' + (date.getMonth() + 1)).slice(-2);
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    };

    const formattedStart = formatDate(start);
    const formattedEnd = formatDate(end);

    // Store values
    this.session.endDate = end.toISOString().split('T')[0];

    // ✅ Single field range
    this.session.date = `${formattedStart} to ${formattedEnd}`;
  }
  formatDate(date: any): string {
    if (!date) return '';

    const d = new Date(date);

    const year = d.getFullYear();
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }
}
interface TrainingParticipantDetailsCommunity {
  training_id: number;
  Name: string;
  Age: string;
  Gender: string;
  Adhar_number: string;
  Phone_number: string;
}