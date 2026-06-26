import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import * as L from 'leaflet';
import { ServerRequests } from "../../../../services/ServerRequests";
import { GridColumn } from "../../../../shared/Grids/grid-column.model";


@Component({
  selector: 'app-ecoresurvey.component',
  templateUrl: './maintenence.component.html',
  styleUrls: ['./maintenence.component.css']
})
export class ecomaintenenceComponent implements OnInit {

  userid: any;
  data: any[] = [];
 hiddenFields: string[] = [];
  showImagePopup: boolean = false;
  popupImageUrl: string = '';

  private map!: L.Map;
  private markers: L.LayerGroup = new L.LayerGroup();
  mappopup: boolean = false;
  userDesignation: any;

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

  private primaryFields = [
    'sno',
    'bo_status',
    'ro_status',
    'fo_status',
    'user_name',
	'createdby',
    'actions',
    'plantation_id',
    'createdat'

  ];
  

  ngOnInit(): void {
    this.getmaintenencedata();
    this.generateHiddenFields();
  }

generateHiddenFields() {
    this.hiddenFields = this.columns
      .filter(col => !this.primaryFields.includes(col.field))
      .map(col => col.field);
    this.getmaintenencedata();
    console.log('Automatically hidden fields:', this.hiddenFields);
  }


  columns: GridColumn[] = [
  {
    field: 'actions',
    header: 'Actions',
    type: 'actions',
    actions: [
      {
        label: 'View',
        action: 'view',
        tooltip: 'View',
        icon: '',
        visible: (row: any) => true
      }
    ]
  },
       { field: 'fo_status', header: 'Status (FO)' },
    { field: 'bo_status', header: 'Status (BO)' },
    { field: 'ro_status', header: 'Status (RO)' },


    { field: 'id', header: 'Id' },

    { field: 'type_of_survey', header: 'Type of Survey' },

    { field: 'plantation_id', header: 'Plantation Id' },

    { field: 'type_of_plantation', header: 'Type of Plantation' },

    { field: 'type_of_maintenence', header: 'Type of Maintenance' },

    { field: 'type_of_activity', header: 'Type of Activity' },

    { field: 'mand_male', header: 'Mandays Male' },

    { field: 'mand_female', header: 'Mandays Female' },

    { field: 'labour_cost', header: 'Labour Cost' },

    { field: 'material_cost', header: 'Material Cost' },

    { field: 'total_cost', header: 'Total Cost' },

    { field: 'survival_status', header: 'Survival Status' },

    { field: 'activity_in_km', header: 'Activity in Km' },

    { field: 'activity_in_hec', header: 'Activity in Hec' },

    { field: 'comments', header: 'Comments' },

    { field: 'createdby', header: 'User Name' },

    { field: 'createdat', header: 'Creation Date' },

    // 🔹 IMAGE 1
  {
    field: 'image1_name',
    header: 'Image 1',
    type: 'actions',
    actions: [
      {
        icon: 'fa fa-image',
        tooltip: 'View Image 1',
        action: 'image1',
        visible: (row: any) => row.image1_name && row.image1_name !== ''
      }
    ]
  },

  // 🔹 IMAGE 2
  {
    field: 'image2_name',
    header: 'Image 2',
    type: 'actions',
    actions: [
      {
        icon: 'fa fa-image',
        tooltip: 'View Image 2',
        action: 'image2',
        visible: (row: any) => row.image2_name && row.image2_name !== ''
      }
    ]
  },

  // 🔹 MAP LOCATION
  {
    field: 'location',
    header: 'Go to Map',
    type: 'actions',
    actions: [
      {
        icon: 'fa fa-map-marker',
        tooltip: 'Zoom to Map',
        action: 'map',
        visible: (row: any) => row.lat != null && row.lng != null
      }
    ]
  },

    { field: 'bo_rej_comments', header: 'Reject Comments (BO)' },

    { field: 'ro_rej_comments', header: 'Reject Comments (RO) ' },

   

  ];
  // ================= LOAD DATA =================
  getmaintenencedata() {
    this.coreservices.getecomaintenencedatalist(this.userid).subscribe({
      next: (res: any) => {

        let parsedRes: any;

        // ✅ check if string then parse
        if (typeof res === 'string') {
          parsedRes = JSON.parse(res);
        } else {
          parsedRes = res;   // already object
        }

        let rawData = parsedRes?.Data || parsedRes || [];

        console.log("Final Maintence Data:", rawData);

        this.data = rawData.map((item: any, index: number) => ({
          ...item,
          sno: index + 1,
          Main_module: "Eco Development",
          Sub_module: "Plantation",
          child_Module: "Maintenance",

          bo_status: item.bo_status === 'YES' ? 'Approved' : 'Pending',
          ro_status: item.ro_status === 'YES' ? 'Approved' : 'Pending',
          fo_status: item.fo_status === 'YES' ? 'Approved' : 'Pending'
        }));

      },
      error: (err: any) => {
        console.error(err);
        this.snackBar.open('Failed to load Nursery data', 'Close', { duration: 3000 });
      }
    });
  }

  // ================= MAP =================
  initMap(): void {
     if (this.map) {
       this.map.remove();
     }
 
     const iconDefault = L.icon({
       iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
       shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
       iconSize: [25, 41],
       iconAnchor: [12, 41]
     });
 
     L.Marker.prototype.options.icon = iconDefault;
 
     this.map = L.map('map', { zoomControl: false })
       .setView([17.3850, 78.4867], 6); // India default
 
     L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
       maxZoom: 19,
       attribution: '© OpenStreetMap'
     }).addTo(this.map);
 
     L.control.zoom({ position: 'topright' }).addTo(this.map);
 
     this.markers.addTo(this.map);
 
     setTimeout(() => {
       this.map.invalidateSize();
     }, 200);
   }
 

   private getPopupHTML(row: any): string {
    const excludedFields = ['sno', 'id', 'lat', 'lng', 'bo_status', 'ro_status', 'fo_status', 'actions', 'img1', 'img2', 'map'];
    
    let html = `<div style="max-height: 250px; overflow-y: auto; font-family: sans-serif;">`;
    html += `<h4 style="margin: 0 0 5px 0; color: #007bff;">Details</h4>`;
    
    Object.keys(row).forEach(key => {
      if (!excludedFields.includes(key) && row[key] !== null && row[key] !== undefined && row[key] !== '') {
        const label = key.replace(/_/g, ' ').toUpperCase();
        html += `<div style="margin-bottom: 3px;">
                  <strong style="color: #555;">${label}:</strong> ${row[key]}
                 </div>`;
      }
    });
    
    html += `</div>`;
    return html;
  }
  
  loadMarkers() {
      this.markers.clearLayers();
    
      this.data.forEach((item: any) => {
        const lat = item.lat;
        const lng = item.lng;
    
        if (lat && lng) {
          const marker = L.marker([lat, lng])
            .bindPopup(this.getPopupHTML(item)); // Use the helper here
          this.markers.addLayer(marker);
        }
      });
    }

 openLocationOnMap(row: any) {
       const lat = Number(row.lat);
       const lng = Number(row.lng);
     
       if (!lat || !lng) {
         this.snackBar.open('Location not available', 'Close', { duration: 3000 });
         return;
       }
     
       if (!this.map) this.initMap();
       this.markers.clearLayers();
     
       const marker = L.marker([lat, lng])
         .bindPopup(this.getPopupHTML(row)) 
         .openPopup(); 
       this.markers.addLayer(marker);
     
       this.map.flyTo([lat, lng], 17, { animate: true, duration: 1.5 });
       
       setTimeout(() => {
         this.map.invalidateSize();
         document.getElementById('map')?.scrollIntoView({ behavior: 'smooth' });
       }, 300);
     }

  closeMapPopup() {
    this.mappopup = false;
    if (this.map) {
      this.map.off();
      this.map.remove();
    }
    this.map = undefined as any;
    this.markers = new L.LayerGroup();
  }

  // ================= IMAGE POPUP =================
  openImage(id: string, imageName: string) {
    this.showImagePopup = true;
    this.popupImageUrl = '';

    this.coreservices.geteceomaintenenceImages(id, imageName).subscribe({
      next: (res: any) => {
        const result = typeof res === 'string' ? JSON.parse(res) : res;
        const base64 = result?.Data?.[0]?.img;

        this.popupImageUrl = base64
          ? 'data:image/jpeg;base64,' + base64
          : 'https://placehold.co/600x400?text=No+Image';
      },
      error: () => {
        this.popupImageUrl = 'https://placehold.co/600x400?text=Error';
      }
    });
  }

  closeImagePopup() {
    this.showImagePopup = false;
  }


  onGridAction(event: { action: string; row: any }) {
    const row = event.row;

    switch (event.action) {
      case 'image1': this.openImage(row.id, 'img1'); break;
      case 'image2': this.openImage(row.id, 'img2'); break;
      case 'map':
        this.mappopup = true;
        setTimeout(() => this.openLocationOnMap(row), 100);
        break;
    }
  }
     handleStatusUpdate(payload: any) {

    console.log(payload);


    sessionStorage.setItem('Nursery View Details', JSON.stringify(payload));


    let row = payload.Data && payload.Data.length ? payload.Data[0] : {};
    let formattedDate = null;

    if (row.date_or_creation) {
      const parts = row.date_or_creation.split(' ')[0].split('-'); // ["21","02","2026"]

      const day = parts[0];
      const month = parts[1];
      const year = parts[2];

      formattedDate = `${year}-${month}-${day}T00:00:00`;
    }

    let Payload = {
      Id: payload.id || row.id || 0,
      type_of_survey: payload.plantation_id,
      comments: payload.comments,
      PlantationcompletedinKM:payload.activity_in_km,
      survivalstatusinpercentage:payload.survival_status,
      rejectreason: payload.rejectreason,
      status: payload.status
    };

    console.log("Final Payload => ", Payload);
    if (Payload.comments != undefined && Payload.status != "NO" && Payload.status != "YES") {
      this.coreservices.InsertEcoplantationmaintencedetails(Payload).subscribe({
        next: (res: any) => {
          this.getmaintenencedata();
          this.snackBar.open('Data Saved Successfully!', 'Close', { duration: 3000 });
        },
        error: (err) => {
          console.error('Error saving', err);
        }
      });
    }
    else if (Payload.status == "NO") {
      this.coreservices.Insertcommonrejectdetails("RO", Payload.rejectreason, Payload.Id,"ecod_plan_maintenence").subscribe({
        next: (res: any) => {
          this.getmaintenencedata();
          this.snackBar.open('Data Saved Successfully!', 'Close', { duration: 3000 });
        },
        error: (err) => {
          console.error('Error saving', err);
        }
      });
    }
    else if (this.userDesignation == "FIELD_OFFICER" && Payload.status == "YES") {
      this.coreservices.CommonApprovalforallroles("FO", "BO", Payload.Id, "ecod_plan_maintenence").subscribe({
        next: (res: any) => {
          this.getmaintenencedata();
          this.snackBar.open('Data Saved Successfully!', 'Close', { duration: 3000 });
        },
        error: (err) => {
          console.error('Error saving', err);
        }
      });
    }
    else if (this.userDesignation == "BEAT_OFFICER" && Payload.status == "YES") {
      this.coreservices.CommonApprovalforallroles("BO", "RO", Payload.Id, "ecod_plan_maintenence").subscribe({
        next: (res: any) => {
          this.getmaintenencedata();
          this.snackBar.open('Data Saved Successfully!', 'Close', { duration: 3000 });
        },
        error: (err) => {
          console.error('Error saving', err);
        }
      });
    }
    else if (this.userDesignation == "RANGE_OFFICER" && Payload.status == "YES") {
      this.coreservices.commonApprovedByRangeo(Payload.Id,"ecod_plan_maintenence").subscribe({
        next: (res: any) => {
          this.getmaintenencedata();
          this.snackBar.open('Data Saved Successfully!', 'Close', { duration: 3000 });
        },
        error: (err) => {
          console.error('Error saving', err);
        }
      });
    }
  }


}