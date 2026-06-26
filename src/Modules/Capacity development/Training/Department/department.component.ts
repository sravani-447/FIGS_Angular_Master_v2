import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { ServerRequests } from '../../../../services/ServerRequests';

@Component({
  selector: 'app-department',
  templateUrl: './department.component.html',
  styleUrls: ['./department.component.css']
})
export class DepartmentComponent implements OnInit {

  @ViewChild('activityRef') activityDropdown: any;
  @ViewChild('participantRef') participantDropdown: any;
  @ViewChild('categoryRef') categoryDropdown: any;
  @ViewChild('trainingRef') trainingDropdown: any;

  // Data Arrays (will hold Objects now, not just Strings)
  activityType: any[] = [];
  partispantstype: any[] = [];
  categoryofactivity: any[] = [];
  listofTrainings: any[] = [];

  // Models (IDs)
  activityTypeID: any;
  partispantstypeID: any;
  categoryofactivityID: any;
  listofTrainingsID: any;

  participantsList: any[] = [];

  // Sort
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    public coreservices: ServerRequests,
    private cdr: ChangeDetectorRef
  ) { }

ngOnInit(): void {
    // 1. INSTANT LOAD: Check if data is already in Session Storage
    const cachedData = sessionStorage.getItem('department_lookups');
    if (cachedData) {
      try {
        const parsedData = JSON.parse(cachedData);
        this.processLookupData(parsedData); // Render UI immediately
      } catch (e) {
        console.error('Cache parse error', e);
      }
    }

    // 2. BACKGROUND LOAD: Call API to get fresh data
    this.getLookups();
  }

  getLookups() {
    this.coreservices.getAllLookUps(1).subscribe({
      next: (res) => {
        const data = res?.Data;
        if (!data) return;

        // 3. Save to Session Storage (Caching for next time)
        sessionStorage.setItem('department_lookups', JSON.stringify(data));

        // 4. Update UI with fresh data
        this.processLookupData(data);
      },
      error: (err) => console.error(err)
    });
  }

  // Helper function to process data (Used by both Cache and API)
  processLookupData(data: any) {
    if (data.activity_type_master) {
      this.activityType = Array.isArray(data.activity_type_master)
        ? data.activity_type_master
        : [data.activity_type_master];
    }

    if (data.participants_type_master) {
      this.partispantstype = Array.isArray(data.level_of_participants)
        ? data.level_of_participants
        : [data.level_of_participants];
          this.partispantstype =  this.partispantstype.slice(0, 4);
    }

    if (data.category_of_activity) {
      this.categoryofactivity = Array.isArray(data.category_of_activity)
        ? data.category_of_activity
        : [data.category_of_activity];
    }

    // Force UI Refresh
    this.cdr.detectChanges();
  }



  toggleSpecific(activeName: string) {
    const drops = [
      { name: 'activity', ref: this.activityDropdown },
      { name: 'participant', ref: this.participantDropdown },
      { name: 'category', ref: this.categoryDropdown },
      { name: 'training', ref: this.trainingDropdown }
    ];
    drops.forEach(d => {
      if (d.name !== activeName && d.ref && d.ref.isOpen) {
        d.ref.isOpen = false;
      }
    });
  }

  closeAllDropdowns() {
    if(this.activityDropdown) this.activityDropdown.isOpen = false;
    if(this.participantDropdown) this.participantDropdown.isOpen = false;
    if(this.categoryDropdown) this.categoryDropdown.isOpen = false;
    if(this.trainingDropdown) this.trainingDropdown.isOpen = false;
  }

  // --- Selection Logic (SIMPLIFIED) ---
  // Since Dropdown emits the Value (ID), we don't need to search the array anymore!
  
  selectedActivityType(id: any) {
    this.activityTypeID = id;
    // Logic to clear subsequent dropdowns if needed
  }

  selectedpartispantType(id: any) {
    this.partispantstypeID = id;
  }

  selectedcatgeoryType(id: any) {
    this.categoryofactivityID = id;

    // Fetch Trainings if all 3 are selected
    if (this.activityTypeID && this.partispantstypeID && this.categoryofactivityID) {
      this.listofTrainings = []; 
      this.coreservices.getTrainingfilterFeedback(this.activityTypeID, this.categoryofactivityID).subscribe({
        next: (res: any) => {
          this.listofTrainings = res?.Data ?? 'selected';
          const list2 = Array.isArray(this.listofTrainings) ? this.listofTrainings : [this.listofTrainings];
          this.listofTrainings = [...new Set(list2.map(item => item.topic))];
        },
        error: (err: any) => {
          console.error('Lookup Error:', err);
        }
      });;
    }
  }

  selectedtrainingType(id: any) {
    this.listofTrainingsID = id;
    this.getParticipantsList();
  }

  getParticipantsList() {
    this.sortData('name');
    this.cdr.detectChanges();
  }

  sortData(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.participantsList.sort((a, b) => {
      let valA = a[column];
      let valB = b[column];
      if (valA == null) valA = '';
      if (valB == null) valB = '';
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  getSortIcon(column: string): string {
    if (this.sortColumn !== column) return 'fa fa-sort';
    return this.sortDirection === 'asc' ? 'fa fa-sort-up' : 'fa fa-sort-down';
  }
}
