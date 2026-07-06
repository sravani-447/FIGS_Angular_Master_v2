import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import * as L from 'leaflet';
import { ServerRequests } from "../../../../services/ServerRequests";
import { GridColumn } from "../../../../shared/Grids/grid-column.model";
declare const tokml: any;


@Component({
  selector: 'app-sitemaster.component',
  templateUrl: './Presurvey.component.html',
  styleUrls: ['./Presurvey.component.css']
})
export class presurveyComponent implements OnInit {

  userid: any;
  data: any[] = [];
 hiddenFields: string[] = [];

  showImagePopup: boolean = false;
  popupImageUrl: string = '';

  private map!: L.Map;
  private markers: L.LayerGroup = new L.LayerGroup();
  mappopup: boolean = false;
  userDesignation: any;
  

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
    'plantation_id',
  ];

  ngOnInit(): void {
    this.getpresurveydata();
    this.generateHiddenFields();
  }

   generateHiddenFields() {
    this.hiddenFields = this.columns
      .filter(col => !this.primaryFields.includes(col.field))
      .map(col => col.field);
    this.getpresurveydata();
    console.log('Automatically hidden fields:', this.hiddenFields);
  }
  
  
columns: GridColumn[] = [
  // Action Buttons
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

  // Status
    { field: 'fo_status', header: 'Status (FO)' },
  { field: 'bo_status', header: 'Status(BO)' },
  { field: 'ro_status', header: 'Status(RO)' },

  // Plantation Info
  { field: 'plantation_id', header: 'Plantation Id' },
  { field: 'beat_name', header: 'Beat Name' },
  { field: 'survey_type', header: 'Survey Type' },
  { field: 'area_hect', header: 'Area(Hect)' },
  { field: 'length_km', header: 'Length(Km)' },
  { field: 'locatity_name', header: 'Locality' },

  // Comments & Audit Info
  { field: 'comments', header: 'Comments' },
  { field: 'createdby', header: 'User Name' },
  { field: 'createdat', header: 'Creation Date' },

  // Images
  {
    field: 'image1_name',
    header: 'Image1',
    type: 'actions',
    actions: [{ icon: 'fa fa-image', action: 'Image1', tooltip: 'View Image1' }]
  },
  {
    field: 'image2_name',
    header: 'Image2',
    type: 'actions',
    actions: [{ icon: 'fa fa-image', action: 'Image2', tooltip: 'View Image2' }]
  },

  // Reject Comments
  { field: 'bo_rej_comments', header: 'Reject Comments (BO)' },
  { field: 'ro_rej_comments', header: 'Reject Comments (RO)' },

  // Map Action
  {
    field: 'location',
    header: 'Zoom To Map',
    type: 'actions',
    actions: [{ icon: 'fa fa-map-marker', action: 'location', tooltip: 'Zoom To Map' }]
  },

  // KML Action
 {
  field: 'kml',
  header: 'KML',
  type: 'actions',
  actions: [
    { 
      icon: 'fa fa-file', 
      action: 'kml', 
      tooltip: 'Download KML',
      visible: (row: any) => !!row.lat && !!row.lng // Only show if location exists
    }
  ]
}
];
  // ================= LOAD DATA =================
getpresurveydata() {
  this.coreservices.getpresurveydatalist(this.userid).subscribe({
    next: (res: any) => {
      const parsedRes = typeof res === 'string' ? JSON.parse(res) : res;

      let rawData = parsedRes?.Data
        ? (typeof parsedRes.Data === 'string'
            ? JSON.parse(parsedRes.Data)
            : parsedRes.Data)
        : [];

      sessionStorage.setItem("PlantationPresurvey", JSON.stringify(rawData));

      this.data = [
        ...rawData.map((item: any, index: number) => ({
          ...item,
          sno: index + 1,
          Main_module: "Forest Management",
          Sub_module: "Plantation",
          child_Module: "Presurvey",


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

    this.coreservices.getpresurveyImages(id, imageName).subscribe({
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
 


  onGridAction(event: { action: string; row: any }) {
    const row = event.row;

    switch (event.action) {
      case 'Image1': this.openImage(row.id, 'img1'); break;
      case 'Image2': this.openImage(row.id, 'img2'); break;
      case 'location':
        this.mappopup = true;
        setTimeout(() => this.openLocationOnMap(row), 100);
        break;
         case 'kml': // Add this
        this.downloadKmlByRow(row);
        break;
        
    }
  }


 downloadKmlByRow(row: any) {
    const pointsString = row.points_string;

    if (!pointsString) {
      this.snackBar.open('Boundary coordinates not available (points_string is empty)', 'Close', { duration: 3000 });
      return;
    }

    let parsedGeometry: any = null;

    try {
      // 1. Remove white spaces from coordinates string
      const pntArray = pointsString.replace(/\s+/g, '');

      if (row.survey_type === "Linear") {
        // 2. Parse as LineString geometry
        const coordString = pntArray.replace(/^\[|\]$/g, '');
        const pairs = coordString.split('],[');
        const resultObject: number[][] = [];

        pairs.forEach((pair: string) => {
          const coords = pair.replace(/[\[\]]/g, '').split(',').map(Number);
          if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
            resultObject.push([coords[0], coords[1]]);
          }
        });

        parsedGeometry = {
          type: "LineString",
          coordinates: resultObject
        };

      } else {
        // 3. Parse as Polygon geometry
        const coordString = pntArray.replace(/^\[|\]$/g, '');
        const coordStringClean = coordString.startsWith('[') && coordString.endsWith(']') 
          ? coordString.substring(1, coordString.length - 1) 
          : coordString;
        const pairs = coordStringClean.split('],[');
        const resultObject: number[][] = [];

        pairs.forEach((pair: string) => {
          const coords = pair.replace(/[\[\]]/g, '').split(',').map(Number);
          if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
            resultObject.push([coords[0], coords[1]]);
          }
        });

        // Ensure the Polygon ring is closed (the first and last coordinate must match)
        if (resultObject.length > 0) {
          const first = resultObject[0];
          const last = resultObject[resultObject.length - 1];
          if (first[0] !== last[0] || first[1] !== last[1]) {
            resultObject.push([first[0], first[1]]);
          }
        }

        parsedGeometry = {
          type: "Polygon",
          coordinates: [resultObject]
        };
      }
    } catch (error) {
      console.error("Error parsing points_string:", error);
      this.snackBar.open('Failed to parse boundary coordinate format.', 'Close', { duration: 3000 });
      return;
    }

    // 4. Construct the standard GeoJSON Feature Collection
    const singleFeature = {
      type: "FeatureCollection",
      features: [{
        type: "Feature",
        geometry: parsedGeometry, 
        properties: {
          plantation_id: row.plantation_id,
          beat_name: row.beat_name,
          survey_type: row.survey_type,
          area_hect: row.area_hect,
          length_km: row.length_km,
          locality: row.locatity_name,
          createdby: row.createdby,
          createdat: row.createdat
        }
      }]
    };

    // 5. Generate KML and trigger file download
    try {
      const kml = tokml(singleFeature);
      const blob = new Blob([kml], { type: 'application/vnd.google-earth.kml+xml' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.download = `plantation_${row.plantation_id || 'survey'}.kml`;
      a.href = url;
      
      document.body.appendChild(a);
      a.click();
      
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error("KML Generation Error:", error);
      this.snackBar.open('Error generating KML file', 'Close', { duration: 3000 });
    }
  }

    handleStatusUpdate(payload: any) {

    console.log(payload);


    sessionStorage.setItem('Nursery View Details', JSON.stringify(payload));


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
      plantation_id:payload.plantation_id,
      locatity_name: payload.locatity_name,
      comments: payload.comments,
      rejectreason: payload.rejectreason,
      status: payload.status
    };

    console.log("Final Payload => ", Payload);
    if (Payload.comments != undefined && Payload.status != "NO" && Payload.status != "YES") {
      this.coreservices.Insertplantationpresurveydetails(Payload).subscribe({
        next: (res: any) => {
          this.getpresurveydata();
          this.snackBar.open('Data Saved Successfully!', 'Close', { duration: 3000 });
        },
        error: (err) => {
          console.error('Error saving', err);
        }
      });
    }
    else if (Payload.status == "NO") {
      this.coreservices.Insertcommonrejectdetails("RO", Payload.rejectreason, Payload.Id,"plantation_presurvey").subscribe({
        next: (res: any) => {
          this.getpresurveydata();
          this.snackBar.open('Data Saved Successfully!', 'Close', { duration: 3000 });
        },
        error: (err) => {
          console.error('Error saving', err);
        }
      });
    }
    else if (this.userDesignation == "FIELD_OFFICER" && Payload.status == "YES") {
      this.coreservices.CommonApprovalforallroles("FO", "BO", Payload.Id, "plantation_presurvey").subscribe({
        next: (res: any) => {
          this.getpresurveydata();
          this.snackBar.open('Data Saved Successfully!', 'Close', { duration: 3000 });
        },
        error: (err) => {
          console.error('Error saving', err);
        }
      });
    }
    else if (this.userDesignation == "BEAT_OFFICER" && Payload.status == "YES") {
      this.coreservices.CommonApprovalforallroles("BO", "RO", Payload.Id, "plantation_presurvey").subscribe({
        next: (res: any) => {
          this.getpresurveydata();
          this.snackBar.open('Data Saved Successfully!', 'Close', { duration: 3000 });
        },
        error: (err) => {
          console.error('Error saving', err);
        }
      });
    }
    else if (this.userDesignation == "RANGE_OFFICER" && Payload.status == "YES") {
      this.coreservices.commonApprovedByRangeo(Payload.Id,"plantation_presurvey").subscribe({
        next: (res: any) => {
          this.getpresurveydata();
          this.snackBar.open('Data Saved Successfully!', 'Close', { duration: 3000 });
        },
        error: (err) => {
          console.error('Error saving', err);
        }
      });
    }
  }

}

// new code .