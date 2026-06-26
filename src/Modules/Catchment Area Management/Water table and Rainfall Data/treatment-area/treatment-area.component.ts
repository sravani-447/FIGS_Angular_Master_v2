import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import * as L from 'leaflet';
import { CustomGridComponent } from "../../../../shared/Grids/custom-grid.component";
import { ServerRequests } from "../../../../services/ServerRequests";
import { GridColumn } from "../../../../shared/Grids/grid-column.model";
import jsPDF from 'jspdf';
import * as jspdfAutotable from 'jspdf-autotable';
const autoTable = (jspdfAutotable as any).default || jspdfAutotable;

@Component({
  selector: 'app-treatment-area',
  templateUrl: './treatment-area.component.html',
  styleUrl: './treatment-area.component.css'
})
export class TreatmentAreaComponent implements OnInit{

   @ViewChild('grid') gridComponent!: CustomGridComponent;
     userid: any;
     data: any[] = [];
   
     showImagePopup: boolean = false;
     popupImageUrl: string = '';
    hiddenFields: string[] = []; 
     private map!: L.Map;
     private markers: L.LayerGroup = new L.LayerGroup();
     mappopup: boolean = false;
     disablegrid: boolean = false;
     userDesignation: string = '';
     viewvisiblity: boolean = false;
   
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
     'createdat'
   ];
   
   
   
     ngOnInit(): void {
       this.Loadtreatmentarea();
        this.generateHiddenFields();
     }
   
   generateHiddenFields() {
     this.hiddenFields = this.columns
       .filter(col => !this.primaryFields.includes(col.field))
       .map(col => col.field);
      this.Loadtreatmentarea(); 
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
   { field: 'bo_status', header: 'Status(BO)' },
  { field: 'ro_status', header: 'Status(RO)' },
   { field: 'fo_status', header: 'Status (FO)' },
  { field: 'id', header: 'Id' },
  { field: 'reading_area', header: 'Reading Area' },
  { field: 'date_taken', header: 'Date' },
  { field: 'jfmc_name', header: 'JFMC' },
  { field: 'soil_sample_code', header: 'Soil Sample Code' },

  { field: 'w1_det1', header: 'W1 det1' },
  { field: 'w1_det2', header: 'W1 det2' },
  { field: 'w1_det3', header: 'W1 det3' },
  { field: 'w1_det4', header: 'W1 det4' },
  { field: 'w1_avg', header: 'W1 avg' },

  { field: 'w2_det1', header: 'W2 det1' },
  { field: 'w2_det2', header: 'W2 det2' },
  { field: 'w2_det3', header: 'W2 det3' },
  { field: 'w2_det4', header: 'W2 det4' },
  { field: 'w2_avg', header: 'W2 avg' },

  { field: 'w3_det1', header: 'W3 det1' },
  { field: 'w3_det2', header: 'W3 det2' },
  { field: 'w3_det3', header: 'W3 det3' },
  { field: 'w3_det4', header: 'W3 det4' },
  { field: 'w3_avg', header: 'W3 avg' },

  { field: 'op_name', header: 'Operator Name' },
  { field: 'op_desig', header: 'Operator Designation' },
  { field: 'chk_by_name', header: 'Check By' },
  { field: 'chk_by_desig', header: 'Check By Designation' },
  { field: 'approved_by_name', header: 'Approved By' },
  { field: 'approved_by_desig', header: 'Approved By Designation' },

  { field: 'comments', header: 'Comments' },
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
  },
  {
    field: 'report',
    header: 'Generate Report',
    type: 'actions',
    actions: [
      { icon: 'fa fa-file-pdf', action: 'report', tooltip: 'Generate Report' }
    ]
  }
];

GenerateReport(dataObj: any) {
  const doc = new jsPDF('l', 'mm', 'a4');

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  // Convert title to string
  doc.text((dataObj.reading_area || 'Treatment Area').toString(), 148, 15, { align: 'center' });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  
  // Wrap every number/variable in .toString()
  doc.text('Date Of Sample: ' + (dataObj.date_taken || '').toString(), 20, 25);
  doc.text('District: ' + (dataObj.district || '').toString(), 20, 35);
  doc.text('Range: ' + (dataObj.range || '').toString(), 120, 35);
  doc.text('JFMC: ' + (dataObj.jfmc_name || '').toString(), 20, 45);
  doc.text('GPS: ' + (dataObj.lat || 0).toString() + ', ' + (dataObj.lng || 0).toString(), 120, 45);
  doc.text('Soil Sample Code: ' + (dataObj.soil_sample_code || '').toString(), 20, 55);

  const body = [
    ['1', 'Weight of Empty Container(W1)', dataObj.w1_det1.toString(), dataObj.w1_det2.toString(), dataObj.w1_det3.toString(), dataObj.w1_det4.toString(), dataObj.w1_avg.toString()],
    ['2', 'Weight of Empty Container(W2)', dataObj.w2_det1.toString(), dataObj.w2_det2.toString(), dataObj.w2_det3.toString(), dataObj.w2_det4.toString(), dataObj.w2_avg.toString()],
    ['3', 'Weight of Empty Container(W3)', dataObj.w3_det1.toString(), dataObj.w3_det2.toString(), dataObj.w3_det3.toString(), dataObj.w3_det4.toString(), dataObj.w3_avg.toString()],
    ['', 'Calculation', '', '', '', '', ''],
    ['4', 'Weight of water=W2-W3', 
        (dataObj.w2_det1 - dataObj.w3_det1).toFixed(2), 
        (dataObj.w2_det2 - dataObj.w3_det2).toFixed(2), 
        (dataObj.w2_det3 - dataObj.w3_det3).toFixed(2), 
        (dataObj.w2_det4 - dataObj.w3_det4).toFixed(2), 
        (dataObj.w2_avg - dataObj.w3_avg).toFixed(2)],
    ['5', 'Weight of Solid=W3-W1', 
        (dataObj.w3_det1 - dataObj.w1_det1).toFixed(2), 
        (dataObj.w3_det2 - dataObj.w1_det2).toFixed(2), 
        (dataObj.w3_det3 - dataObj.w1_det3).toFixed(2), 
        (dataObj.w3_det4 - dataObj.w1_det4).toFixed(2), 
        (dataObj.w3_avg - dataObj.w1_avg).toFixed(2)]
  ];

  // Pass doc as the first argument to autoTable
  autoTable(doc, {
    startY: 70,
    head: [['S.No', 'Description', 'W1', 'W2', 'W3', 'W4', 'Avg']],
    body: body,
    theme: 'grid',
    styles: { halign: 'center' }
  });

  // Access finalY via the doc instance
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  
  doc.setFont("helvetica", "bold");
  doc.text('Operator', 50, finalY);
  doc.text('Checked By', 130, finalY);
  doc.text('Approved By', 210, finalY);
  
  doc.setFont("helvetica", "normal");
  doc.text((dataObj.op_name || '').toString() + ' (' + (dataObj.op_desig || '').toString() + ')', 50, finalY + 10);
  doc.text((dataObj.chk_by_name || '').toString() + ' (' + (dataObj.chk_by_desig || '').toString() + ')', 130, finalY + 10);
  doc.text((dataObj.approved_by_name || '').toString() + ' (' + (dataObj.approved_by_desig || '').toString() + ')', 210, finalY + 10);

  doc.save("TreatmentArea_Report.pdf");
}

     // ================= LOAD DATA =================
     Loadtreatmentarea() {
    this.coreservices.getCatchmentReadingControlTreatment(this.userid).subscribe({
      next: (res: any) => {
        const parsedRes = typeof res === 'string' ? JSON.parse(res) : res;
        let rawData = parsedRes?.Data ? (typeof parsedRes.Data === 'string' ? JSON.parse(parsedRes.Data) : parsedRes.Data) : [];
        sessionStorage.setItem("CatchmenTechnical",JSON.stringify(rawData))
        this.data = [...rawData.map((item: any, index: number) => ({
          ...item,
          catchmentsmcwatertreatment:true,
          Main_module: "Catchment Area Management",
          Sub_module: "Water Table and Rainfall Data",
          child_Module: "Treatment Area",

          sno: index + 1,
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

    this.coreservices.getTreatmentImage(id, imageName, 'cm_reading_control_treatment').subscribe({
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

       case 'report':
      this.GenerateReport(row);
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
    const module = "cm_reading_control_treatment";

    let Payload = {
      "Id": payload.id,
      "comments": payload.comments,
      status: payload.status,
      rejectreason: payload.rejectreason
    };

    if (Payload.status == "NO" && this.userDesignation == "RANGE_OFFICER") {
      this.coreservices.Insertcommonrejectdetails("RO", payload.rejectreason, Payload.Id, module).subscribe({
        next: (res: any) => {
          this.Loadtreatmentarea();
          this.snackBar.open('Data Saved Successfully!', 'Close', { duration: 3000 });
        },
        error: (err) => {
          console.error('Error saving', err);
        }
      });
    }
    else if (Payload.status == "NO" && this.userDesignation == "BEAT_OFFICER") {
      this.coreservices.Insertcommonrejectdetails("BO", payload.rejectreason, Payload.Id, module).subscribe({
        next: (res: any) => {
          this.Loadtreatmentarea();
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
          this.Loadtreatmentarea();
          this.snackBar.open('Data Saved Successfully!', 'Close', { duration: 3000 });
        },
        error: (err) => {
          console.error('Error saving', err);
        }
      });
    }
    else if (this.userDesignation == "BEAT_OFFICER" && Payload.status == "YES") {
      this.coreservices.CommonApprovalforallroles("BO", "RO", Payload.Id, module).subscribe({
        next: (res: any) => {
          this.Loadtreatmentarea();
          this.snackBar.open('Data Saved Successfully!', 'Close', { duration: 3000 });
        },
        error: (err) => {
          console.error('Error saving', err);
        }
      });
    }
    else if (this.userDesignation == "RANGE_OFFICER" && Payload.status == "YES") {
      this.coreservices.commonApprovedByRangeo(Payload.Id, module).subscribe({
        next: (res: any) => {
          this.Loadtreatmentarea();
          this.snackBar.open('Data Saved Successfully!', 'Close', { duration: 3000 });
        },
        error: (err) => {
          console.error('Error saving', err);
        }
      });
    }



    if (Payload.Id != null && Payload.comments != null) {
      this.coreservices.commonUpdates(module,Payload).subscribe({
        next: (res: any) => {
          if (res) {
            this.snackBar.open('Successfully updated', 'Close', { duration: 3000 });
            this.Loadtreatmentarea(); // Refresh grid
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
 
 
 