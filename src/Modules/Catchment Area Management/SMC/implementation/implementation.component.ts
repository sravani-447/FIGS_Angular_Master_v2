import { Component, OnInit, ViewChild } from "@angular/core";
import { GridColumn } from "../../../../shared/Grids/grid-column.model";
import { ServerRequests } from "../../../../services/ServerRequests";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import * as L from 'leaflet';
import { CustomGridComponent } from "../../../../shared/Grids/custom-grid.component";

@Component({
  selector: 'app-implementation',
  templateUrl: './implementation.component.html',
  styleUrl: './implementation.component.css'
})
export class ImplementationComponent implements OnInit{

    @ViewChild('grid') gridComponent!: CustomGridComponent;
  
 data: any[] = [];
  userid: any;
  userDesignation: string = '';
  LiveStockDetailsf: any[] = [];
   hiddenFields: string[] = []; 

  showImagePopup: boolean = false;
  isEditOpen: boolean = false;
  editComments: string = '';
  selectedId: number | null = null;
  popupImageUrl: string = '';
  selectedImageSrc: string = '';
  mappopup: boolean = false;
  disablegrid: boolean = false;
  viewvisiblity: boolean=false;
  structureId: string = '';
  typeOfStructure: string = '';
  comments: string = '';
   private map!: L.Map;
    private markers: L.LayerGroup = new L.LayerGroup();

  private primaryFields = [
    'sno',
    'structure_id',
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
        this.loadimplementationdata();
         this.generateHiddenFields();
      }
  
       generateHiddenFields() {
    this.hiddenFields = this.columns
      .filter(col => !this.primaryFields.includes(col.field))
      .map(col => col.field);
     this.loadimplementationdata(); 
    console.log('Automatically hidden fields:', this.hiddenFields);
  }
    
      // ================= LOAD DATA =================
    loadimplementationdata() {
  this.coreservices.getAllCatchmentImplementation(this.userid).subscribe({
    next: (res: any) => {
      let parsedRes = typeof res === 'string' ? JSON.parse(res) : res;
        let rawData = parsedRes?.Data ? JSON.parse(parsedRes.Data) : [];
        sessionStorage.setItem("Catchmentimplementation",JSON.stringify(rawData))
      this.data = rawData.map((item: any, index: number) => ({
        ...item,
        sno: index + 1,
        CatchmentSmcImplementation:true,
        Main_module: "Catchment Area Management",
        Sub_module: "SMC",
        child_Module: "Implementation",

        createdat: item.createdat
            ? item.createdat.split('T')[0]
            : '',
        bo_status: item.bo_status === 'YES' ? 'Approved' : 'Pending',
        ro_status: item.ro_status === 'YES' ? 'Approved' : 'Pending',
        fo_status: item.fo_status === 'YES' ? 'Approved' : 'Pending'
      }));
      },
      error: (err: any) => {
        this.snackBar.open('Failed to load data', 'Close', { duration: 3000 });
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
    
     

      // ================= GRID COLUMNS =================
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

  { field: 'id', header: 'ID' },
  { field: 'structure_id', header: 'Structure Id' },
  { field: 'mode', header: 'Mode' },

  { field: 'jungle_cleaning_done', header: 'Is Jungle Cleaning Done' },
  { field: 'surface_evacution_done', header: 'Surface Evacution Done' },
  { field: 'earthwork_cutting_done', header: 'Earthwork Cutting Done' },
  { field: 'len', header: 'Length' },
  { field: 'breadth', header: 'Breadth' },
  { field: 'depth', header: 'Depth' },
  { field: 'earth_work_done_bottom', header: 'Earth work done at bottom Level' },
  { field: 'earth_work_done_middle', header: 'Earth work done at middle Level' },
  { field: 'earth_work_done_top', header: 'Earth work done at Top Level' },
  { field: 'spillway_type', header: 'Spillway type' },
  { field: 'spl_length', header: 'Length' },
  { field: 'spl_width', header: 'Width' },
  { field: 'spl_bot_width', header: 'Bottom width' },
  { field: 'spl_height', header: 'height' },
  { field: 'turfing_done', header: 'Is Turfing Done' },
  { field: 'md_male', header: 'Man Days male' },
  { field: 'md_female', header: 'Man Days female' },
  { field: 'md_total_cost', header: 'Man Days Total Cost' },
  { field: 'md_actual_exp', header: 'Man Days Actual Exp' },
  { field: 'sign_board', header: 'Sign Board' },

  {
  field: 'master_roll_pdf_name',
  header: 'Master Roll',
  type: 'actions',
  actions: [{ icon: 'fa fa-file-pdf', action: 'masterRollPdf' }] 
},

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


      // ================= GRID ACTION =================
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
      }

      setTimeout(() => {
        if (this.gridComponent) {
          this.gridComponent.openViewPopupFromOutside(rowToView);
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
    case 'masterRollPdf': // Ensure this matches the 'action' string in your column
      const fileName = row.master_roll_pdf_name || 'Master_Roll.pdf';
      this.DownloadPdf(row, fileName);
      break;
  }
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

    this.coreservices.getNurseryImage(id, imageName, 'catchment_smc_implementation').subscribe({
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
  
  if (this.popupImageUrl && this.popupImageUrl.startsWith('blob:')) {
    URL.revokeObjectURL(this.popupImageUrl);
  }
  this.popupImageUrl = '';
}

DownloadPdf(row: any, fileName: string) {
  this.coreservices.getCatchmentImplementationPdf(row.id).subscribe({
    next: (blob: Blob) => {
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName || "Document.pdf";
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
    error: (err) => {
      console.error('Download Error:', err);
      this.snackBar.open('Failed to download PDF', 'Close', { duration: 3000 });
    }
  });
}




      handleStatusUpdate(payload: any) {
          const module = "catchment_smc_implementation"; 

 let Payload = {  
    Id: payload.id,
    len: payload.len,
    breadth: payload.breadth,
    depth: payload.depth,
    spl_length: payload.spl_length,
    spl_width: payload.spl_width,
    spl_bot_width: payload.spl_bot_width,
    spl_height: payload.spl_height,
    md_male: payload.md_male,
    md_female: payload.md_female,
    md_total_cost: payload.md_total_cost,
    md_actual_exp: payload.md_actual_exp,
    comments: payload.comments,
    status: payload.status,
    rejectreason: payload.rejectreason
  };

 if (Payload.status === "NO" && this.userDesignation === "RANGE_OFFICER") {
    this.coreservices.Insertcommonrejectdetails("RO", payload.rejectreason, Payload.Id, module).subscribe({
      next: () => { this.loadimplementationdata(); this.snackBar.open('Rejected Successfully', 'Close', { duration: 3000 }); }
    });
  } 
  else if (Payload.status === "NO" && this.userDesignation === "BEAT_OFFICER") {
    this.coreservices.Insertcommonrejectdetails("BO", payload.rejectreason, Payload.Id, module).subscribe({
      next: () => { this.loadimplementationdata(); this.snackBar.open('Rejected Successfully', 'Close', { duration: 3000 }); }
    });
  }
  else if (this.userDesignation === "FIELD_OFFICER" && Payload.status === "YES") {
    this.coreservices.CommonApprovalforallroles("FO", "BO", Payload.Id, module).subscribe({
      next: () => { this.loadimplementationdata(); this.snackBar.open('Approved Successfully', 'Close', { duration: 3000 }); }
    });
  }
  else if (this.userDesignation === "BEAT_OFFICER" && Payload.status === "YES") {
    this.coreservices.CommonApprovalforallroles("BO", "RO", Payload.Id, module).subscribe({
      next: () => { this.loadimplementationdata(); this.snackBar.open('Approved Successfully', 'Close', { duration: 3000 }); }
    });
  }
   else if (this.userDesignation == "RANGE_OFFICER" && Payload.status == "YES") {
      this.coreservices.commonforallrolesapprovedrangedetails(Payload.Id,module).subscribe({
        next: (res: any) => {
          this.loadimplementationdata();
          this.snackBar.open('Data Saved Successfully!', 'Close', { duration: 3000 });
        },
        error: (err) => {
          console.error('Error saving', err);
        }
      });
    }

  if(Payload.Id !=null && Payload.comments != null){
    this.coreservices.updateImplementationDetails(Payload).subscribe({
      next: (res: any) => {
        if (res && (res.status === true || res === true)) {
          this.snackBar.open('Technical Details Updated', 'Close', { duration: 3000 });
          this.loadimplementationdata();
        }
      }
    });
  }
}
  
  

}
