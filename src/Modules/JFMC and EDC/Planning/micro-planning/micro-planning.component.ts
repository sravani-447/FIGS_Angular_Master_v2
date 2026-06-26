import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as L from 'leaflet'; // Import Leaflet

// Interface for your input controls (so you can fetch them from API)
interface FileInputConfig {
  key: string;
  label: string;
  icon: string;
  fileName: string | null;
}

@Component({
  selector: 'app-micro-planning',
  templateUrl: './micro-planning.component.html',
  styleUrls: ['./micro-planning.component.css']
})
export class MicroPlanningComponent implements OnInit, AfterViewInit {

  // 1. CONFIGURATION (This can come from an API)
  // Instead of hardcoding HTML, we loop through this array.
  inputControls: FileInputConfig[] = [
    { key: 'forest', label: 'Forest Type', icon: 'fa fa-tree', fileName: null },
    { key: 'village', label: 'Village Resource', icon: 'fa fa-home', fileName: null },
    { key: 'hamlets', label: 'Hamlets Covered', icon: 'fa fa-map-marker', fileName: null },
    { key: 'connectivity', label: 'Connectivity', icon: 'fa fa-road', fileName: null },
    { key: 'pra', label: 'PRA', icon: 'fa fa-users', fileName: null }
  ];

  // Dynamic Download Buttons
  downloadButtons = [
    { label: 'Download PDF', icon: 'fa fa-file-pdf-o', action: 'pdf' },
    { label: 'Download Excel', icon: 'fa fa-file-excel-o', action: 'excel' }
  ];

  // Grid Configuration
  gridColumns: any[] = [];
  gridData: any[] = [];
  
  // State
  isLoading = false;
  private map: L.Map | undefined;
  isMapExpanded = false;
 
  constructor() { }

  ngOnInit(): void {
    this.loadGridConfig();
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  // --- MAP LOGIC ---
  private initMap(): void {
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

   this.map = L.map('map', {
      center: [23.8315, 91.2868], 
      zoom: 11 
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
  }

  toggleMapExpanded() {
  this.isMapExpanded = !this.isMapExpanded;
  
  setTimeout(() => {
    if (this.map) {
      this.map.invalidateSize();
    }
  }, 300);
}
  loadGridConfig() {
    this.gridColumns = [
      { field: 'zone_name', header: 'Zone Name' },
      { field: 'area_ha', header: 'Area (Ha)' },
      { field: 'status', header: 'Status' }
    ];
  }

  onFileChange(event: any, controlKey: string) {
    const file = event.target.files[0];
    if (file) {
      const control = this.inputControls.find(c => c.key === controlKey);
      if (control) {
        control.fileName = file.name;
      }
    }
  }

  processData() {
    this.isLoading = true;
    
    setTimeout(() => {
      this.isLoading = false;
      this.gridData = [
        { zone_name: 'North Forest A', area_ha: 120.5, status: 'Active' },
        { zone_name: 'West Village B', area_ha: 45.2, status: 'Pending' },
        { zone_name: 'East Hamlet C', area_ha: 90.0, status: 'Review' },
      ];
      
      // Example: Fly map to a location on data load
      this.map?.flyTo([28.6139, 77.2090], 10); 
    }, 2000);
  }

 downloadKML(): void {
    console.log('Initiating KML download...');
    
    
    const kmlContent = `<?xml version="1.0" encoding="UTF-8"?>
      <kml xmlns="http://www.opengis.net/kml/2.2">
        <Document>
          <name>Map_Overview.kml</name>
          <description>Generated KML from Micro Planning</description>
        </Document>
      </kml>`;
      
    const blob = new Blob([kmlContent], { type: 'application/vnd.google-earth.kml+xml' });
    this.triggerDownload(blob, 'Map_Overview.kml');
  }

  downloadSHP(): void {
    console.log('Initiating SHP download...');
    
    
    const dummyContent = "Dummy Shapefile Data (Usually a binary ZIP)";
    const blob = new Blob([dummyContent], { type: 'application/zip' });
    this.triggerDownload(blob, 'Map_Overview_SHP.zip');
  }

 
  private triggerDownload(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    
    window.URL.revokeObjectURL(url);
  }

 
}