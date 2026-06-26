import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { TrainingMaster } from '../../../models/training-master.model';
import { ServerRequests } from '../../../services/ServerRequests';
import { DynamicField } from '../../../shared/dialog-boxes/dynamic-form.model';
import { GridColumn } from '../../../shared/Grids/grid-column.model';

@Component({
  selector: 'app-viewtrainingfeedback',
  templateUrl: './viewtrainingfeedback.component.html',
  styleUrls: ['./viewtrainingfeedback.component.css']
})

export class viewtrainingfeedback implements OnInit {
  constructor(
    public coreservices: ServerRequests,
    private fb: FormBuilder
  ) { }
  data: any[] = [];
  dialogFields: DynamicField[] = [];
  form!: FormGroup;
  isFormVisible: boolean = false;
  trainingData: TrainingMaster[] = [];
  activityType: any;
  activityTypeID: any
  partispantstype: any;
  partispantstypeID: any
  categoryofactivity: any;
  categoryofactivityID: any;
  lookupData: any;
  listofTrainings: any;
  listofTrainingsID: string = '';
  training_Id: string = '';
  columns: GridColumn[] = [
    { field: 'status', header: 'Participant Name', type: 'status' },
    { field: 'topic', header: 'Usefulness of the training' },
    { field: 'scheme_name', header: 'Knowledge of the trainers on the subject' },
    { field: 'topic_description', header: 'Quality and understanding of the training' },
    { field: 'activity_type', header: 'Appropriateness of the training materials provided' },
    { field: 'participant_type', header: 'Usefulness of the training in your day to day working in the field' },
    { field: 'level_of_participants', header: 'Loading and boarding facilities' },
    { field: 'financial_year', header: 'Need a refresher training' },
    { field: 'participants_type_id', header: 'What did you like best or found most useful in the training session?' },
    {
      field: 'mode_training', header: 'What are the most important topics/subjects you learned during the training?'
    }
  ];

  ngOnInit(): void {
    this.getLookups();
    this.GetTrainingFeedback();
  }


  selectedActivityType(event: string) {
    const selected = this.lookupData.activity_type_master?.find((c: any) => c.name === event);
    if (selected) {
      this.activityTypeID = selected.id;
    }
  }

  selectedpartispantType(event: any) {
    const selected = this.lookupData.participants_type_master?.find((c: any) => c.name === event);
    if (selected) {
      this.partispantstypeID = selected.id;
    }


  }
  selectedcatgeoryType(value: number) {
    const selected = this.lookupData.category_of_activity?.find((c: any) => c.name === value);
    if (selected) {
      this.categoryofactivityID = selected.id;
    }
    this.coreservices.getTrainingfilterFeedback(this.activityTypeID, this.categoryofactivityID).subscribe({
      next: (res: any) => {
        this.listofTrainings = res?.Data[0] ?? 'selected';
        const list2 = Array.isArray(this.listofTrainings) ? this.listofTrainings : [this.listofTrainings];
        this.listofTrainings = [...new Set(list2.map(item => item.topic))];
        sessionStorage.setItem('ViewFeedback',this.listofTrainings);
      },
      error: (err: any) => {
        console.error('Lookup Error:', err);
      }
    });;
  }
  selectedtrainingType(event: any) {

  }
  getLookups() {
    this.coreservices.getAllLookUps(1).subscribe({
      next: (res) => {
        this.lookupData = res?.Data;
        if (!this.lookupData) return;
        sessionStorage.setItem('viewtrainingfeedsbacklookup', JSON.stringify(res?.Data));
        const activitype = res.Data.activity_type_master;
        if (!activitype) return;
        const list = Array.isArray(activitype) ? activitype : [activitype];
        this.activityType = [...new Set(list.map(item => item.name))];

        const participants = res.Data.participants_type_master;

        if (!participants) return;
        const list1 = Array.isArray(participants) ? participants : [participants];
        this.partispantstype = [...new Set(list1.map(item => item.name))];

        const categoryofactivity = res.Data.category_of_activity;

        if (!categoryofactivity) return;
        const list2 = Array.isArray(categoryofactivity) ? categoryofactivity : [categoryofactivity];
        this.categoryofactivity = [...new Set(list2.map(item => item.description))];


      },
      error: (err) => {
        console.error('Lookup Error:', err);
      }
    });
  }
  GetTrainingFeedback(){
     this.coreservices.getviewtrainingfeedback(this.training_Id).subscribe({
      next: (res) => {
        this.data = res?.Data;
      },
      error: (err) => {
        console.error('Lookup Error:', err);
      }
    });
  }

  toLabel(key: string): string {
    return key.replace(/_/g, ' ').toUpperCase();
  }
}