import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import * as L from 'leaflet';
import { CustomGridComponent } from "../../../../shared/Grids/custom-grid.component";
import { ServerRequests } from "../../../../services/ServerRequests";
import { GridColumn } from "../../../../shared/Grids/grid-column.model";
import { DynamicField } from '../../../../shared/dialog-boxes/dynamic-form.model';


@Component({
  selector: 'app-livelihood-market-outreach',
  templateUrl: './livelihood-market-outreach.component.html',
  styleUrl: './livelihood-market-outreach.component.css'
})
export class LivelihoodMarketOutreachComponent implements OnInit{

 
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
               mappopup: boolean = false;

                showAddModal: boolean = false;
dialogFields: DynamicField[] = [];
           
             private primaryFields = [
             'sno', 
             'bo_status', 
             'ro_status', 
             'fo_status', 
             'user_name',
             'createdby',
             'actions'
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
      this.loadmarketoutreach();
     this.generateHiddenFields();
       this.initDialogFields();
  
    }
    generateHiddenFields() {
    this.hiddenFields = this.columns
      .filter(col => !this.primaryFields.includes(col.field))
      .map(col => col.field);
     this.loadmarketoutreach(); 
    console.log('Automatically hidden fields:', this.hiddenFields);
  }
  
  initDialogFields() {
    this.dialogFields = [
      {
        name: 'site_id',
        label: 'Site ID',
        type: 'select',
        options: [
          // If you have an API for Site IDs, you map them here. For now, here is placeholder data:
          { name: 'Site 1', value: '1' },
          { name: 'Site 2', value: '2' }
        ]
      },
      { name: 'name_of_activity', label: 'Name of Activity', type: 'text' },
      { name: 'image1', label: 'Upload Photo 1', type: 'file' }, // Assumes your grid supports 'file' type
      { name: 'image2', label: 'Upload Photo 2', type: 'file' },
      { name: 'image3', label: 'Upload Photo 3', type: 'file' },
      { name: 'message', label: 'Message', type: 'textarea' }
    ];
  }
 
  SaveRecord(data: any) {
    console.log('Data received from Grid Modal:', data);
    
    const payload = {
      site_id: Number(data.site_id),
      name_of_activity: data.name_of_activity,
      message: data.message,
      createdby: Number(this.userid)
    };

    this.coreservices.insertEcotourismMarketOutreach(payload).subscribe({
      next: (res) => {
        this.snackBar.open('Record Added Successfully!', 'Close', { duration: 3000 });
        this.loadmarketoutreach(); // Refresh table
      },
      error: (err) => {
        console.error('Save failed', err);
        this.snackBar.open('Failed to add record', 'Close');
      }
    });
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
   { field: 'bo_status', header: 'Status(BO)' },
  { field: 'ro_status', header: 'Status(RO)' },
   { field: 'fo_status', header: 'Status (FO)' },
   { field: 'site_id', header: 'Site ID' },
  { field: 'name_of_activity', header: 'Activity Name' },
  { field: 'image1_name', header: 'Image 1 Name' },
  { field: 'image1', header: 'Image 1' },
  { field: 'image2_name', header: 'Image 2 Name' },
  { field: 'image2', header: 'Image 2' },
  { field: 'image3_name', header: 'Image 3 Name' },
  { field: 'image3', header: 'Image 3' },
  { field: 'createdby', header: 'Created By' },
 { field: 'createdat', header: 'Created At' },

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
  
  
  loadmarketoutreach() {
    this.coreservices.getEcotourismMarketOutreach().subscribe({
      next: (res: any) => {
        const parsedRes = typeof res === 'string' ? JSON.parse(res) : res;
        let rawData = parsedRes?.Data ? (typeof parsedRes.Data === 'string' ? JSON.parse(parsedRes.Data) : parsedRes.Data) : [];
        sessionStorage.setItem("CatchmenTechnical",JSON.stringify(rawData))
        this.data = [...rawData.map((item: any, index: number) => ({
          ...item,
          sno: index + 1,
          createdat: item.createdat ? new Date(item.createdat).toLocaleString('en-IN') : '',
          bo_status: item.bo_status === 'YES' ? 'Approved' : 'Pending',
          ro_status: item.ro_status === 'YES' ? 'Approved' : 'Pending',
          fo_status: item.fo_status === 'YES' ? 'Approved' : 'Pending'
        }))];
        this.loadMarkers();
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
           const excludedFields = ['sno', 'actions', 'img1', 'img2', 'map'];
         
           let html = `
             <div style="max-height:250px;overflow-y:auto;font-family:sans-serif;padding:5px;">
               <h4 style="margin:0 0 8px;color:#007bff;">Facility Details</h4>
           `;
         
           Object.keys(row).forEach(key => {
             if (!excludedFields.includes(key) && row[key]) {
               const label = key.replace(/_/g, ' ').toUpperCase();
               html += `
                 <div style="margin-bottom:4px;">
                   <strong>${label}:</strong> ${row[key]}
                 </div>
               `;
             }
           });
         
           html += `</div>`;
           return html;
         }
         
         
                    loadMarkers() {
           if (!this.map) {
             this.initMap(); // 🔥 ensure map exists
           }
         
           this.markers.clearLayers();
         
           this.data.forEach((item: any) => {
             if (item.lat && item.lng) {
               const marker = L.marker([item.lat, item.lng])
                 .bindPopup(this.getPopupHTML(item)); // 🔥 THIS IS YOUR POPUP
         
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

    this.coreservices.getEcoTourismImage(id, imageName, 'eco_tourism_site_selection').subscribe({
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
      const module = "eco_tourism_site_selection";

  let Payload = {  
    "Id": payload.id,
      "LocalityName":payload.LocalityName,
    "comments": payload.comments,
      status :payload.status,
    rejectreason:payload.rejectreason
  };

 if (Payload.status == "NO" && this.userDesignation=="RANGE_OFFICER") {
      this.coreservices.Insertcommonrejectdetails("RO", payload.rejectreason, Payload.Id, module).subscribe({
        next: (res: any) => {
          this.loadmarketoutreach();
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
          this.loadmarketoutreach();
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
          this.loadmarketoutreach();
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
          this.loadmarketoutreach();
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
          this.loadmarketoutreach();
          this.snackBar.open('Data Saved Successfully!', 'Close', { duration: 3000 });
        },
        error: (err) => {
          console.error('Error saving', err);
        }
      });
    }



  if(Payload.Id !=null && Payload.comments != null){
   this.coreservices.updateEcoTourismDetails(Payload).subscribe({
    next: (res: any) => {
      if (res && res.status === true) {
        this.snackBar.open('Successfully updated', 'Close', { duration: 3000 });
        this.loadmarketoutreach(); // Refresh grid
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
  
  
  


