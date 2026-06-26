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
  selector: 'app-creditlinkage.component.component',
  templateUrl: './creditlinkage.component.html',
  styleUrls: ['./creditlinkage.component.css']
})
export class creditlinkageComponent implements OnInit {

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
            'actions',
            'createdat',
            'jfmc_name',
            'shg_name',
            'loan_id'
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
    this.loadCreditlinkagedata();
     this.generateHiddenFields();
  }

     generateHiddenFields() {
      this.hiddenFields = this.columns
        .filter(col => !this.primaryFields.includes(col.field))
        .map(col => col.field);
       this.loadCreditlinkagedata(); 
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
    { field: 'jfmc_name', header: 'Committee Name' },
  { field: 'sel_mode', header: 'Committee Type' },
  { field: 'shg_name', header: 'SHG & JLG Name' },
  { field: 'loan_id', header: 'Loan ID' },
  { field: 'loan_disbursed_by', header: 'Loan Disbursed By' },
  { field: 'bank_name', header: 'Bank Name' },
  { field: 'loan_disb_date', header: 'Disbursement Date' },
  { field: 'amount_disb', header: 'Amount Disbursed' },
  { field: 'intrerest_rate_on_loan', header: 'Interest Rate' },
  { field: 'loan_perion_month', header: 'Loan Period (Months)' },
  { field: 'comments', header: 'Comments' },
  { field: 'createdby', header: 'User Name' },
    { field: 'createdat', header: 'Creation Date' },

    {
      field: 'image1_name',
      header: 'Image 1',
      type: 'actions',
      actions: [{ icon: 'fa fa-image', action: 'Image1' }]
    },
    {
      field: 'image2_name',
      header: 'Image 2',
      type: 'actions',
      actions: [{ icon: 'fa fa-image', action: 'Image2' }]
    },
{field: 'fo_rej_comments', header: 'FO Reject Comments' },
{ field: 'bo_rej_comments', header: 'BO Reject Comments' },
  { field: 'ro_rej_comments', header: 'RO Reject Comments' },
  
    {
      field: "location",
      header: "Location",
      type: "actions",
      actions: [
        { icon: "fa fa-map-marker", action: "location", tooltip: "View on Map" }
      ]
    }
  ];
    
  // ================= LOAD DATA =================
 loadCreditlinkagedata() {
  this.coreservices.getCredditlinkagedatalist(this.userid).subscribe({
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
          Main_module: "SHG",
          Sub_module: "SHG",
          child_Module: "SHG Credit Linkage",

          sno: index + 1,

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


  onGridAction(event: { action: string; row: any }) {
    const row = event.row;

    switch (event.action) {
      case 'gradation':
        this.downloadGradationPdf(row.id);
        break;

      case 'regulation':
        this.downloadRegulationPdf(row.id);
        break;

      case 'Image1':
        this.openImage(row.id, 'img1');
        break;

      case 'Image2':
        this.openImage(row.id, 'img2');
        break;
      case 'location':
        this.mappopup = true;
        setTimeout(() => {
          this.openLocationOnMap(row);
        }, 100);
        break;
    }
  }
 
  openImage(id: string, imageName: string) {
    this.showImagePopup = true;
    this.popupImageUrl = '';

    this.coreservices.getCreditlinkageImages(id, imageName).subscribe({
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

  // ================= PDF =================
  downloadGradationPdf(id: number) {
    window.open(`http://183.82.114.29:9094/SHGJLG/DownloadGradation_pdf?id=${id}`, '_blank');
  }

  downloadRegulationPdf(id: number) {
    window.open(`http://183.82.114.29:9094/SHGJLG/DownloadRegulation_pdf?id=${id}`, '_blank');
  }
 
  handleStatusUpdate(payload: any) {
    console.log(payload);
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
      comments: payload.comments,
      status: payload.status,
      rejectreason: payload.rejectreason,

    };

    console.log("Final Payload => ", Payload);
    if (Payload.comments != undefined && Payload.status != "NO" && Payload.status != "YES") {
      this.coreservices.InsertCreditLinkagedetails(Payload).subscribe({
        next: (res: any) => {
          this.loadCreditlinkagedata();
          this.snackBar.open('Data Saved Successfully!', 'Close', { duration: 3000 });
        },
        error: (err) => {
          console.error('Error saving', err);
        }
      });
    }
    else if (Payload.status == "NO") {
      this.coreservices.Insertcommonrejectdetails("RO", Payload.rejectreason, Payload.Id, "shg_creditlinkage").subscribe({
        next: (res: any) => {
          this.loadCreditlinkagedata();
          this.snackBar.open('Data Saved Successfully!', 'Close', { duration: 3000 });
        },
        error: (err) => {
          console.error('Error saving', err);
        }
      });
    }
    else if (this.userDesignation == "FIELD_OFFICER" && Payload.status == "YES") {
      this.coreservices.CommonApprovalforallroles("FO", "BO", Payload.Id, "shg_creditlinkage").subscribe({
        next: (res: any) => {
          this.loadCreditlinkagedata();
          this.snackBar.open('Data Saved Successfully!', 'Close', { duration: 3000 });
        },
        error: (err) => {
          console.error('Error saving', err);
        }
      });
    }
    else if (this.userDesignation == "BEAT_OFFICER" && Payload.status == "YES") {
      this.coreservices.CommonApprovalforallroles("BO", "RO", Payload.Id, "shg_creditlinkage").subscribe({
        next: (res: any) => {
          this.loadCreditlinkagedata();
          this.snackBar.open('Data Saved Successfully!', 'Close', { duration: 3000 });
        },
        error: (err) => {
          console.error('Error saving', err);
        }
      });
    }
    else if (this.userDesignation == "RANGE_OFFICER" && Payload.status == "YES") {
      this.coreservices.commonforallrolesapprovedrangedetails(Payload.Id, "shg_creditlinkage").subscribe({
        next: (res: any) => {
          this.loadCreditlinkagedata();
          this.snackBar.open('Data Saved Successfully!', 'Close', { duration: 3000 });
        },
        error: (err) => {
          console.error('Error saving', err);
        }
      });
    }
  }
}