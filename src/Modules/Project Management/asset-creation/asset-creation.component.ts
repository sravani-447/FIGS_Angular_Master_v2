import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import * as L from 'leaflet';
import { CustomGridComponent } from "../../../shared/Grids/custom-grid.component";
import { ServerRequests } from "../../../services/ServerRequests";
import { GridColumn } from "../../../shared/Grids/grid-column.model";

@Component({
  selector: 'app-asset-creation',
  templateUrl: './asset-creation.component.html',
  styleUrl: './asset-creation.component.css'
})
export class AssetCreationComponent implements OnInit {

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
            'bo_status', 
            'ro_status', 
            'fo_status', 
            'user_name',
            'createdby',
            'createdat',
            'actions'
          ];
          
           private moduleName = "pm_asset_creation";
            
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
        this.Loadassetcreation();
         this.generateHiddenFields();
      }
    
    generateHiddenFields() {
      this.hiddenFields = this.columns
        .filter(col => !this.primaryFields.includes(col.field))
        .map(col => col.field);
       this.Loadassetcreation(); 
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
          action: 'Asset_Creation_View',
          tooltip: 'View',
          icon: ''
        }
      ]
    },
    { field: 'fo_status', header: 'Status (FO)' },
    { field: 'bo_status', header: 'Status(BO)' },
    { field: 'ro_status', header: 'Status(RO)' },

    { field: 'id', header: 'ID' },
    { field: 'asset_type', header: 'Asset Type' },
    { field: 'asset_category', header: 'Asset Category' },
    { field: 'asset_sub_category', header: 'Asset Sub Category' },
    { field: 'type_of_scheme', header: 'Scheme Type' },
    { field: 'selected_schema', header: 'Selected Scheme' },

    { field: 'bld_name', header: 'Building Name' },
    { field: 'bld_status', header: 'Building Status' },
    { field: 'bld_is_main_req', header: 'Main Requirement (Bld)' },
    { field: 'bld_type_of_main', header: 'Type of Main (Bld)' },
    { field: 'bld_fencing_length', header: 'Fencing Length' },

    { field: 'hw_office_name', header: 'Hardware Office' },
    { field: 'hw_desc', header: 'Hardware Description' },
    { field: 'hw_quantity', header: 'Hardware Quantity' },
    { field: 'hw_status', header: 'Hardware Status' },
    { field: 'hw_is_main_req', header: 'Main Requirement (HW)' },
    { field: 'hw_type_of_main', header: 'Type of Main (HW)' },

    { field: 'sw_office_name', header: 'Software Office' },
    { field: 'sw_software_name', header: 'Software Name' },
    { field: 'sw_date_of_purchase', header: 'SW Purchase Date' },
    { field: 'sw_date_of_expi', header: 'SW Expiry Date' },
    { field: 'sw_desc', header: 'SW Description' },
    { field: 'sw_status', header: 'SW Status' },
    { field: 'sw_quantity', header: 'SW Quantity' },
    { field: 'main_req_others', header: 'Other Requirements' },
    { field: 'sw_is_main_req', header: 'Main Requirement (SW)' },

    { field: 'ac_office_name', header: 'AC Office' },
    { field: 'ac_date_of_purchase', header: 'AC Purchase Date' },
    { field: 'ac_brand_name', header: 'AC Brand' },
    { field: 'ac_model', header: 'AC Model' },
    { field: 'ac_quantity', header: 'AC Quantity' },
    { field: 'ac_status', header: 'AC Status' },
    { field: 'ac_is_main_req', header: 'Main Requirement (AC)' },
    { field: 'ac_type_of_main', header: 'Type of Main (AC)' },

    { field: 'veh_office_name', header: 'Vehicle Office' },
    { field: 'veh_date_of_purchase', header: 'Vehicle Purchase Date' },
    { field: 'veh_brand_name', header: 'Vehicle Brand' },
    { field: 'veh_model', header: 'Vehicle Model' },
    { field: 'veh_regis_number', header: 'Registration Number' },
    { field: 'veh_status', header: 'Vehicle Status' },
    { field: 'veh_is_main_req', header: 'Main Requirement (Vehicle)' },
    { field: 'veh_type_of_main', header: 'Type of Main (Vehicle)' },

    {
      field: 'veh_image1',
      header: 'Vehicle Image 1',
      type: 'actions',
      actions: [{ icon: 'fa fa-image', action: 'veh_image1', visible: (row: any) => !!row.veh_image1_name }]
    },
    {
      field: 'veh_image2',
      header: 'Vehicle Image 2',
      type: 'actions',
      actions: [{ icon: 'fa fa-image', action: 'veh_image2', visible: (row: any) => !!row.veh_image2_name }]
    },
    {
      field: 'veh_image3',
      header: 'Vehicle Image 3',
      type: 'actions',
      actions: [{ icon: 'fa fa-image', action: 'veh_image3', visible: (row: any) => !!row.veh_image3_name }]
    },
    {
      field: 'veh_image4',
      header: 'Vehicle Image 4',
      type: 'actions',
      actions: [{ icon: 'fa fa-image', action: 'veh_image4', visible: (row: any) => !!row.veh_image4_name }]
    },

    { field: 'hw_date_of_purchase', header: 'HW Purchase Date' },

    { field: 'fur_status', header: 'Furniture Status' },
    { field: 'fur_is_main_req', header: 'Main Requirement (Furniture)' },
    { field: 'fur_type_of_main', header: 'Type of Main (Furniture)' },
    { field: 'fun_office_name', header: 'Furniture Office' },
    { field: 'fur_name', header: 'Furniture Name' },
    { field: 'fur_date_of_purchase', header: 'Furniture Purchase Date' },
    { field: 'fur_desc', header: 'Furniture Description' },
    { field: 'fur_quantity', header: 'Furniture Quantity' },

    { field: 'createdby', header: 'Created By' },
    { field: 'createdat', header: 'Created At' },
    { field: 'comments', header: 'Comments' },
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
      Loadassetcreation() {
    this.coreservices.getAssetCreation(this.userid).subscribe({
      next: (res: any) => {
        const parsedRes = typeof res === 'string' ? JSON.parse(res) : res;
        let rawData = parsedRes?.Data ? (typeof parsedRes.Data === 'string' ? JSON.parse(parsedRes.Data) : parsedRes.Data) : [];
        
        this.data = [...rawData.map((item: any, index: number) => ({
          ...item,
          sno: index + 1,
          Main_module: "Project Management",
          Sub_module: "Asset Creation",
          child_Module: "Asset Creation",

          ProjectmanagementAssetcreation:true,
          createdat: item.createdat
            ? item.createdat.split('T')[0]
            : '',
          bo_status: item.bo_status === 'YES' ? 'Approved' : 'Pending',
          ro_status: item.ro_status === 'YES' ? 'Approved' : 'Pending',
          fo_status: item.fo_status === 'YES' ? 'Approved' : 'Pending'
        }))];
      },
      error: (err) => console.error("Error loading assets", err)
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
      openImage(id: any, imageName: string, isVehicle: boolean = false) {
    this.showImagePopup = true;
    this.popupImageUrl = ''; 

    const imageObservable = isVehicle 
      ? this.coreservices.getAssetVehCreationImage(id, imageName)
      : this.coreservices.getAssetCreationImage(id, imageName, this.moduleName);

    imageObservable.subscribe({
      next: (res: any) => {
        const result = typeof res === 'string' ? JSON.parse(res) : res;
        const base64 = result?.Data?.[0]?.img;

        if (base64 && base64 !== "") {
          this.popupImageUrl = 'data:image/png;base64,' + base64;
        } else {
          this.popupImageUrl = 'https://placehold.co/600x400?text=Image+Not+Available';
        }
      },
      error: (err) => {
        console.error("Image load error", err);
        this.popupImageUrl = 'https://placehold.co/600x400?text=Error+Loading+Image';
      }
    });
  }

    
      closeImagePopup() {
        this.showImagePopup = false;
      }
    
       onGridAction(event: { action: string; row: any }) {
  const row = event.row;
  
  switch (event.action) {
    case 'Asset_Creation_View':
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

           case 'veh_image1':
        this.openImage(row.id, row.veh_image1_name, true);
        break;
      case 'veh_image2':
        this.openImage(row.id, row.veh_image2_name, true);
        break;
      case 'veh_image3':
        this.openImage(row.id, row.veh_image3_name, true);
        break;
      case 'veh_image4':
        this.openImage(row.id, row.veh_image4_name, true);
        break;
  
        case 'location':
          this.mappopup = true;
          setTimeout(() => this.openLocationOnMap(row), 100);
          break;
      }
    }
   
    
    
      handleStatusUpdate(payload: any) {
      const module = this.moduleName; 

  let Payload = {  
    "Id": payload.id,
    "comments": payload.comments,
      status :payload.status,
    rejectreason:payload.rejectreason
  };

 if (Payload.status == "NO" && this.userDesignation=="RANGE_OFFICER") {
      this.coreservices.Insertcommonrejectdetails("RO", payload.rejectreason, Payload.Id, module).subscribe({
        next: (res: any) => {
          this.Loadassetcreation();
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
          this.Loadassetcreation();
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
          this.Loadassetcreation();
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
          this.Loadassetcreation();
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
          this.Loadassetcreation();
          this.snackBar.open('Data Saved Successfully!', 'Close', { duration: 3000 });
        },
        error: (err) => {
          console.error('Error saving', err);
        }
      });
    }



  if(Payload.Id !=null && Payload.comments != null){
   this.coreservices.commonUpdates(module,Payload).subscribe({
    next: (res: any) => {
      if (res) {
        this.snackBar.open('Successfully updated', 'Close', { duration: 3000 });
        this.Loadassetcreation(); // Refresh grid
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
  
  
  

