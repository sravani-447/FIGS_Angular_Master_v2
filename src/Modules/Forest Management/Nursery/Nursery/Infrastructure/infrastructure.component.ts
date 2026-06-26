import { Component, OnInit,ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import * as L from 'leaflet';
import { ServerRequests } from "../../../../../services/ServerRequests";
import { GridColumn } from "../../../../../shared/Grids/grid-column.model";
import { CustomGridComponent } from "../../../../../shared/Grids/custom-grid.component";


@Component({
  selector: 'app-infrastructure.component',
  templateUrl: './infrastructure.component.html',
  styleUrls: ['./infrastructure.component.css']
})
export class infrastructureComponent implements OnInit {
@ViewChild('grid') gridComponent!: CustomGridComponent;

  userid: any;
  data: any[] = [];

  showImagePopup: boolean = false;
  popupImageUrl: string = '';
  hiddenFields: string[] = [];

  private map!: L.Map;
  private markers: L.LayerGroup = new L.LayerGroup();
  mappopup: boolean = false;
  userDesignation: string='';

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
    this.infradetailsdata();
      this.generateHiddenFields();
  }

   generateHiddenFields() {
    this.hiddenFields = this.columns
      .filter(col => !this.primaryFields.includes(col.field))
      .map(col => col.field);
    this.infradetailsdata();
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
          icon: "",
        }
      ]
    },
       { field: 'fo_status', header: 'Status (FO)' },
  { field: 'bo_status', header: 'Status (BO)' },
  { field: 'ro_status', header: 'Status (RO)' },
  
  { field: 'nursery_name', header: 'Nursery Name' },
  { field: 'nursery_id', header: 'Nursery ID' },
  
  
  // Beds
  { field: 'num_of_mother_bed', header: 'Mother Bed' },
  { field: 'mother_bed_size', header: 'Mother Bed Size' },
  { field: 'num_of_temp_bed', header: 'Temp Bed' },
  { field: 'temp_bed_size', header: 'Temp Bed Size' },
  { field: 'num_of_permanent_bed', header: 'Permanent Bed' },
  { field: 'permanent_bed_size', header: 'Permanent Bed Size' },
  { field: 'num_of_other_bed', header: 'Other Bed' },
  { field: 'other_bed_size', header: 'Other Bed Size' },

  { field: 'date_if_creation_seedling', header: 'Seedling Creation Date' },
  { field: 'opening_stock', header: 'Opening Stock' },
  { field: 'polybag_size', header: 'Polybag Size' },
  { field: 'polybag_number', header: 'Polybag' },
  { field: 'available_facility', header: 'Available Facilities' },
  { field: 'total_cost', header: 'Total Cost' },
  { field: 'comments', header: 'Comments' },
  { field: 'user_name', header: 'User Name' },
  { field: 'createdat', header: 'Creation Date' },
  { field: 'bo_rej_comments', header: 'Reject Comments (BO)' },
  { field: 'ro_rej_comments', header: 'Reject Comments (RO)' },

  // Image Actions
  {
      field: 'image1_name',
      header: 'Image 1',
      type: 'actions',
      actions: [{ icon: 'fa fa-image', action: 'Image1' ,tooltip:"image1_name", visible: (row: any) => row.image1_name != ""}]
    },
    {
      field: 'image2_name',
      header: 'Image 2',
      type: 'actions',
      actions: [{ icon: 'fa fa-image', action: 'Image2', visible: (row: any) => row.image2_name != ""}]
    },


  // Map Action
  {
    field: 'location',
    header: 'Zoom To Map',
    type: 'actions',
    actions: [{ icon: 'fa fa-map-marker', action: 'location', tooltip: 'Zoom To Map' }]
  }
];
  // ================= LOAD DATA =================
infradetailsdata() {
  this.coreservices.getinfradatalist(this.userid).subscribe({
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
          nurseryinfra:true,
          Main_module: "Forest Management",
          Sub_module: "Nursery",
          child_Module: "infrastructure",
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

    this.coreservices.getinfraImages(id, imageName).subscribe({
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
  downloadGradationPdf(id: number) {
    window.open(`http://183.82.114.29:9094/SHGJLG/DownloadGradation_pdf?id=${id}`, '_blank');
  }

  downloadRegulationPdf(id: number) {
    window.open(`http://183.82.114.29:9094/SHGJLG/DownloadRegulation_pdf?id=${id}`, '_blank');
  }



  onGridAction(event: { action: string; row: any }) {
    const row = event.row;

    switch (event.action) {
      case 'gradation': this.downloadGradationPdf(row.id); break;
      case 'regulation': this.downloadRegulationPdf(row.id); break;
      case 'Image1': this.openImage(row.id, 'img1'); break;
      case 'Image2': this.openImage(row.id, 'img2'); break;
      case 'location':
        this.mappopup = true;
        setTimeout(() => this.openLocationOnMap(row), 100);
        break;
    }
  }
  handleStatusUpdate(payload: any) {

  console.log(payload);

  // store for reference
  sessionStorage.setItem('Nursery View Details', JSON.stringify(payload));

  // get actual row from Data array
  let row = payload.Data && payload.Data.length ? payload.Data[0] : {};
let formattedDate = null;

if (row.date_or_creation) {
  const parts = row.date_or_creation.split(' ')[0].split('-'); // ["21","02","2026"]

  const day = parts[0];
  const month = parts[1];
  const year = parts[2];

  formattedDate = `${year}-${month}-${day}T00:00:00`;
}
  // prepare API payload
  let Payload = {
    Id: payload.id || row.id || 0,
    nursery_name: payload.nursery_name,
    opening_stock: payload.opening_stock,
    available_facility: payload.available_facility,
    total_cost: payload.total_cost,
    polybag_size: payload.polybag_size,
    polybag_number: payload.polybag_number,
    comments:payload.comments,
    rejectreason:payload.rejectreason,
    status: payload.status
  };

  console.log("Final Payload => ", Payload);
     if (Payload.comments != undefined && Payload.status != "NO" && Payload.status != "YES") {
      this.coreservices.Insertinfradetails(Payload).subscribe({
        next: (res: any) => {
          this.infradetailsdata();
          this.snackBar.open('Data Saved Successfully!', 'Close', { duration: 3000 });
        },
        error: (err) => {
          console.error('Error saving', err);
        }
      });
    }
     else if (Payload.status == "NO") {
      this.coreservices.Insertinfrarejectdetails("RO", Payload.rejectreason, Payload.Id).subscribe({
        next: (res: any) => {
          this.infradetailsdata();
          this.snackBar.open('Data Saved Successfully!', 'Close', { duration: 3000 });
        },
        error: (err) => {
          console.error('Error saving', err);
        }
      });
    }
      else if(this.userDesignation == "FIELD_OFFICER" && Payload.status == "YES"){
         this.coreservices.CommonApprovalforallroles("FO","BO",Payload.Id,"nursery_infra").subscribe({
        next: (res: any) => {
          this.infradetailsdata();
          this.snackBar.open('Data Saved Successfully!', 'Close', { duration: 3000 });
        },
        error: (err) => {
          console.error('Error saving', err);
        }
      });
    }
       else if(this.userDesignation == "BEAT_OFFICER" && Payload.status == "YES"){
         this.coreservices.CommonApprovalforallroles("BO","RO",Payload.Id,"nursery_infra").subscribe({
        next: (res: any) => {
          this.infradetailsdata();
          this.snackBar.open('Data Saved Successfully!', 'Close', { duration: 3000 });
        },
        error: (err) => {
          console.error('Error saving', err);
        }
      });
    }
    else if(this.userDesignation == "RANGE_OFFICER" && Payload.status == "YES"){
      this.coreservices.Insertinfraapprovedrangedetails(Payload.Id).subscribe({
        next: (res: any) => {
          this.infradetailsdata();
          this.snackBar.open('Data Saved Successfully!', 'Close', { duration: 3000 });
        },
        error: (err) => {
          console.error('Error saving', err);
        }
      });
    }
  

 
}

}