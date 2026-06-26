import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import * as L from 'leaflet';
import { ServerRequests } from "../../../../../services/ServerRequests";
import { GridColumn } from "../../../../../shared/Grids/grid-column.model";


@Component({
  selector: 'app-seedingandsapling.component',
  templateUrl: './seedingandsapling.component.html',
  styleUrls: ['./seedingandsapling.component.css']
})
export class seedingandsaplingComponent implements OnInit {

  userid: any;
  data: any[] = [];
 hiddenFields: string[] = [];
  showImagePopup: boolean = false;
  popupImageUrl: string = '';
private lastGridState: boolean = false;
  private map!: L.Map;
  private markers: L.LayerGroup = new L.LayerGroup();
  mappopup: boolean = false;
  userDesignation: any;
  seedingdetails: any = [];
  showSeedingPopup: boolean = false;
  viewgridvisiblity: boolean = false;


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
    'createdat',
     'nursery_id'
  ];

  ngOnInit(): void {
    this.seedingsaplingdetailsdata();
      this.generateHiddenFields();
  }

  generateHiddenFields() {
    this.hiddenFields = this.columns
      .filter(col => !this.primaryFields.includes(col.field))
      .map(col => col.field);
    this.seedingsaplingdetailsdata();
    console.log('Automatically hidden fields:', this.hiddenFields);
  }

  columns: GridColumn[] = [
    // Actions
    {
      field: 'actions',
      header: 'Actions',
      type: 'actions',
      actions: [
        {
          label: 'View',
          action: 'view',
          tooltip: 'View',
          icon: "",
        }
      ]
    },

    // Status
        { field: 'fo_status', header: 'Status(FO)' },
    { field: 'bo_status', header: 'Status(BO)' },
    { field: 'ro_status', header: 'Status(RO)' },

    // Nursery Info
    { field: 'nursery_name', header: 'Nursery Name' },
   { field: 'nursery_id', header: 'Nursery ID' },
    { field: 'number_of_species_raised', header: 'Number of Species Raised' },
    { field: 'total_cost_seedling_creation', header: 'Total Cost Seedling Creation' },
    { field: 'maintenance_in_year', header: 'Maintenance Year' },
    { field: 'num_of_seeding_maintained', header: 'Seedling Maintained' },
    { field: 'cost_of_seeding_maintenance', header: 'Cost Of Seeding Maintenance' },
    { field: 'total_cost', header: 'Total Cost' },
    {
      field: 'species_details', header: 'Name Of the Species', type: 'actions',
      actions: [
        {
          label: 'Seeding View',
          action: 'Seeding View',
          tooltip: 'Seeding View',
          icon: "",
        }
      ]
    },
    { field: 'comments', header: 'Comments' },
    { field: 'user_name', header: 'User Name' },
    { field: 'createdat', header: 'Creation Date' },

    // Images
    {
      field: 'image1_name',
      header: 'Image1',
      type: 'actions',
      actions: [{ icon: 'fa fa-image', action: 'Image1', tooltip: 'View Image1' }]
    },
    {
      field: 'image2_name',
      header: 'Image2',
      type: 'actions',
      actions: [{ icon: 'fa fa-image', action: 'Image2', tooltip: 'View Image2' }]
    },

    // Reject Comments
    { field: 'bo_rej_comments', header: 'Reject Comments (BO)' },
    { field: 'ro_rej_comments', header: 'Reject Comments (RO)' },

    // Map
    {
      field: 'location',
      header: 'Zoom To Map',
      type: 'actions',
      actions: [{ icon: 'fa fa-map-marker', action: 'location', tooltip: 'Zoom To Map' }]
    }
  ];
  // ================= LOAD DATA =================
  seedingsaplingdetailsdata() {
    this.coreservices.getseedingsaplingdatalist(this.userid).subscribe({
      next: (res: any) => {
      const parsedRes = typeof res === 'string' ? JSON.parse(res) : res;

      let rawData = parsedRes?.Data
        ? (typeof parsedRes.Data === 'string'
            ? JSON.parse(parsedRes.Data)
            : parsedRes.Data)
        : [];

      sessionStorage.setItem("CatchmenTechnical", JSON.stringify(rawData));

      this.data = [
        ...rawData.map((item: any, index: number) => ({
          ...item,
          sno: index + 1,
          Main_module: "Forest Management",
          Sub_module: "Nursery",
          child_Module: "Seedlings or Saplings Raised",


          createdat: item.createdat
            ? item.createdat.split('T')[0]
            : '',
             

          bo_status: item.bo_status === 'YES' ? 'Approved' : 'Pending',
          ro_status: item.ro_status === 'YES' ? 'Approved' : 'Pending',
          fo_status: item.fo_status === 'YES' ? 'Approved' : 'Pending'
        }))
      ];
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
  this.viewgridvisiblity = false; // Add this line
  
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

    this.coreservices.getseedingandsaplingImages(id, imageName).subscribe({
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

  // ================= PDF DOWNLOAD =================
 


onGridAction(event: { action: string; row: any }) {
    const row = event.row;

    // 1. Force the grid to close its own internal view container whenever an action is triggered

    switch (event.action) {
    
     
      case 'Image1': 
        this.openImage(row.id, 'img1'); 
        break;
      case 'Image2': 
        this.openImage(row.id, 'img2'); 
        break;
      case 'location':
        this.mappopup = true;
        // Make sure grid doesn't try to show its own view
        this.viewgridvisiblity = false; 
        setTimeout(() => this.openLocationOnMap(row), 100);
        break;
      case "Seeding View":
        // this.viewgridvisiblity = true; 
        this.seedingview(row.species_details);
        break;
     
    }
  }

handleStatusUpdate(payload: any) {
  console.log("Payload Received => ", payload);

  let row = payload.Data && payload.Data.length ? payload.Data[0] : {};

  let Payload = {
    Id: payload.id || row.id || 0,
    comments: payload.comments,
    number_of_species_raised: payload.number_of_species_raised,
    type_of_survey: payload.type_of_survey || payload.nursery_name, // Fixed: preserves "test raj"
    rejectreason: payload.rejectreason,
    status: payload.status
  };

  console.log("Processed Payload => ", Payload);

  // Find original row to detect if status was actually changed by user click
  const originalRow = this.data.find(item => item.id === Payload.Id);
  const originalStatus = originalRow ? originalRow.status : null;

  // It is an update if the status remains unchanged, or if status is neither YES nor NO
  const isUpdate = 
    payload.action === 'update' || 
    (Payload.status === originalStatus) || 
    (Payload.status !== 'YES' && Payload.status !== 'NO');

  if (isUpdate) {
    // ================= UPDATE FLOW =================
    if (Payload.Id != null) {
      this.coreservices.InsertNurseryseddingdetails(Payload).subscribe({
        next: (res: any) => {
          this.seedingsaplingdetailsdata();
          this.snackBar.open('Data Saved Successfully!', 'Close', { duration: 3000 });
        },
        error: (err) => {
          console.error('Error saving', err);
        }
      });
    }
  } else {
    // ================= APPROVAL / REJECT FLOW =================
    if (Payload.status == "NO" && this.userDesignation == "RANGE_OFFICER") {
      this.coreservices.Insertcommonrejectdetails("RO", Payload.rejectreason, Payload.Id, "nursery_seedling").subscribe({
        next: (res: any) => {
          this.seedingsaplingdetailsdata();
          this.snackBar.open('Data Saved Successfully!', 'Close', { duration: 3000 });
        },
        error: (err) => console.error('Error saving', err)
      });
    }
    else if (Payload.status == "NO" && this.userDesignation == "BEAT_OFFICER") {
      this.coreservices.Insertcommonrejectdetails("BO", Payload.rejectreason, Payload.Id, "nursery_seedling").subscribe({
        next: (res: any) => {
          this.seedingsaplingdetailsdata();
          this.snackBar.open('Data Saved Successfully!', 'Close', { duration: 3000 });
        },
        error: (err) => console.error('Error saving', err)
      });
    }
    else if (this.userDesignation == "FIELD_OFFICER" && Payload.status == "YES") {
      this.coreservices.CommonApprovalforallroles("FO", "BO", Payload.Id, "nursery_seedling").subscribe({
        next: (res: any) => {
          this.seedingsaplingdetailsdata();
          this.snackBar.open('Approved Successfully!', 'Close', { duration: 3000 });
        },
        error: (err) => console.error('Error saving approval', err)
      });
    }
    else if (this.userDesignation == "BEAT_OFFICER" && Payload.status == "YES") {
      this.coreservices.CommonApprovalforallroles("BO", "RO", Payload.Id, "nursery_seedling").subscribe({
        next: (res: any) => {
          this.seedingsaplingdetailsdata();
          this.snackBar.open('Approved Successfully!', 'Close', { duration: 3000 });
        },
        error: (err) => console.error('Error saving approval', err)
      });
    }
    else if (this.userDesignation == "RANGE_OFFICER" && Payload.status == "YES") {
      this.coreservices.InsertNurseryseddingapprovedrangedetails(Payload.Id).subscribe({
        next: (res: any) => {
          this.seedingsaplingdetailsdata();
          this.snackBar.open('Approved Successfully!', 'Close', { duration: 3000 });
        },
        error: (err) => console.error('Error saving approval', err)
      });
    }
  }
}
  seedingview(event: any) {
    this.seedingdetails = JSON.parse(event);
    this.showSeedingPopup = true;
    //  this.lastGridState = this.viewgridvisiblity; 
this.viewgridvisiblity = false; 
  }
  speciesColumns: GridColumn[] = [
    { field: 'Species', header: 'Species' },
    { field: 'no_seedling_raised', header: 'No Seedling Raised' },
    { field: 'no_of_sapling_raised', header: 'No Sapling Raised' },
    { field: 'date_of_sapling_raised', header: 'Date' }
  ];
 closeseedingpopup() {
    this.showSeedingPopup = false;
    this.viewgridvisiblity = true;
  //   setTimeout(() => {
  //       this.viewgridvisiblity = this.lastGridState; 
  //   }, 100);
 }

}
