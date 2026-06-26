import { Component, OnInit, HostListener } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ServerRequests } from '../../../../services/ServerRequests'; 

@Component({
  selector: 'app-community',
  templateUrl: './community.component.html',
  styleUrls: ['./community.component.css']
})
export class CommunityComponent implements OnInit {
  lookupData: any;
  activityTypes: any[] = [];
  levelsOfParticipants: any[] = [];
  categoriesOfActivity: any[] = [];
  trainingsList: any[] = [];

  selectedActivityId: any = null;
  selectedLevelId: any = null;
  selectedCategoryId: any = null;
  selectedTrainingId: any = null;
  
  openDropdown: string | null = null;
  participantsData: any[] = [];
  searchQuery: string = '';

  constructor(public coreservices: ServerRequests, private fb: FormBuilder) { }

  ngOnInit(): void {
    this.getLookups();
  }

  // --- NEW: Helper to get name for the dropdown label ---
  getSelectedName(list: any[], id: any): string {
    if (!list || id === null) return '';
    const found = list.find(item => item.id == id);
    return found ? (found.description || found.name) : '';
  }

  // --- NEW: Helper specifically for training topics ---
  getSelectedTrainingName(list: any[], id: any): string {
    if (!list || id === null) return '';
    const found = list.find(item => item.id == id);
    return found ? found.topic : '';
  }

  // Logic to open/close custom dropdowns
  toggleDropdown(menuName: string) {
    this.openDropdown = this.openDropdown === menuName ? null : menuName;
  }

  // Logic when an item is selected from custom dropdown
  selectItem(type: string, item: any) {
    if (type === 'activity') {
      this.selectedActivityId = item.id;
      this.onActivityChange(item.id);
    } else if (type === 'level') {
      this.selectedLevelId = item.id;
      this.onLevelChange(item.id);
    } else if (type === 'category') {
      this.selectedCategoryId = item.id;
      this.onCategoryChange(item.id);
    } else if (type === 'training') {
      this.selectedTrainingId = item.id;
      this.onTrainingChange(item.id);
    }
    this.openDropdown = null; // Close after selection
  }

  // --- NEW: Global listener to close dropdown when clicking outside ---
  @HostListener('document:click', ['$event'])
  onClickOutside(event: any) {
    if (!event.target.closest('.dropdown-wrapper')) {
      this.openDropdown = null;
    }
  }

  getLookups() {
    this.coreservices.getAllLookUps(1).subscribe({
      next: (res: any) => {
        this.lookupData = res?.Data;
        if (this.lookupData) {
          this.activityTypes = this.lookupData.activity_type_master || [];
          this.levelsOfParticipants =this.lookupData.level_of_participants.slice(-3) || [];
          this.categoriesOfActivity = this.lookupData.category_of_activity || [];
        }
      },
      error: (err: any) => console.error(err)
    });
  }

  // Update trainings when filters change
  onActivityChange(id: any) { 
    this.selectedActivityId = id; 
    this.fetchTrainings(); 
  }

  onLevelChange(id: any) { 
    this.selectedLevelId = id; 
    this.fetchTrainings(); 
  }

  onCategoryChange(id: any) { 
    this.selectedCategoryId = id; 
    this.fetchTrainings(); 
  }

  fetchTrainings() {
    if (this.selectedActivityId && this.selectedCategoryId) {
      this.coreservices.getTrainingfilterFeedback(this.selectedActivityId, this.selectedCategoryId).subscribe({
        next: (res: any) => { 
          this.trainingsList = res?.Data || []; 
        },
        error: (err: any) => console.error(err)
      });
    }
  }

  onTrainingChange(id: any) { 
    this.selectedTrainingId = id; 
    // Add logic here to fetch Participants List if needed
  }
}