import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ServerRequests } from '../../../services/ServerRequests';
import { GridColumn } from '../../../shared/Grids/grid-column.model'; // Adjust path as needed
import * as L from 'leaflet';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomGridComponent } from "../../../shared/Grids/custom-grid.component";


@Component({
  selector: 'app-meeting',
  templateUrl: './meeting.component.html',
  styleUrls: ['./meeting.component.css']
})
export class MeetingComponent implements OnInit {

  @ViewChild('grid') gridComponent!: CustomGridComponent;

  // Data for Grid
  gridData: any[] = [];
  isLoading: boolean = true;
  hiddenFields: string[] = [];

  // Session Data
  userDesignation: string = '';
  userId: string = '';
  isMapModalOpen: boolean = false;
  // Map
  private map!: L.Map;
  private markers: L.LayerGroup = new L.LayerGroup();

  // Modals
  isUpdateModalOpen: boolean = false;
  isRejectModalOpen: boolean = false;
  isImageModalOpen: boolean = false;

  // Selected Data
  selectedMeeting: any = {};
  selectedImageSrc: string = '';
  rejectComment: string = '';

  private primaryFields = [
    'bo_status',
    'ro_status',
    'fo_status',
    'user_name',
    'createdby',
    'actions',
    'is_loan_sanctioned',
    'loan_id',
    'createdat',
    'fo_status_display',
    'bo_status_display',
    'ro_status_display',
    'date_of_meeting'
  ];



  columns: GridColumn[] = [
    {
      field: 'actions',
      header: 'Actions',
      type: 'actions',
      actions: [
        {
          label: 'view',
          action: 'view',
          tooltip: 'view',
          icon: "",
        }
      ]
    },
    { field: 'fo_status_display', header: 'Status (FO)' },
    { field: 'bo_status_display', header: 'Status (BO)' },
    { field: 'ro_status_display', header: 'Status (RO)' },
    { field: 'name_of_committee', header: 'Committee Name' },
    { field: 'date_of_meeting', header: 'Meeting Date' },

    { field: 'attendance', header: 'Attendees' },

    { field: 'is_loan_sanctioned', header: 'Loan Sanctioned' },
    { field: 'loan_id', header: 'Loan ID' },
    { field: 'amount_disbursed', header: 'Amount Disbursed' },
    { field: 'tenure_of_loan', header: 'Loan Tenure' },
    { field: 'rate_of_interest', header: 'Interest Rate' },

    { field: 'sanction_to_shg_name', header: 'SHG Name' },
    { field: 'sel_mode', header: 'Committee Type' },

    { field: 'comments', header: 'Comments' },

    { field: 'user_name', header: 'User Name' },
    { field: 'createdat', header: 'Creation Date' },

    // --- IMAGES ---
    {
      header: 'Img 1',
      field: 'image1_name',
      type: 'actions',
      actions: [
        {
          icon: 'fa fa-picture-o',
          action: 'view_image1',
          tooltip: 'View Image 1',
        }
      ]
    },
    {
      header: 'Img 2',
      field: 'image2_name',
      type: 'actions',
      actions: [
        {
          icon: 'fa fa-image',
          action: 'view_image2',
          tooltip: 'View Image 2',
        }
      ]
    },

    { field: 'ro_rej_comments', header: 'RO Reject Reason' },
    { field: 'bo_rej_comments', header: 'BO Reject Reason' },
    { field: 'fo_rej_comments', header: 'FO Reject Reason' },

    // --- MAP ---
    {
      header: 'Map',
      field: 'map_locate',
      type: 'actions',
      actions: [
        {
          icon: 'fa fa-map-marker',
          action: 'view_map',
          tooltip: 'Locate on Map',
        }
      ]
    }
  ];
  data: any;



  constructor(private http: HttpClient, private coreservices: ServerRequests, private snackBar: MatSnackBar,
  ) {
    const session = sessionStorage.getItem("Session");
    if (session) {
      const sessionDetails = JSON.parse(session);
      this.userDesignation = sessionDetails.Data[0].designation_name;
      this.userId = sessionDetails.Data[0].user_id;
    }
  }

  generateHiddenFields() {
    this.hiddenFields = this.columns
      .filter(col => !this.primaryFields.includes(col.field))
      .map(col => col.field);
    this.loadData();
    console.log('Automatically hidden fields:', this.hiddenFields);
  }





  ngOnInit(): void {
    this.loadData()
    this.generateHiddenFields();

    setTimeout(() => { this.initMap(); }, 100);
  }

  loadData() {
    this.coreservices.getMeetingList().subscribe({
      next: (res: any) => {
        const rawData = res.Data || res;

        this.gridData = rawData.map((item: any) => ({
          ...item,
          jfmcmeeting:true,
          Main_module: "JFMC",
          Sub_module: "JFMC",
          child_Module: "Meeting",    

          createdat: item.createdat
            ? item.createdat.split('T')[0]
            : '',

          date_of_meeting: item.date_of_meeting
            ? item.date_of_meeting.split('T')[0]
            : '',

          fo_status_display: this.getStatusLabel(item.fo_status, item.fo_rej_comments),
          bo_status_display: this.getStatusLabel(item.bo_status, item.bo_rej_comments),
          ro_status_display: this.getStatusLabel(item.ro_status, item.ro_rej_comments),
          bo_status: item.bo_status === 'YES' ? 'Approved' : 'Pending',
          ro_status: item.ro_status === 'YES' ? 'Approved' : 'Pending',
          fo_status: item.fo_status === 'YES' ? 'Approved' : 'Pending'
        }));

        this.isLoading = false;
        setTimeout(() => { this.updateMapMarkers(); }, 500);
      },
      error: (err: any) => {
        console.error("Error loading data", err);
        this.isLoading = false;
      }
    });
  }

  getStatusLabel(status: string, rejComment: string): string {
    if (status === 'YES') return 'Approved';
    if (rejComment && rejComment !== 'null' && String(rejComment).trim() !== '') {
      return 'Rejected';
    }
    return 'Pending';
  }

  // --- GRID ACTION HANDLER ---
  onGridAction(event: any) {
    const action = event.action;
    const row = event.row || event.data; // Depending on your grid structure

    if (action === 'view_map' || action === 'locate') {
      this.openLocationOnMap(row);
    }

    switch (action) {
      case 'edit':
        this.openUpdateModal(row);
        break;
      case 'send_approval':
        this.sendForApproval(row);
        break;
      case 'approve':
        this.sendForApproval(row);
        break;
      case 'reject':
        this.openRejectModal(row);
        break;
      case 'view_map':
        this.zoomToMap(row);
        break;
      case 'view_image1':
        if (row.image1_name) this.openImageModal(row.image1_name, row.id);
        else
          this.snackBar.open("No Image 1 Available", 'Close', { duration: 3000 });
        break;
      case 'view_image2':
        if (row.image2_name) this.openImageModal(row.image2_name, row.id);
        this.snackBar.open("No Image 2 Available", 'Close', { duration: 3000 });
        break;
    }
  }

  // --- MAP LOGIC ---
  initMap(): void {
    if (this.map) {
      this.map.remove();
    }

    const iconDefault = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    L.Marker.prototype.options.icon = iconDefault;

    this.map = L.map('map', { zoomControl: false }).setView([23.853275, 91.258282], 9);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    L.control.zoom({ position: 'topright' }).addTo(this.map);
    this.markers.addTo(this.map);
  }

  openMapModal(data: any) {
    this.isMapModalOpen = true;

    // Use a small timeout to ensure the modal div is rendered before loading the map
    setTimeout(() => {
      this.initializeModalMap(data.latitude, data.longitude);
    }, 100);
  }
  initializeModalMap(lat: number, lng: number) {
    // Basic Leaflet example - adjust based on your map library
    const map = L.map('modal-map').setView([lat, lng], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    L.marker([lat, lng]).addTo(map);

    // CRITICAL: This fixes gray boxes/hidden tiles when maps open in modals
    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }
  closeMapModal() {
    this.isMapModalOpen = false;
  }
  updateMapMarkers() {
    if (!this.map) return;
    this.markers.clearLayers();

    this.gridData.forEach(item => {
      if (item.lat && item.lng) {
        const lat = parseFloat(item.lat);
        const lng = parseFloat(item.lng);

        if (!isNaN(lat) && !isNaN(lng)) {
          const marker = L.marker([lat, lng]);

          let popupContent = `<div style="max-height: 250px; overflow-y: auto; font-size: 13px; line-height: 1.5;">`;
          for (const key in item) {
            if (item.hasOwnProperty(key) && item[key] !== null && item[key] !== '' &&
              key !== 'bo_status_display' && key !== 'ro_status_display' && key !== 'created_date_formatted' && key !== 'ro_rej_comments') {
              popupContent += `<b>${key}:</b> ${item[key]}<br>`;
            }
          }
          popupContent += `</div>`;

          marker.bindPopup(popupContent);
          this.markers.addLayer(marker);
        }
      }
    });

    if (this.markers.getLayers().length > 0) {
      const group = L.featureGroup(this.markers.getLayers() as L.Layer[]);
      this.map.fitBounds(group.getBounds(), { padding: [50, 50] });
    }
  }

  private getPopupHTML(row: any): string {
    // List fields you DON'T want to show in the map popup
    const excludedFields = ['sno', 'id', 'lat', 'lng', 'actions', 'img1', 'img2', 'map_locate', 'createdby'];

    let html = `<div style="max-height: 200px; min-width: 200px; overflow-y: auto; font-family: 'Poppins', sans-serif;">`;
    html += `<h4 style="margin: 0 0 8px 0; color: #f97316; border-bottom: 1px solid #eee; padding-bottom: 5px;">Meeting Details</h4>`;

    Object.keys(row).forEach(key => {
      // Only show fields that have values and are not excluded
      if (!excludedFields.includes(key) && row[key] !== null && row[key] !== undefined && row[key] !== '') {
        const label = key.replace(/_/g, ' ').toUpperCase();
        html += `<div style="margin-bottom: 5px; font-size: 12px;">
                        <strong style="color: #333;">${label}:</strong> 
                        <span style="color: #666;">${row[key]}</span>
                     </div>`;
      }
    });

    html += `</div>`;
    return html;
  }

  openLocationOnMap(row: any) {
    // 1. Show the popup container
    this.isMapModalOpen = true;

    // 2. Wait for the HTML div to be ready, then init map
    setTimeout(() => {
      this.initializePopupMap(row);
    }, 300);
  }

  initializePopupMap(row: any) {
    const lat = Number(row.lat);
    const lng = Number(row.lng);

    if (!lat || !lng) {
      this.snackBar.open('GPS Coordinates not found for this record', 'Close', { duration: 3000 });
      this.isMapModalOpen = false;
      return;
    }

    // 1. Create Map
    const map = L.map('modal-map-container').setView([lat, lng], 16);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(map);

    // 2. Add Marker + Bind the Detail Popup + Open it immediately
    L.marker([lat, lng])
      .addTo(map)
      .bindPopup(this.getPopupHTML(row)) // This generates the details box
      .openPopup();                     // This makes it show up without clicking

    // 3. Force refresh to fix layout bugs
    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }

  zoomToMap(item: any) {
    if (this.map && item.lat && item.lng) {
      this.map.flyTo([item.lat, item.lng], 16);
      document.getElementById('map-section')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      this.snackBar.open('Location coordinates not available.', 'Close', { duration: 3000 });
    }
  }

  openUpdateModal(item: any) {
    this.selectedMeeting = { ...item };
    this.isUpdateModalOpen = true;
  }

  submitUpdate() {
    const payload = {
      Id: this.selectedMeeting.id,
      attendance: this.selectedMeeting.attendance,
      amount_disbursed: this.selectedMeeting.amount_disbursed,
      rate_of_interest: this.selectedMeeting.rate_of_interest,
      tenure_of_loan: this.selectedMeeting.tenure_of_loan,
      comments: this.selectedMeeting.comments
    };

    this.coreservices.updateMeetingDetails(payload).subscribe({
      next: (res: any) => {
        // Check for success status based on legacy response structure
        if (res.status === true || res.message === 'Success') {
          this.isUpdateModalOpen = false;
          this.snackBar.open("Updated Successfully", 'Close', { duration: 3000 });


          // 2. Refresh data
          this.gridData = []; // Clear current grid to force UI refresh
          this.isLoading = true;
          this.loadData();
        } else {
          this.snackBar.open("Update failed: " + (res.message || 'Unknown error!', 'Close', { duration: 3000 }));
        }
      },
      error: (err: any) => {
        console.error("Error updating meeting:", err);
        this.snackBar.open("Failed to update. Please try again.", 'Close', { duration: 3000 });

      }
    });
  }

  openRejectModal(item: any) {
    this.selectedMeeting = item;
    this.rejectComment = '';
    this.isRejectModalOpen = true;
  }

  submitReject() {
    if (!this.rejectComment) {
      this.snackBar.open("Please enter a rejection reason.", 'Close', { duration: 3000 });
      return;
    }

    const id = this.selectedMeeting.id;
    let frm = '';

    if (this.userDesignation === 'FIELD_OFFICER') frm = 'FO';
    else if (this.userDesignation === 'BEAT_OFFICER') frm = 'BO';
    else if (this.userDesignation === 'RANGE_OFFICER') frm = 'RO';
    else frm = 'RO';

    console.log("Sending Reject Payload:", frm, this.rejectComment, id);

    this.coreservices.rejectMeeting(frm, this.rejectComment, id).subscribe({
      next: (res: any) => {
        // 1. Check for success (Handles cases where backend returns 200 OK but failed internally)
        if (res && (res.status === false || res.message === 'Error')) {
          this.snackBar.open("Rejection failed: " + res.message || "Unknown Error !", 'Close', { duration: 3000 });
          this.snackBar.open("Rejection failed: " + (res.message || 'Unknown error'))
          this.loadData();
          return;
        }

        this.isRejectModalOpen = false;
        this.snackBar.open("Rejected Successfully", 'Close', { duration: 3000 });



        this.isLoading = true;

        setTimeout(() => {
          this.loadData();
        }, 500);
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open("Error rejecting item.", 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  getRejectionReason(item: any): string {
    const comments = [
      item.ro_rej_comments,
      item.bo_rej_comments,
      item.fo_rej_comments,
      item.rej_comments,
      item.ro_rej_comments
    ];


    for (const comment of comments) {
      if (comment && comment !== 'null' && String(comment).trim() !== '') {
        return comment;
      }
    }
    return '-';
  }


  sendForApproval(item: any) {


    const id = item.id;

    if (this.userDesignation === 'RANGE_OFFICER') {

      this.coreservices.approveMeetingByRO(id).subscribe({
        next: (res: any) => {
          this.snackBar.open("Approved Successfully", 'Close', { duration: 3000 });

          this.loadData();
        },
        error: (err) =>
          this.snackBar.open("Error approving: " + err.message || "Unknown Error !", 'Close', { duration: 3000 }),

      });
    }
    else {
      let frm = '';
      let to = '';

      if (this.userDesignation === 'FIELD_OFFICER') {
        frm = 'FO';
        to = 'BO';
      } else {
        frm = 'BO';
        to = 'RO';
      }

      this.coreservices.sendMeetingForApproval(frm, to, id)

        .subscribe({
          next: (res: any) => {
            this.snackBar.open("Sent for Approval Successfully", 'Close', { duration: 3000 });
            this.loadData();
          },
          error: (err) => this.snackBar.open("Error sending for approval: " + err.message || "Unknown Error !", 'Close', { duration: 3000 }),

        });
    }
  }

  openImageModal(imageName: string, id: number) {
    this.selectedImageSrc = 'assets/images/Loading.gif';
    this.isImageModalOpen = true;

    this.coreservices.getMeetingImageById(id.toString(), imageName).subscribe({
      next: (res: any) => {
        const value = res?.Data?.[0]?.[0]?.Value;
        this.selectedImageSrc = value
          ? 'data:image/png;base64,' + value
          : 'assets/images/Image_not_available.png';
      },
      error: () => {
        this.selectedImageSrc = 'assets/images/Image_not_available.png';
      }
    });
  }

  isActionVisible(action: string, row: any): boolean {
    const isPending = (val: any) => val === null || val === undefined || val === 'null' || val === '';

    switch (action) {
      case 'edit':
      case 'send_approval':
      case 'approve':
      case 'reject':
      case 'view_map':
        return true;

      case 'view_image1':
        return !isPending(row.image1_name);

      case 'view_image2':
        return !isPending(row.image2_name);

      default:
        return false;
    }
  }
  handleStatusUpdate(payload: any) {

    console.log(payload);

    let row = payload.Data && payload.Data.length ? payload.Data[0] : {};

    let Payload = {
      Id: payload.id || row.id || 0,
      attendance: payload.attendance,
      comments: payload.comments,
      status: payload.status,
      rejectreason: payload.rejectreason
    };

    console.log("Final Payload => ", Payload);


    // ---------------- SAVE / UPDATE ----------------
    if (Payload.comments != undefined && Payload.status != "NO" && Payload.status != "YES") {

      this.coreservices.updateMeetingDetails(Payload).subscribe({
        next: (res: any) => {

          this.loadData();

          this.snackBar.open('Data Saved Successfully!', 'Close', {
            duration: 3000
          });

        },
        error: (err) => {
          console.error('Error saving', err);
        }
      });

    }


    // ---------------- REJECT ----------------
    else if (Payload.status == "NO" && this.userDesignation == "BEAT_OFFICER") {

      this.coreservices.rejectMeeting("BO", Payload.rejectreason, Payload.Id)
        .subscribe({

          next: (res: any) => {

            this.loadData();

            this.snackBar.open('Rejected Successfully!', 'Close', {
              duration: 3000
            });

          },

          error: (err) => {
            console.error('Error rejecting', err);
          }

        });

    }
    else if (Payload.status == "NO" && this.userDesignation == "FIELD_OFFICER") {

      this.coreservices.rejectMeeting("fO", Payload.rejectreason, Payload.Id)
        .subscribe({

          next: (res: any) => {

            this.loadData();

            this.snackBar.open('Rejected Successfully!', 'Close', {
              duration: 3000
            });

          },

          error: (err) => {
            console.error('Error rejecting', err);
          }

        });

    }
    else if (Payload.status == "NO" && this.userDesignation == "RANGE_OFFICER") {

      this.coreservices.rejectMeeting("RO", Payload.rejectreason, Payload.Id)
        .subscribe({

          next: (res: any) => {

            this.loadData();

            this.snackBar.open('Rejected Successfully!', 'Close', {
              duration: 3000
            });

          },

          error: (err) => {
            console.error('Error rejecting', err);
          }

        });

    }



    // ---------------- FO → BO APPROVAL ----------------
    else if (this.userDesignation == "FIELD_OFFICER" && Payload.status == "YES") {

      this.coreservices.sendMeetingForApproval("FO", "BO", Payload.Id)
        .subscribe({

          next: (res: any) => {

            this.loadData();

            this.snackBar.open('Sent for Approval Successfully!', 'Close', {
              duration: 3000
            });

          },

          error: (err) => {
            console.error('Error sending approval', err);
          }

        });

    }


    // ---------------- BO → RO APPROVAL ----------------
    else if (this.userDesignation == "BEAT_OFFICER" && Payload.status == "YES") {

      this.coreservices.sendMeetingForApproval("BO", "RO", Payload.Id)
        .subscribe({

          next: (res: any) => {

            this.loadData();

            this.snackBar.open('Sent for Approval Successfully!', 'Close', {
              duration: 3000
            });

          },

          error: (err) => {
            console.error('Error sending approval', err);
          }

        });

    }


    // ---------------- FINAL APPROVAL BY RO ----------------
    else if (this.userDesignation == "RANGE_OFFICER" && Payload.status == "YES") {

      this.coreservices.approveMeetingByRO(Payload.Id)
        .subscribe({

          next: (res: any) => {

            this.loadData();

            this.snackBar.open('Approved Successfully!', 'Close', {
              duration: 3000
            });

          },

          error: (err) => {
            console.error('Error approving', err);
          }

        });

    }

  }
}