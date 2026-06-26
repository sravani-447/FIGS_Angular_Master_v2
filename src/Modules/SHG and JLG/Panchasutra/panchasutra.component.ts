import { Component, OnInit, ViewChild } from "@angular/core";
import { GridColumn } from "../../../shared/Grids/grid-column.model";
import { ServerRequests } from "../../../services/ServerRequests";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import * as L from 'leaflet';
import { CustomGridComponent } from "../../../shared/Grids/custom-grid.component";
import { PDFDocument } from 'pdf-lib';

@Component({
  selector: 'app-panchasutra.component',
  templateUrl: './panchasutra.component.html',
  styleUrls: ['./panchasutra.components.css']
})
export class panchasutraComponent implements OnInit {
  @ViewChild('grid') gridComponent!: CustomGridComponent;
  userid: any;
  data: any[] = [];
  hiddenFields: string[] = [];
 
  showImagePopup: boolean = false;
  popupImageUrl: string = '';
 
  selectedRow: any;
  showPdfPopup: boolean = false;
  selectedPdfFile: File | null = null;
  currentPdfType: 'gradation' | 'regulation' | null = null;
  pdfUploadedMap: { [key: string]: boolean } = {};
 
  private map!: L.Map;
  private markers: L.LayerGroup = new L.LayerGroup();
  mappopup: boolean = false;
  userDesignation: any;
 
  private primaryFields = [
    'sno',
    'bo_status',
    'ro_status',
    'fo_status',
    'user_name',
    'createdby',
    'createdat',
    'actions',
    'fo_status_display',
    'bo_status_display',
    'ro_status_display',
    'jfmc_name',
    'shg_name',
    'date_of_meeting'
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
    this.loadPanchasutradata();
    this.generateHiddenFields();
  }
 
  generateHiddenFields() {
    this.hiddenFields = this.columns
      .filter(col => !this.primaryFields.includes(col.field))
      .map(col => col.field);
    this.loadPanchasutradata();
    console.log('Automatically hidden fields:', this.hiddenFields);
  }
 
  // ================= LOAD DATA =================
  loadPanchasutradata() {
    this.coreservices.getPanchasutradatalist(this.userid).subscribe({
      next: (res: any) => {
        let parsedRes = typeof res === 'string' ? JSON.parse(res) : res;
        let rawData: any[] = parsedRes?.Data || [];
 
        this.data = rawData.map((item: any, index: number) => ({
          ...item,
          sno: index + 1,
 
          fo_status_display: this.getStatusLabel(item.fo_status, item.fo_rej_comments),
          bo_status_display: this.getStatusLabel(item.bo_status, item.bo_rej_comments),
          ro_status_display: this.getStatusLabel(item.ro_status, item.ro_rej_comments),
 
          createdat: item.createdat ? item.createdat.split('T')[0] : '',
          date_of_meeting: item.date_of_meeting ? item.date_of_meeting.split('T')[0] : '',
 
          bo_status: item.bo_status === 'YES' ? 'Approved' : 'Pending',
          ro_status: item.ro_status === 'YES' ? 'Approved' : 'Pending',
          fo_status: item.fo_status === 'YES' ? 'Approved' : 'Pending'
        }));
 
        sessionStorage.setItem('Panchasutra', JSON.stringify(this.data));
 
        setTimeout(() => {
          this.initMap();
          this.loadMarkers();
        }, 300);
      },
 
      error: (err: any) => {
        console.error(err);
        this.snackBar.open('Failed to load SHG data', 'Close', { duration: 3000 });
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
      .setView([17.3850, 78.4867], 6);
 
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
          .bindPopup(this.getPopupHTML(item));
        this.markers.addLayer(marker);
      }
    });
  }
 
  // ================= GRID COLUMNS =================
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
    { field: 'id', header: 'id' },
    { field: 'fo_status_display', header: 'Status (FO)' },
    { field: 'bo_status_display', header: 'Status (BO)' },
    { field: 'ro_status_display', header: 'Status (RO)' },
    { field: 'jfmc_name', header: 'Committee Name' },
    { field: 'sel_mode', header: 'Committee Type' },
    { field: 'shg_name', header: 'SHG & JLG Name' },
    { field: 'date_of_meeting', header: 'Meeting Date' },
    { field: 'social_category', header: 'Social Category' },
    { field: 'shg_activity', header: 'Type Of Activity' },
    { field: 'total_amt_collect_meeting', header: 'Amount Collected' },
    { field: 'is_interlanding', header: 'Interlanding' },
    { field: 'is_record_maintenance', header: 'Record Maintenance' },
    { field: 'is_regular_payment', header: 'Regular Payment' },
    { field: 'is_regular_saving', header: 'Regular Saving' },
    { field: 'ro_rej_comments', header: 'Ro Rejected Comments' },
    { field: 'bo_rej_comments', header: 'Bo Rejected Comments' },
 
    {
      field: 'gradation_pdf_name',
      header: 'Gradation Pdf',
      type: 'actions',
      actions: [{ icon: 'fa fa-file-pdf', action: 'gradation' }]
    },
    {
      field: 'regulation_pdf_name',
      header: 'Resolution Pdf',
      type: 'actions',
      actions: [{ icon: 'fa fa-file-pdf', action: 'regulation' }]
    },
 
    { field: 'comments', header: 'Comments' },
    { field: 'createdby', header: 'User Name' },
    { field: 'createdat', header: 'Creation Date' },
 
    {
      field: "image1_name",
      header: 'Image 1',
      type: 'actions',
      actions: [{ icon: 'fa fa-image', action: 'Image1' }]
    },
    {
      field: "image2_name",
      header: 'Image 2',
      type: 'actions',
      actions: [{ icon: 'fa fa-image', action: 'Image2' }]
    },
    {
      field: "location",
      header: "Location",
      type: "actions",
      actions: [
        { icon: "fa fa-map-marker", action: "location", tooltip: "View on Map" }
      ]
    }
  ];
 
  // ================= GRID ACTION =================
  onGridAction(event: { action: string; row: any }) {
    const row = event.row;
 
    switch (event.action) {
      case 'gradation':
        this.openPdfPopup(row, 'gradation');
        break;
 
      case 'regulation':
        this.openPdfPopup(row, 'regulation');
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
 
  // ================= MAP POPUP =================
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
 
    this.coreservices.getPanchasutraImages(id, imageName).subscribe({
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
 
  // ================= PDF POPUP =================
  openPdfPopup(row: any, type: 'gradation' | 'regulation') {
    this.selectedRow = row;
    this.selectedPdfFile = null;
    this.currentPdfType = type;
 
    const key = `${type}_${row.id}`;
 
    if (this.pdfUploadedMap[key] === undefined) {
      this.pdfUploadedMap[key] = false;
    }
 
    this.showPdfPopup = true;
  }
 
  closePdfPopup() {
    this.showPdfPopup = false;
    this.selectedPdfFile = null;
    this.currentPdfType = null;
  }
 
  onPdfFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedPdfFile = input.files[0];
    }
  }
 isPdfUploaded(): boolean {
  if (!this.selectedRow) return false;

  // Ensure any item data is cached if needed
  sessionStorage.setItem('pdf', JSON.stringify(this.selectedRow));

  if (this.currentPdfType === 'gradation') {
    // Handles boolean true, string "true", or numeric 1 values safely
    return this.selectedRow.gradationfile_status === true || 
           this.selectedRow.gradationfile_status === 'true' || 
           this.selectedRow.gradationfile_status === 1;
  } else {
     return this.selectedRow.regulationfile_status === true || 
           this.selectedRow.regulationfile_status === 'true' || 
           this.selectedRow.regulationfile_status === 1;
    
  }
}

  private getByteArray(file: File): Promise<number[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          const array = Array.from(new Uint8Array(reader.result));
          resolve(array);
        } else {
          reject(new Error('Failed to convert file to ArrayBuffer.'));
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  }
 
  async uploadPdf() {
   
    if (!this.selectedPdfFile || !this.selectedRow || !this.currentPdfType) return;

    let fileToUpload = this.selectedPdfFile;
    const maxSizeBytes = 5 * 1024 * 1024; // 5MB

    if (fileToUpload.size > maxSizeBytes) {
      alert('File exceeds 5MB. Attempting compression...');
      
      try {
        fileToUpload = await this.compressPdf(fileToUpload);
        
        if (fileToUpload.size > maxSizeBytes) {
          this.snackBar.open('Even after compression, file is larger than 5MB.', 'Close', { duration: 3000 });
          return;
        }
      } catch (compressError) {
        console.error('Compression failed:', compressError);
        this.snackBar.open('Could not compress PDF automatically.', 'Close', { duration: 3000 });
        return;
      }
    }

    try {
      const byteArray = await this.getByteArray(fileToUpload);

      const payload = {
        Modulename: 'y_shg.panchsutra',
        filename: fileToUpload.name,
        File: byteArray,
        Filetype: this.currentPdfType,
        id: this.selectedRow.id
      };

      const upload$ = this.currentPdfType === 'gradation'
        ? this.coreservices.commonuploadPdf(payload)
        : this.coreservices.commonuploadPdf(payload);
        
     

      upload$.subscribe({
        next: () => {
          // this.pdfUploadedMap[`${this.currentPdfType}_${this.selectedRow.id}`] = true;
          this.showPdfPopup = false;
          this.snackBar.open('PDF uploaded successfully!', 'Close', { duration: 3000 });
        },
        error: (err: any) => {
          console.error(err);
          this.snackBar.open('Failed to upload PDF', 'Close', { duration: 3000 });
        }
      });
    } catch (error) {
      console.error('Error processing PDF file:', error);
      this.snackBar.open('Failed to process the selected PDF file.', 'Close', { duration: 3000 });
    }
  }

async compressPdf(file: File): Promise<File> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const compressedPdfDoc = await PDFDocument.create();
  
  const copiedPages = await compressedPdfDoc.copyPages(pdfDoc, pdfDoc.getPageIndices());
  copiedPages.forEach((page) => compressedPdfDoc.addPage(page));
  
  const compressedBytes = await compressedPdfDoc.save();
  
  // FIX: Cast to any to override the compiler's strict type checking
  return new File([compressedBytes as any], file.name, { type: 'application/pdf' });
}

  downloadCurrentPdf() {
  const payload = {
      Modulename: 'y_shg.panchsutra',
      id: this.selectedRow.id
    };
    if (this.currentPdfType === 'gradation') {
      this.downloadGradationPdf();
    } else {
      this.downloadRegulationPdf();
    }
  }
 
  downloadGradationPdf() {
    const payload = {
      ModuleName: 'y_shg.panchsutra',
      Id: this.selectedRow.id
    };
this.coreservices.downloadpdf(payload).subscribe({
  next: (res: any) => {
    const parsedRes = typeof res === 'string' ? JSON.parse(res) : res;

    const pdfData = parsedRes[0].gradation_pdf;
    const fileName = parsedRes[0].gradation_pdf_name || 'gradation.pdf';

    if (pdfData && fileName.toLowerCase().includes('.pdf')) {

      const hexString = pdfData.replace(/^\\x/, '');

      const bytes = new Uint8Array(
        hexString.match(/.{1,2}/g)!.map((byte: string) => parseInt(byte, 16))
      );

      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();

      window.URL.revokeObjectURL(url);
    }
  },
  error: (err: any) => {
    console.error(err);
  }
});
  }

 
downloadRegulationPdf() {
  const payload = {
    ModuleName: 'y_shg.panchsutra',
    Id: this.selectedRow.id
  };

  this.coreservices.downloadpdf(payload).subscribe({
    next: (res: any) => {
      const parsedRes = typeof res === 'string' ? JSON.parse(res) : res;
      
      // Ensure the response array actually has elements to prevent undefined errors
      if (!parsedRes || parsedRes.length === 0) {
        alert("No Record Found!");
        return;
      }

      // 1. Note: Your C# backend maps data to 'gradation_pdf' even for Resolution files!
      // If your backend SQL select query aliases it as 'regulation_pdf', keep that. 
      // Otherwise, change this to parsedRes[0].gradation_pdf
      const pdfData = parsedRes[0].gradation_pdf || parsedRes[0].regulation_pdf;
      const fileName = parsedRes[0].gradation_pdf_name || parsedRes[0].regulation_pdf_name || 'resolution.pdf';

      if (!pdfData || pdfData.trim() === "") {
        alert("No Record Found!");
        return;
      }

      if (pdfData && fileName.toLowerCase().includes('.pdf')) {
        // Remove PostgreSQL hex prefix escaping if present (\x)
        const hexString = pdfData.replace(/^\\x/, '');

        // Safely parse the hex chunks into bytes
        const matches = hexString.match(/.{1,2}/g);
        if (!matches) {
          alert("Error parsing document file data.");
          return;
        }

        const bytes = new Uint8Array(
          matches.map((byte: string) => parseInt(byte, 16))
        );

        const blob = new Blob([bytes], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();

        window.URL.revokeObjectURL(url);
      }
    },
    error: (err: any) => {
      console.error('Error downloading document:', err);
      alert("An error occurred while fetching the document.");
    }
  });
}
 
  // ================= LOCATION =================
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
 
  // ================= STATUS UPDATE =================
  handleStatusUpdate(payload: any) {
    let row = payload.Data && payload.Data.length ? payload.Data[0] : {};
 
    let Payload = {
      Id: payload.id || row.id || 0,
      comments: payload.comments,
      total_amt_collect_meeting: payload.total_amt_collect_meeting,
      status: payload.status,
      rejectreason: payload.rejectreason
    };
 
    if (Payload.comments != undefined && Payload.status != "NO" && Payload.status != "YES") {
      this.coreservices.updatePancahsutradetails(Payload).subscribe({
        next: (res: any) => {
          this.loadPanchasutradata();
          this.snackBar.open('Data Saved Successfully!', 'Close', { duration: 3000 });
        }
      });
    }
    else if (Payload.status == "NO") {
      let roleCode = "RO";
      if (this.userDesignation === 'FIELD_OFFICER') roleCode = "FO";
      else if (this.userDesignation === 'BEAT_OFFICER') roleCode = "BO";
 
      this.coreservices.Insertcommonrejectdetails(roleCode, Payload.rejectreason, Payload.Id, "shg_panchsutra").subscribe({
        next: (res: any) => {
          this.loadPanchasutradata();
          this.snackBar.open('Rejected Successfully!', 'Close', { duration: 3000 });
        }
      });
    }
    else if (this.userDesignation == "FIELD_OFFICER" && Payload.status == "YES") {
      this.coreservices.CommonApprovalforallroles("FO", "BO", Payload.Id, "shg_panchsutra").subscribe({
        next: (res: any) => {
          this.loadPanchasutradata();
          this.snackBar.open('Sent for BO Approval!', 'Close', { duration: 3000 });
        }
      });
    }
    else if (this.userDesignation == "BEAT_OFFICER" && Payload.status == "YES") {
      this.coreservices.CommonApprovalforallroles("BO", "RO", Payload.Id, "shg_panchsutra").subscribe({
        next: (res: any) => {
          this.loadPanchasutradata();
          this.snackBar.open('Sent for RO Approval!', 'Close', { duration: 3000 });
        }
      });
    }
    else if (this.userDesignation == "RANGE_OFFICER" && Payload.status == "YES") {
      this.coreservices.commonforallrolesapprovedrangedetails(Payload.Id, "shg_panchsutra").subscribe({
        next: (res: any) => {
          this.loadPanchasutradata();
          this.snackBar.open('Approved Successfully!', 'Close', { duration: 3000 });
        }
      });
    }
  }
}