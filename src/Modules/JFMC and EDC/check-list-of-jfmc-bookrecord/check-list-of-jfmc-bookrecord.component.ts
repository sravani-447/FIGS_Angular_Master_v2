import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as L from 'leaflet';
import { ServerRequests } from '../../../services/ServerRequests';
import { GridColumn } from '../../../shared/Grids/grid-column.model';
import { HttpClient } from "@angular/common/http";
import { CustomGridComponent } from "../../../shared/Grids/custom-grid.component";

const iconRetinaUrl = 'assets/marker-icon-2x.png';
const iconUrl = 'assets/marker-icon.png';
const shadowUrl = 'assets/marker-shadow.png';
const iconDefault = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-checklist-jfmc-book',
  templateUrl: './check-list-of-jfmc-bookrecord.component.html',
  styleUrls: ['./check-list-of-jfmc-bookrecord.component.css']
})
export class ChecklistJfmcBookComponent implements OnInit {


  @ViewChild('grid') gridComponent!: CustomGridComponent;
  hiddenFields: string[] = [];
  showImagePopup: boolean = false;
  isEditOpen: boolean = false;
  editComments: string = '';
  selectedId: number | null = null;
  popupImageUrl: string = '';
  selectedImageSrc: string = '';
  mappopup: boolean = false;
  disablegrid: boolean = false;
  viewvisiblity: boolean = false;
  structureId: string = '';
  typeOfStructure: string = '';
  comments: string = '';
  private map!: L.Map;
  private markers: L.LayerGroup = new L.LayerGroup();


  private primaryFields = [
    'user_name',
    'createdby',
    'createdbyuser',
    'actions',
    'createdat',
    'jfmc_name',
    'sel_mode',
  ];

  onGridAction(event: any) {
    const action = event.action;
    const row = event.row;

    switch (action) {
      case 'checklist_view':
        this.disablegrid = true;
        setTimeout(() => {
          if (this.gridComponent) this.gridComponent.openViewPopupFromOutside({ ...row });
        }, 0);
        break;


      case 'view_image1':
        this.openImage(row.id, 'img_name');
        break;

      case 'view_image2':
        this.openImage(row.id, 'image2_name');
        break;

      // CHANGE THIS: Match the 'action' string in your Column definition
      case 'view_map':
        this.mappopup = true;
        setTimeout(() => this.openLocationOnMap(row), 100);
        break;
    }
  }


  userid: any;
  data: any[] = [];
  isAddingNew: boolean = false;
  disablebox: boolean = false;
  isViewPopupOpen: boolean = false;
  isEditModalOpen: boolean = false;
  selectedRecordId: number | null = null;


  isImageModalOpen: boolean = false;
  isUpdateModalOpen: boolean = false;
  nurseryMasterDetails: any[] = [];


  columns: GridColumn[] = [
    {
      field: 'actions',
      header: 'Actions',
      type: 'actions',
      actions: [
        {
          label: 'view',
          action: 'checklist_view',
          tooltip: 'view',
          icon: "",
        }
      ]
    },
    { field: 'jfmc_name', header: 'Committee Name' },
    { field: 'sel_mode', header: 'Committee Type' },
    { field: 'is_cashbook', header: 'Cashbook' },
    { field: 'is_ledger', header: 'Ledger' },
    { field: 'is_stock_register', header: 'Stock Register' },
    { field: 'is_draft_received', header: 'Draft Received' },
    { field: 'is_nursery_journal', header: 'Nursery Journal' },
    { field: 'is_plantation_general', header: 'Plantation Journal' },
    { field: 'is_gb_meeting', header: 'GB Meeting' },
    { field: 'is_ec_meeting', header: 'EC Meeting' },
    { field: 'is_jfmc_ben_register', header: 'JFMC Benefits' },
    { field: 'is_revf_register', header: 'Rev Fund Register' },
    { field: 'is_sanction_register', header: 'Sanction Register' },
    { field: 'is_asset_register', header: 'Asset Register' },
    { field: 'is_expend_register', header: 'Expend Register' },
    { field: 'is_wages_register', header: 'Wages Register' },
    { field: 'is_forest_protection', header: 'Forest Protection' },
    { field: 'is_visit_register', header: 'Visit Register' },
    { field: 'is_agrofores_benef_register', header: 'Agroforest Benef Register' },
    { field: 'is_agro_input_cost_register', header: 'Agro Input Cost Register' },
    { field: 'is_inspection_register', header: 'Inspection Register' },
    { field: 'is_work_register', header: 'Work Register' },
    { field: 'is_check_issue_register', header: 'Check Issue Register' },
    { field: 'comments', header: 'Comments' },
    { field: 'createdbyuser', header: 'User Name' },
    { field: 'createdat', header: 'Creation Date' },
    {
      header: 'Img 1',
      field: 'img1',
      type: 'actions',
      actions: [
        { icon: 'fa fa-picture-o', action: 'view_image1', visible: row => !!row.image1_name }
      ]

    },
    {
      header: 'Img 2',
      field: 'img2',
      type: 'actions',
      actions: [
        { icon: 'fa fa-image', action: 'view_image2', tooltip: 'View Image2', color: '#eab308', visible: (row: any) => this.isActionVisible('view_image2', row) }
      ]
    },
    {
      header: 'Map',
      field: 'map_locate',
      type: 'actions',
      actions: [
        { icon: 'fa fa-map-marker', action: 'view_map', tooltip: 'Locate on Map', color: '#f97316', visible: () => true }
      ]
    }
  ];






  constructor(
    private coreservices: ServerRequests,
    private snackBar: MatSnackBar,
    private http: HttpClient
  ) {
    const session = sessionStorage.getItem("Session");
    if (session) {
      const sessionDetails = JSON.parse(session);
      this.userid = sessionDetails.Data[0].user_id;
    }
  }

  generateHiddenFields() {
    this.hiddenFields = this.columns
      .filter(col => !this.primaryFields.includes(col.field))
      .map(col => col.field);
    this.loadChecklistData();
    console.log('Automatically hidden fields:', this.hiddenFields);
  }


  ngOnInit(): void {
    this.loadChecklistData();
    this.generateHiddenFields();

  }


  isActionVisible(action: string, row: any): boolean {
    switch (action) {
      case 'edit':
      case 'view_map':
        return true;

      case 'view_image1':
        return !!row.image1_name;

      case 'view_image2':
        return !!row.image2_name;

      default:
        return false;
    }
  }

  loadChecklistData() {
    this.coreservices.getAllJfmcBookChecklist(this.userid).subscribe({
      next: (res: any) => {



        let parsedRes = typeof res === 'string' ? JSON.parse(res) : res;
        let rawData: any[] = parsedRes?.Data || (Array.isArray(parsedRes) ? parsedRes : []);

        let filteredData = rawData;
        try {
          const userData = JSON.parse(sessionStorage.getItem('userdata') || '{}');
          const allowedBeats = userData?.Jurisdiction?.beat || [];
          if (allowedBeats.length > 0) {
            filteredData = rawData.filter((item: any) =>
              allowedBeats.includes(item.beat_name)
            );
          }
        } catch { }

        this.data = filteredData.map((item: any, index: number) => ({
          ...item,
          checklistmodule: true,
          sno: index + 1,
          Main_module: "JFMC",
          Sub_module: "JFMC",
          child_Module: "Check List Of JFMC Book Record",


          createdat: item.createdat


        }));

        sessionStorage.setItem("ChecklistData", JSON.stringify(filteredData));

        setTimeout(() => {
          this.initMap();
          this.loadMarkers();
        }, 300);
      },
      error: () => {
        this.snackBar.open('Failed to load checklist data', 'Close', { duration: 3000 });
      }
    });
  }


  openEditModal(row: any) {
    this.selectedRecordId = row.id;
    this.editComments = row.comments || '';
    this.isEditOpen = true;
  }
  closeEditModal() {
    this.isEditOpen = false;
    this.selectedRecordId = null;
    this.editComments = '';
  }

  updateComments() {
    if (!this.selectedRecordId) return;

    const payload = {
      Id: this.selectedRecordId,
      comments: this.editComments
    };

    this.coreservices.updateChecklistComments(payload).subscribe({
      next: (res: any) => {
        let response = typeof res === 'string' ? JSON.parse(res) : res;

        if (response?.status === true || response?.status === "true") {
          this.snackBar.open('Successfully updated', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.closeEditModal();
          this.loadChecklistData();
        } else {
          this.snackBar.open('Update failed', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open('Server error', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  getRowById(id: number) {
    return this.nurseryMasterDetails.find(item => item.id === id);
  }




  openImage(id: string, imageName: string) {
    // CHANGE THESE: Match the variable names used in your HTML *ngIf
    this.showImagePopup = true;
    this.popupImageUrl = 'assets/images/Loading.gif';

    this.coreservices.getChecklistImage(id, imageName)
      .subscribe({
        next: (res: any) => {
          const parsedRes = typeof res === 'string' ? JSON.parse(res) : res;
          const base64 = parsedRes?.Data?.[0]?.[0]?.Value
            || parsedRes?.Data?.[0]?.Value
            || parsedRes?.Data?.[0]?.img;

          if (base64) {
            this.popupImageUrl = `data:image/png;base64,${base64}`; // Use popupImageUrl
          } else {
            this.popupImageUrl = 'assets/images/Image_not_available.png';
          }
        },
        error: (err) => {
          this.popupImageUrl = 'assets/images/Image_not_available.png';
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

  handleStatusUpdate(payload: any) {
    const updatePayload = {
      Id: payload.id,
      comments: payload.comments
    };

    if (updatePayload.Id) {
      this.coreservices.updateChecklistComments(updatePayload).subscribe({
        next: (res: any) => {
          let response = typeof res === 'string' ? JSON.parse(res) : res;

          if (response?.status === true || response?.status === "true") {
            this.snackBar.open('Successfully updated', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.loadChecklistData(); // Refresh the grid to show new data
          } else {
            this.snackBar.open('Update failed', 'Close', { duration: 3000 });
          }
        },
        error: (err) => {
          console.error('Update Error:', err);
          this.snackBar.open('Server error during update', 'Close', { duration: 3000 });
        }
      });
    }
  }



}