import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TrainingMaster } from '../../../models/training-master.model';
import { ServerRequests } from '../../../services/ServerRequests';
import { DynamicField } from '../../../shared/dialog-boxes/dynamic-form.model';
import { GridColumn } from '../../../shared/Grids/grid-column.model';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-proposed-capacity',
  templateUrl: './proposed-capacity.component.html',
  styleUrls: ['./proposed-capacity.component.css']
})
export class ProposedCapacityComponent implements OnInit {

  data: any[] = [];
  dialogFields: DynamicField[] = [];
  form!: FormGroup;
  isFormVisible: boolean = false;
  trainingData: TrainingMaster[] = [];

  columns: GridColumn[] = [
    {
      field: 'actions',
      header: 'Actions',
      type: 'actions',
      actions: [
        {
          label: 'View',
          action: 'proposed action view',
          tooltip: 'View',
          icon: "",
          visible: (row: any) => true
        }
      ]
    },
    { field: "status_name", header: "status" },
    // { field: 'training_id', header: "Training ID" },
    { field: 'topic', header: 'Group' },
    { field: 'scheme_name', header: 'Scheme' },
    { field: 'topic_description', header: 'Topic' },
    { field: 'activity_type_name', header: 'Type' },
    { field: 'participants_type_name', header: 'Participant Type' },
    { field: 'level_of_participants_name', header: 'Level' },
    { field: 'financial_year', header: 'Financial Year' },
    { field: 'participants_type_id', header: 'Batches' },
    { field: 'mode_of_training_name', header: 'Mode' },
    { field: 'duration_of_training', header: 'Duration of Training' },
    { field: 'district', header: 'District' },
    { field: 'sb_division', header: 'Subdivision' },
    { field: 'range', header: 'Range' },

    // { field: 'training_start_date', header: 'start date', type: 'date' },
    // { field: 'training_end_date', header: 'end date', type: 'date' },
    { field: 'fundrequired', header: 'Fund Required' },
  ];
  lookupStore: any;
  $event: any;
  userid: string = '';
  userDesignation: any;
  showprint: boolean = false;
  viewvisible: boolean = false;
  showadd: boolean = false;
  rejectbox: boolean = false;
  GridData: any;
  dfoapproval: any = '';
  sfoapproval: any = '';
  rolename: any = '';
  directorsapproval: any = '';
  constructor(
    public coreservices: ServerRequests,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
  ) {
    const session = sessionStorage.getItem("Session");
    if (session) {
      const sessionDetails = JSON.parse(session);
      this.userid = sessionDetails.Data[0].user_id;
      this.dfoapproval = sessionStorage.getItem("DFOApproval");
      this.sfoapproval = sessionStorage.getItem("SFOApproval");
      this.directorsapproval = sessionStorage.getItem("Directors");
      this.userDesignation = sessionDetails.Data[0].designation_name;
      this.rolename = sessionDetails.Data[0].role_name;
      const officerRoles = [
        'RANGE_OFFICER',
        'SUB_DISTRICT_OFFICER',
        'DISTRICT_OFFICER',
        'PROGRAM_MANAGER'
      ];

      if (officerRoles.includes(this.userDesignation?.toUpperCase())) {
        this.showadd = true;
      }
    }
  }

  ngOnInit(): void {
    this.getLookups();
    this.gethierarchyList(this.userDesignation);
  }

  getTrainingList() {
    let statusId = -1;
    this.coreservices.getAllTrainingDetails(statusId).subscribe({
      next: res => {
        console.log('API Response:', res);
        const rawData = res?.Data ?? [];
        this.data = rawData.map((item: any) => ({
          ...item,
          proposedCapacityModule: true,
          // 🔥 ID → NAME MAPPING
          scheme_name: this.getName('scheme_master', item.scheme_id),
          activity_type_name: this.getName('activity_type_master', item.activity_type_id),
          participants_type_name: this.getName('participants_type_master', item.participants_type_id),
          mode_of_training_name: this.getName('mode_of_training', item.mode_of_training_id),

          // 🔥 MULTI VALUE
          level_of_participants_name: this.getMultiNames(
            'level_of_participants',
            item.level_of_participants
          ),

          // 🔥 DATE FORMAT
          training_start_date: this.formatDate(item.training_start_date),
          training_end_date: this.formatDate(item.training_end_date),

          // 🔥 STATUS FIX
          status_name: ['4', '5', '6'].includes(item.status_id)
            ? 'Rejected'
            : 'Applied'
        }));
        console.log('Final Data:', this.data);
        sessionStorage.setItem('ProposedTrainingData', JSON.stringify(this.data));
      },
      error: err => console.error('Grid Data Error:', err)
    });
  }

  gethierarchyList(hierarchy: string) {
    this.coreservices.GetAllDirectorsHierachyDetails(hierarchy).subscribe({
      next: res => {
        console.log('API Response:', res);
        const rawData = res?.Data ?? [];

        this.data = rawData.map((item: any) => ({
          ...item,
          proposedCapacityModule: true,
          // 🔥 ID → NAME MAPPING
          scheme_name: this.getName('scheme_master', item.scheme_id),
          activity_type_name: this.getName('activity_type_master', item.activity_type_id),
          participants_type_name: this.getName('participants_type_master', item.participants_type_id),
          mode_of_training_name: this.getName('mode_of_training', item.mode_of_training_id),

          // 🔥 MULTI VALUE
          level_of_participants_name: this.getMultiNames(
            'level_of_participants',
            item.level_of_participants
          ),

          // 🔥 DATE FORMAT
          training_start_date: this.formatDate(item.training_start_date),
          training_end_date: this.formatDate(item.training_end_date),

          // 🔥 STATUS FIX
          status_name: ['4', '5', '6'].includes(item.status_id)
            ? 'Rejected'
            : 'Applied'
        }));

        console.log('Final Data:', this.data);
        sessionStorage.setItem('ProposedTrainingData', JSON.stringify(this.data));
      },
      error: err => console.error('Grid Data Error:', err)
    });
  }
  // ✅ Single value mapping
  getName(lookupKey: string, value: any): string {
    if (!this.lookupStore || !this.lookupStore[lookupKey]) return value;

    const item = this.lookupStore[lookupKey].find(
      (x: any) => x.id == value || x.value == value || x.code == value
    );

    return item
      ? item.scheme_name || item.name || item.text || item.description
      : value;
  }

  // ✅ Multi value mapping (for level_of_participants)
  getMultiNames(lookupKey: string, values: any): string {
    if (!values) return '';

    let parsedValues = values;

    // if string like "1,2"
    if (typeof values === 'string') {
      parsedValues = values.split(',');
    }

    if (!Array.isArray(parsedValues)) {
      parsedValues = [parsedValues];
    }

    return parsedValues
      .map((val: any) => this.getName(lookupKey, val))
      .join(', ');
  }



  handleStatusUpdate(payload: any) {
    console.log(payload);
    const storedData = sessionStorage.getItem('ProposedTrainingData');
    if (storedData) {
      const gridData = JSON.parse(storedData);
      const item = gridData.find((x: any) => x.training_id === payload.training_id);

      if (item) {
        const today = new Date();
        const startDate = new Date(today);
        const endDate = new Date(today);
        endDate.setDate(endDate.getDate() + Number(item.duration_of_training));

        const updatePayload = {
          training_id: item.training_id,
          training_start_date: this.formatDate(startDate),
          training_end_date: this.formatDate(endDate),
          training_venue: item.venue,
          training_duration_days: item.duration_of_training
        };
        this.coreservices.updateapprovaltrainingdetails(updatePayload).subscribe({
          next: res => {
            this.getTrainingList();
            this.snackBar.open('Approved Data Saved Successfully!', 'Close', { duration: 3000 });
          },
          error: err => console.error('Update Error:', err)
        });

      } else {
        console.warn('No matching training found in sessionStorage');
      }
    }
    if (payload.status === "YES") {
      const acceptPayload = {
        training_id: payload.training_id,
        user_id: this.userid,
        status: 1,
      };
      if (this.userDesignation == "SUB_DISTRICT_OFFICER") {
        const acceptPayload = {
          training_id: payload.training_id,
          user_id: this.userid,
          status: 4,
          sdfo: true
        };
        this.coreservices.insertProposedCapacityApproveorRejectDetails(acceptPayload).subscribe({
          next: res => {
            this.gethierarchyList("SUB_DISTRICT_OFFICER");
            this.getTrainingList();
          },
          error: err => console.error('Approval Error:', err)
        });
      }
      else if (this.userDesignation == "DISTRICT_OFFICER") {
        const acceptPayload = {
          training_id: payload.training_id,
          user_id: this.userid,
          status: 5,
          dfo: true
        };
        this.coreservices.insertProposedCapacityApproveorRejectDetails(acceptPayload).subscribe({
          next: res => {
            sessionStorage.setItem("DFOApproval", "true");
            setInterval(() => {
              this.gethierarchyList("DISTRICT_OFFICER");
              this.getTrainingList();
            }, 10000);

          },
          error: err => console.error('Approval Error:', err)
        });
      }
      else if (this.userDesignation == "DIRECTOR_M_AND_E") {
        const acceptPayload = {
          training_id: payload.training_id,
          user_id: this.userid,
          status: 6,
          directors: true
        };
        this.coreservices.insertProposedCapacityApproveorRejectDetails(acceptPayload).subscribe({
          next: res => {
            this.gethierarchyList("DIRECTOR_M_AND_E");
            this.getTrainingList();
          },
          error: err => console.error('Approval Error:', err)
        });
      }
      else if (this.userDesignation == "DIRECTOR_LIVELIHOOD_COORDINATOR") {
        const acceptPayload = {
          training_id: payload.training_id,
          user_id: this.userid,
          status: 6,
          directors: true
        };
        this.coreservices.insertProposedCapacityApproveorRejectDetails(acceptPayload).subscribe({
          next: res => {
            this.gethierarchyList("DIRECTOR_LIVELIHOOD_COORDINATOR");
            this.getTrainingList();
          },
          error: err => console.error('Approval Error:', err)
        });
      }
      else {
        this.coreservices.insertProposedCapacityApproveorRejectDetails(acceptPayload).subscribe({
          next: res => {

            this.getTrainingList();

          },
          error: err => console.error('Approval Error:', err)
        });
      }

    } else if (payload.status === "NO") {
      const rejectPayload = {
        training_id: payload.training_id,
        user_id: this.userid,
        status: 3,
        comment_reject: payload.rejectreason,
      };

      this.coreservices.insertProposedCapacityApproveorRejectDetails(rejectPayload).subscribe({
        next: res => {
          this.getTrainingList();
          this.snackBar.open('Rejected Successfully!', 'Close', { duration: 3000 });
        },
        error: err => console.error('Reject Error:', err)
      });
    }

  }
  getLookups() {
    this.coreservices.getAllLookUps(1).subscribe({
      next: (res) => {

        const lookupData = res?.Data;
        if (!lookupData) return;
        this.gethierarchyList(this.userDesignation);
        this.lookupStore = lookupData;
        console.log("All lookups", this.lookupStore);

        // ================= API FIELDS =================
        const orderedKeys = [
          'scheme_master',
          'activity_type_master',
          'participants_type_master',
          'level_of_participants',
          'category_of_activity',
          'mode_of_training'
        ];

        const apiFields: DynamicField[] = orderedKeys
          .filter(key => lookupData[key])
          .map(key => ({
            name: key,
            label: this.toLabel(key),
            type: key === 'level_of_participants' ? 'multiselect' : 'select',
            multiple: key === 'level_of_participants', // ✅ multiselect only here
            options: lookupData[key].map((item: any) => ({
              name:
                item.scheme_name ||
                item.name ||
                item.text ||
                item.description ||
                '',
              value: item.id || item.value || item.code
            }))
          }));


        // ================= GEO FROM SESSION =================
        const session = sessionStorage.getItem("Session");

        let districtlist: DynamicField = {
          name: 'district',
          label: 'District',
          type: 'select',
          options: []
        };

        let subdivisionlist: DynamicField = {
          name: 'subdivision',
          label: 'Subdivision',
          type: 'select',
          options: []
        };

        let rangelist: DynamicField = {
          name: 'range',
          label: 'Range',
          type: 'select',
          options: []
        };

        if (session) {
          const parsed = JSON.parse(session);
          const geo = parsed?.Data[0]?.jurisdiction_details
          var data = JSON.parse(geo);

          // ✅ District
          districtlist.options = (data.Jurisdiction.district || []).map((d: string) => ({
            name: d,
            value: d
          }));

          // ✅ Subdivision
          subdivisionlist.options = (data.Jurisdiction.sub_division || []).map((s: string) => ({
            name: s,
            value: s
          }));

          // ✅ Range
          rangelist.options = (data.Jurisdiction.range || []).map((r: string) => ({
            name: r,
            value: r
          }));
        }


        // ================= FINANCIAL YEAR =================
        const currentYear = new Date().getFullYear();

        const financialYearField: DynamicField = {
          name: 'financial_year',
          label: 'Financial Year',
          type: 'select',
          options: this.generateFinancialYears(currentYear, 5)
        };


        // ================= MANUAL FIELDS =================
        const manualFields: DynamicField[] = [
          financialYearField,
          districtlist,
          subdivisionlist,
          rangelist,
          { name: 'board_topic', label: 'Group Name', type: 'text' },
          { name: 'topic_description', label: 'Topic Description', type: 'textarea' },
          { name: 'trainees_count', label: 'No. of trainees expected', type: 'number' },
          { name: 'duration', label: 'Duration', type: 'number' },
          { name: 'batches', label: 'Batches', type: 'number' },
          { name: 'FundRequired', label: 'Fund Required', type: 'number' }

        ];


        // ================= FINAL MERGE =================
        this.dialogFields = [
          ...apiFields,
          ...manualFields
        ];

        this.initDynamicForm();
      },

      error: (err) => {
        console.error('Lookup Error:', err);
      }
    });
  }
  participantsChange(event: any) {
    const selectedValue = event?.target?.value || event;

    // Handle both cases (object or direct value)
    const participantTypeId =
      typeof selectedValue === 'object' ? selectedValue.value : selectedValue;

    console.log('Participants Type Selected:', participantTypeId);

    const levelField = this.dialogFields.find(
      (f: any) => f.name === 'level_of_participants'
    );

    if (levelField && this.lookupStore?.level_of_participants) {

      const filteredOptions = this.lookupStore.level_of_participants
        .filter((item: any) => item.participant_type_id == participantTypeId)
        .map((item: any) => ({
          name: item.name || item.description,
          value: item.id
        }));

      this.updateFieldOptions('level_of_participants', filteredOptions);
    }
  }
  updateFieldOptions(fieldName: string, options: any[]) {
    const field = this.dialogFields.find(f => f.name === fieldName);
    if (field && Array.isArray(options) && Array.length > 0) {
      field.options = options;
    }
  }


  initDynamicForm() {
    const formGroupConfig: any = {};

    this.dialogFields.forEach(field => {
      formGroupConfig[field.name] = [
        field.multiple ? [] : '',   // ✅ key fix
        Validators.required
      ];
    });

    this.form = this.fb.group(formGroupConfig);
  }

  submitForm() {
    if (this.form.valid) {
      console.log('Form Data:', this.form.value);
    } else {
      this.form.markAllAsTouched();
    }
  }

  toggleForm() {
    this.isFormVisible = !this.isFormVisible;
  }

  toLabel(key: string): string {
    return key
      .replace('_master', '')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  }

  SaveRecord(gridData: any) {

    console.log('Data received from Grid:', gridData);
    this.GridData = gridData;
    const data = sessionStorage.getItem('Session');
    if (!data) return;
    const parsedData = JSON.parse(data);
    const userId = parsedData.Data[0].user_id;

    // 🔹 Map grid data → API model
    const payload = {
      topic: gridData.topic_description,
      activity_type_id: Number(gridData.activity_type_master),
      participants_type_id: Number(gridData.participants_type_master),
      level_of_participants: Array.isArray(gridData.level_of_participants)
        ? gridData.level_of_participants.join(',')
        : gridData.level_of_participants,
      scheme_id: Number(gridData.scheme_master),
      no_of_batch: Number(gridData.batches),
      expected_duration_of_training: Number(gridData.duration),
      no_of_expected_trainees: Number(gridData.trainees_count),
      mode_of_training_id: Number(gridData.mode_of_training),
      category_of_activity_id: Number(gridData.category_of_activity),
      topic_description: gridData.topic_description,
      financial_year: gridData.financial_year,
      createdby: Number(userId),
      district: gridData.district,
      subdivision: gridData.subdivision,
      range: gridData.range,
      board_topic: gridData.board_topic,
      fundrequired: gridData.FundRequired,
      training_start_date: gridData.start_date,
      training_end_date: gridData.end_date,
      status_id: 1
    };
    console.log('Payload to be sent to API:', payload);
    this.coreservices.insertproposedtrainingdetails(payload)
      .subscribe({
        next: (res) => {
          console.log('Saved successfully', res);
          this.getTrainingList();
          this.gethierarchyList(this.userDesignation);
        },
        error: (err) => {
          console.error('Save failed', err);
        }
      });
  }
  onGridAction(event: { action: string; row: any }) {
    const row = event.row;
    switch (event.action) {
    }
  }


  generateFinancialYears(startYear: number, range: number = 5) {
    const years = [];

    for (let i = 0; i < range; i++) {
      const fromYear = startYear + i;
      const toYear = fromYear + 1;

      const fy = `${fromYear}-${toYear}`;
      years.push({ name: fy, value: fy });
    }

    return years;
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
