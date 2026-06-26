import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import * as L from 'leaflet';
import { CustomGridComponent } from "../../../../shared/Grids/custom-grid.component";
import { ServerRequests } from "../../../../services/ServerRequests";
import { GridColumn } from "../../../../shared/Grids/grid-column.model";

@Component({
  selector: 'app-asset-updation',
  templateUrl: './asset-updation.component.html',
  styleUrl: './asset-updation.component.css'
})
export class AssetUpdationComponent implements OnInit{
     @ViewChild('grid') gridComponent!: CustomGridComponent;

         userid: any;
          data: any[] = [];
           hiddenFields: string[] = []; 
             userDesignation: string = '';
      
          showImagePopup: boolean = false;
          popupImageUrl: string = '';
          disablegrid: boolean = false;
      
          private map!: L.Map;
          private markers: L.LayerGroup = new L.LayerGroup();
          mappopup: boolean = false;;
      
        private primaryFields = [
        'sno',
        'structure_id' ,
        'bo_status', 
        'ro_status', 
        'fo_status', 
        'user_name',
        'actions',
        'createdat'
      ];
      
        
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
  
    
  
  
    ngOnInit(): void {
      this.Loadassetupdation();
       this.generateHiddenFields();
    }
  
  generateHiddenFields() {
    this.hiddenFields = this.columns
      .filter(col => !this.primaryFields.includes(col.field))
      .map(col => col.field);
     this.Loadassetupdation(); 
    console.log('Automatically hidden fields:', this.hiddenFields);
  }
  
 columns: GridColumn[] = [
  {
    field: 'actions',
    header: 'Action',
    type: 'actions',
    actions: [
      {
        label: 'View',
        action: 'view',
        tooltip: 'View',
        icon: ''
      }
    ]
  },
  { field: 'fo_status', header: 'Status (FO)' },
  { field: 'bo_status', header: 'Status(BO)' },
  { field: 'ro_status', header: 'Status(RO)' },
  { field: 'id', header: 'Id' },
  { field: 'structure_id', header: 'Structure Id' },
  { field: 'type_of_structure', header: 'Structure Type' },
  { field: 'assets', header: 'Assets' },
  { field: 'comments', header: 'Comments' },
  { field: 'user_name', header: 'User Name' },
  { field: 'createdat', header: 'Creation Date' },
  {
    header: 'Image1',
    field: 'img1',
    type: 'actions',
    actions: [
      { icon: 'fa fa-picture-o', action: 'view_image1', visible: (row: any) => !!row.image1_name }
    ]
  },
   {
    header: 'Image2',
    field: 'img2',
    type: 'actions',
    actions: [
      { icon: 'fa fa-image', action: 'view_image2', tooltip: 'View Image 2', color: '#eab308', visible: (row: any) => !!row.image2_name }
    ]
  },
 { field: 'bo_rej_comments', header: 'Bo Reject Comments' },
  { field: 'ro_rej_comments', header: 'Ro Reject Comments' },
  
  {
    field: 'map',
    header: 'Go To Map',
    type: 'actions',
    actions: [
      { icon: 'fa fa-map-marker', action: 'location', tooltip: 'Go To Map' }
    ]
  }
];


    // ================= LOAD DATA =================
  
    Loadassetupdation() {
    this.coreservices.getAllCatchmentAssets(this.userid).subscribe({
      next: (res: any) => {
        const parsedRes = typeof res === 'string' ? JSON.parse(res) : res;
        let rawData = parsedRes?.Data ? (typeof parsedRes.Data === 'string' ? JSON.parse(parsedRes.Data) : parsedRes.Data) : [];
        sessionStorage.setItem("CatchmenTechnical",JSON.stringify(rawData))
        this.data = [...rawData.map((item: any, index: number) => ({
          ...item,
          sno: index + 1,
          Main_module:"Catchment Area Management",
          Sub_module:"SMC",
          child_Module:"Asset Updation",

          createdat: item.createdat
            ? item.createdat.split('T')[0]
            : '',
          bo_status: item.bo_status === 'YES' ? 'Approved' : 'Pending',
          ro_status: item.ro_status === 'YES' ? 'Approved' : 'Pending',
          fo_status: item.fo_status === 'YES' ? 'Approved' : 'Pending'
        }))];
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
   openImage(id: number, imageName: string) {
    this.showImagePopup = true;
    this.popupImageUrl = '';

    this.coreservices.gettMonitoringImage(id, imageName, 'catchment_smc_asset_updation').subscribe({
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
    case 'view':
      this.disablegrid = true;
      let rowToView = { ...row };
  
      if (this.userDesignation === 'BEAT_OFFICER') {
        rowToView.comments = row.ro_rej_comments || '-';
      } else if (this.userDesignation === 'FIELD_OFFICER') {
        rowToView.comments = row.bo_rej_comments || '-';
      } else {
        rowToView.display_comments = '';
      }

      setTimeout(() => {
        if (this.gridComponent) {
          this.gridComponent.openViewPopupFromOutside(rowToView);
        } else {
          console.error("Grid component not found in DOM");
        }
      }, 0);
      break;
  
            case 'view_image1':
          this.openImage(row.id, 'img1');
          break;
  
         case 'view_image2':
          this.openImage(row.id, 'img2');
          break;
  
    case 'location':
      this.mappopup = true;
      setTimeout(() => this.openLocationOnMap(row), 100);
      break;
      }
    }
  
  
  handleStatusUpdate(payload: any) {
          const module = "catchment_smc_asset_updation";

  let Payload = { 
    "Id": payload.id,
    "comments": payload.comments,
    status :payload.status,
    rejectreason:payload.rejectreason
  };

  if (Payload.status == "NO" && this.userDesignation=="RANGE_OFFICER") {
      this.coreservices.Insertcommonrejectdetails("RO", payload.rejectreason, Payload.Id, module).subscribe({
        next: (res: any) => {
          this.Loadassetupdation();
          this.snackBar.open('Data Saved Successfully!', 'Close', { duration: 3000 });
        },
        error: (err) => {
          console.error('Error saving', err);
        }
      });
    }
    else if(Payload.status == "NO" && this.userDesignation=="BEAT_OFFICER"){
      this.coreservices.Insertcommonrejectdetails("BO", payload.rejectreason, Payload.Id, module).subscribe({
        next: (res: any) => {
          this.Loadassetupdation();
          this.snackBar.open('Data Saved Successfully!', 'Close', { duration: 3000 });
        },
        error: (err) => {
          console.error('Error saving', err);
        }
      });
    }
    else if (this.userDesignation == "FIELD_OFFICER" && Payload.status == "YES") {
      this.coreservices.CommonApprovalforallroles("FO", "BO", Payload.Id, module).subscribe({
        next: (res: any) => {
          this.Loadassetupdation();
          this.snackBar.open('Data Saved Successfully!', 'Close', { duration: 3000 });
        },
        error: (err) => {
          console.error('Error saving', err);
        }
      });
    }
    else if (this.userDesignation == "BEAT_OFFICER" && Payload.status == "YES") {
      this.coreservices.CommonApprovalforallroles("BO", "RO",Payload.Id, module).subscribe({
        next: (res: any) => {
          this.Loadassetupdation();
          this.snackBar.open('Data Saved Successfully!', 'Close', { duration: 3000 });
        },
        error: (err) => {
          console.error('Error saving', err);
        }
      });
    }
    else if (this.userDesignation == "RANGE_OFFICER" && Payload.status == "YES") {
      this.coreservices.commonforallrolesapprovedrangedetails(Payload.Id,module).subscribe({
        next: (res: any) => {
          this.Loadassetupdation();
          this.snackBar.open('Data Saved Successfully!', 'Close', { duration: 3000 });
        },
        error: (err) => {
          console.error('Error saving', err);
        }
      });
    }



  if(Payload.Id !=null && Payload.comments != null){
   this.coreservices.updateAssetUpdationDetails(Payload).subscribe({
    next: (res: any) => {
      if (res && res.status === true) {
        this.snackBar.open('Successfully updated', 'Close', { duration: 3000 });
        this.Loadassetupdation(); 
      } else {
        this.snackBar.open('Update failed', 'Close');
      }
    },
    error: (err) => {
      console.error('API Error:', err);
      this.snackBar.open('Error contacting server', 'Close');
    }
  });
}
}

  
  

}
