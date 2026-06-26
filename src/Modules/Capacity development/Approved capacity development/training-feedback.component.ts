import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ServerRequests } from '../../../services/ServerRequests';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-training-feedback',
  templateUrl: './training-feedback.component.html',
  styleUrls: ['./training-feedback.component.css']
})
export class TrainingFeedbackComponent implements OnInit {

  trainingId: any;
  ptype: any = 'department'; 
  participants: any[] = []; 
  
  feedback: any = {
    participantId: '',
    qA: null, qB: null, qC: null, qD: null, qE: null, qF: null,
    refresherNeeded: '',
    commentH: '',
    commentI: '',
    commentJ: ''
  };

  constructor(
    private route: ActivatedRoute,
    private service: ServerRequests,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

ngOnInit(): void {

  console.log('Component Loaded');

  this.route.queryParams.subscribe(params => {
    console.log('Params:', params);

    this.trainingId = params['trainingid'];
    this.ptype = params['ptype'] || 'department';

    console.log('trainingId:', this.trainingId);
    console.log('ptype:', this.ptype);

    // ✅ Call API AFTER getting params
    if (this.trainingId) {
      this.loadParticipants();
    }
  });
}

  
loadParticipants() {
  console.log("Fetching participants for ID:", this.trainingId, "Type:", this.ptype);
  let obs = this.ptype.toLowerCase() === 'community' 
    ? this.service.getTrainingParticipantsCommunity(this.trainingId)
    : this.service.getTrainingParticipants(this.trainingId);

    obs.subscribe({
    next: (res: any) => {
      console.log("Full API Response Object:", res); // CLICK THE ARROW IN CONSOLE TO SEE THIS
      
      this.participants = res?.Data || []; 
      
      if (this.participants.length > 0) {
        console.log("First participant record:", this.participants[0]);
      } else {
        console.warn("API returned success but Data array is empty for ID:", this.trainingId);
      }
    },
    error: (err) => console.error("HTTP Error:", err)
  });
}


  submitFeedback() {
    if(!this.feedback.participantId) {
      this.snackBar.open("Please select a participant", "Ok", { duration: 2000 });
      return;
    }

    
    // Attempt to find participant using lowercase 'id' or uppercase 'Id' or 'ParticipantId'
    const selectedPart = this.participants.find(p => (p.id || p.Id || p.ParticipantId) == this.feedback.participantId);
  
    const payload = {
      "training_participants_id": this.feedback.participantId,
      "comments": this.feedback.commentJ,
      "imp_subjects": this.feedback.commentI,
      "best_in_training": this.feedback.commentH,
      "need_for_refresher": this.feedback.refresherNeeded,
      "name_of_participant": selectedPart ? (selectedPart.name || selectedPart.Name || selectedPart.ParticipantName) : '',
      "usefulness_of_training": this.feedback.qA,
      "quality_of_the_training": this.feedback.qC,
      "loading_boarding_facilities": this.feedback.qF,
      "appropriateness_of_the_training": this.feedback.qD,
      "knowledge_of_trainers_on_subject": this.feedback.qB,
      "usefulness_of_trainig_in_daily_life": this.feedback.qE,
      "training_id": this.trainingId
    };

    let saveObs = this.ptype.toLowerCase() === 'community' 
        ? this.service.insertFeedbackCommunity(payload)
        : this.service.insertFeedbackDepartment(payload);

    saveObs.subscribe({
      next: (res: any) => {
        this.snackBar.open("Feedback Saved Successfully!", "Close", { duration: 3000 });
        this.router.navigate(['/capacity/approved']);
      },
      error: (err: any) => this.snackBar.open("Error saving feedback", "Close", { duration: 3000 })
    });
  }

   closeForm() {
    this.router.navigate(['/capacity/approved']);
  }
}