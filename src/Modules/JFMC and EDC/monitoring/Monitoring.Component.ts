import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as L from 'leaflet';
import { ServerRequests } from '../../../services/ServerRequests';
import { GridColumn } from '../../../shared/Grids/grid-column.model';
import { HttpClient } from "@angular/common/http";
import { CustomGridComponent } from "../../../shared/Grids/custom-grid.component";

@Component({
  selector: 'app-monitoring',
  templateUrl: './monitoring.component.html',
  styleUrls: ['./monitoring.component.css']
})
export class MonitoringComponent implements OnInit {

  @ViewChild('grid') gridComponent!: CustomGridComponent;
  hiddenFields: string[] = [];
  showImagePopup: boolean = false;
  isEditOpen: boolean = false;
  editComments: string = '';
  popupImageUrl: string = '';
  mappopup: boolean = false;
  disablegrid: boolean = false;
  
  userid: any;
  userDesignation: string = ''; // Added back for button visibility
  data: any[] = [];
  selectedRecordId: number | null = null;
  private map!: L.Map;
  private markers: L.LayerGroup = new L.LayerGroup();

  private primaryFields = ['user_name', 'createdby', 'createdbyuser', 'actions', 'createdat', 'jfmc_name', 'sel_mode'];

  constructor(
    private coreservices: ServerRequests,
    private snackBar: MatSnackBar,
    private http: HttpClient
  ) {
    const session = sessionStorage.getItem("Session");
    if (session) {
      const sessionDetails = JSON.parse(session);
      this.userid = sessionDetails.Data[0].user_id;
      // Capture designation for role-based buttons
      this.userDesignation = (sessionDetails.Data[0].designation || sessionDetails.Data[0].user_type || '').toUpperCase();
    }
  }

  ngOnInit(): void {
    this.loadMonitoringData();
    this.initColumns(); // Call column init separately to ensure designation is loaded
  }

  // ================= COLUMN DEFINITION =================
  columns: GridColumn[] = [];

  initColumns() {
    this.columns = [
      {
        field: 'actions',
        header: 'Actions',
        type: 'actions',
        actions: [
          { label: 'view', action: 'monitoring_view', tooltip: 'view', icon: "" },
        ]
      },
     { field: 'jfmc_name', header: 'Committee Name' },
    { field: 'sel_mode', header: 'Committee Type' },
    { field: 'grading_rating_iga', header: 'Grading & Rating IGA' },
    { field: 'revolving_fund', header: 'Revolving Fund' },
    { field: 'is_accounting', header: 'Accounting Done' },
    { field: 'plantation_assets', header: 'Plantation Assets' },
    { field: 'smc_assets', header: 'SMC Assets' },
    { field: 'for_prot_status', header: 'Forest Prot Status' },
    { field: 'date_cashbook_update', header: 'Last Cashbook Update' },
    { field: 'is_society_register', header: 'Society Reg Done' },
    { field: 'registration_num', header: 'Reg No' },
    { field: 'is_financial_audit', header: 'Financial Audit' },
    { field: 'year_last_audit_financial', header: 'Last Audit Year' },
    { field: 'is_social_audit', header: 'Social Audit' },
    { field: 'year_last_audit_social', header: 'Last Soc Audit Year' },
    { field: 'is_forest_offence_reported', header: 'Forest Offense' },
    { field: 'is_prot_commit_formed', header: 'Prot Comm Formed' },
    { field: 'is_occurrence_fire', header: 'Forest Fire Occur' },
    { field: 'is_grazing_controlled', header: 'Grazing Controlled' },
    { field: 'no_jhumia_family', header: 'No. Jhumia Families' },
    { field: 'n_man_animal_conflict', header: 'Man-Animal Conflict' },
    { field: 'comments', header: 'Comments' },
    { field: 'createdbyuser', header: 'User Name' },
    { field: 'createdat', header: 'Creation Date' },
      {
        header: 'Img 1', field: 'img1', type: 'actions',
        actions: [{ icon: 'fa fa-picture-o', action: 'view_image1', visible: (row: any) => !!row.image1_name }]
      },
      {
        header: 'Img 2', field: 'img2', type: 'actions',
        actions: [{ icon: 'fa fa-image', action: 'view_image2', visible: (row: any) => !!row.image2_name }]
      },
      {
        header: 'Map', field: 'map_locate', type: 'actions',
        actions: [{ icon: 'fa fa-map-marker', action: 'view_map', tooltip: 'Locate on Map', color: '#f97316' }]
      }
    ];
    this.generateHiddenFields();
  }

  generateHiddenFields() {
    this.hiddenFields = this.columns
      .filter(col => !this.primaryFields.includes(col.field))
      .map(col => col.field);
  }

  onGridAction(event: any) {
    const action = event.action;
    const row = event.row;

    switch (action) {
      case 'monitoring_view':
        if (this.gridComponent) this.gridComponent.openViewPopupFromOutside({ ...row });
        break;
      case 'view_image1':
        this.openImage(row.id, 'img1'); // Pass 'img1' exactly
        break;
      case 'view_image2':
        this.openImage(row.id, 'img2'); // Pass 'img2' exactly
        break;
      case 'view_map':
        this.mappopup = true;
        setTimeout(() => this.openLocationOnMap(row), 150);
        break;
      
    }
  }

  loadMonitoringData() {
    this.coreservices.getAllMonitoringData(this.userid).subscribe({
      next: (res: any) => {
        let parsedRes = typeof res === 'string' ? JSON.parse(res) : res;
        let rawData = parsedRes?.Data || [];

        this.data = rawData.map((item: any, index: number) => ({
          ...item,
          sno: index + 1,
          Main_module: "JFMC",
          Sub_module: "JFMC",
          child_Module: "Monitoring",

          jfmcmontoring:true,
          // FIX: Check both field variations for the date
          createdat: (item.createdat || item.created_at) 
            ? new Date(item.createdat || item.created_at).toLocaleDateString('en-IN') 
            : ''
        }));
        
        this.initColumns(); // Refresh columns to apply visibility
      },
      error: () => this.snackBar.open('Failed to load monitoring data', 'Close', { duration: 3000 })
    });
  }

 openImage(id: string, imageField: string) {
  const imageParam = imageField === "img1" ? "img1_" + id : "_" + id;

  this.coreservices.getMonitoringImage(imageParam).subscribe({
    next: (res: any) => {
      const parsedRes = typeof res === 'string' ? JSON.parse(res) : res;
      const base64 = parsedRes?.Data?.[0]?.[0]?.Value || parsedRes?.Data?.[0]?.Value || parsedRes?.Data?.[0]?.img;

      if (base64) {
        this.popupImageUrl = `data:image/png;base64,${base64}`;
        this.showImagePopup = true; // Only show popup if image exists
      } else {
        this.snackBar.open('Image not available', 'Close', { duration: 3000 });
      }
    },
    error: () => {
      this.snackBar.open('No image found for this record', 'Close', { duration: 3000 });
    }
  });
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



 closeImagePopup() {
    this.showImagePopup = false;
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
   
  openEditModal(row: any) { this.selectedRecordId = row.id; this.isEditOpen = true; }
  closeEditModal() { this.isEditOpen = false; }

  handleStatusUpdate(payload: any) {
    // Logic for updating from the grid view
    const updatePayload = { 
      Id: payload.id, 
      comments: payload.comments,
      revolving_fund: payload.revolving_fund,
      no_jhumia_family: payload.no_jhumia_family,
    n_man_animal_conflict: payload.n_man_animal_conflict};
    this.coreservices.updateMonitoringDetails(updatePayload).subscribe({
      next: () => {
        this.snackBar.open('Updated successfully', 'Close', { duration: 2000 });
        this.loadMonitoringData();
      }
    });
  }
}