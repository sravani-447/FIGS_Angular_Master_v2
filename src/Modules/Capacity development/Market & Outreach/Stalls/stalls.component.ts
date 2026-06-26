import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ServerRequests } from '../../../../services/ServerRequests';

import { GridColumn } from '../../../../shared/Grids/grid-column.model';

import * as L from 'leaflet';

@Component({
  selector: 'app-stalls',
  templateUrl: './stalls.component.html',
  styleUrls: ['./stalls.component.css']
})
export class StallsComponent implements OnInit, AfterViewInit {
  data: any[] = [];
  columns: GridColumn[] = [];
  private map: any;
  private marker: any;
  selectedImageUrl: string = '';
   showPhotoPreview: boolean = false; 

 private googleIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
  selectedImageName: string = '';


  constructor(private serverReq: ServerRequests) {}

  ngOnInit(): void {
    this.initGridConfig();
    this.loadStallData();
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  initGridConfig() {
    this.columns = [
      { header: 'Stall ID', field: 'stall_id' },
      { header: 'Scheme', field: 'scheme_name' },
      { header: 'Place', field: 'place' },
      { header: 'Main Product', field: 'product_main_type' },
      { header: 'Sub Product', field: 'product_type' },
      { header: 'Buyers', field: 'num_of_buyer' },
      { header: 'Sold', field: 'num_of_product_sold' },
      { header: 'Queries', field: 'num_of_query' },
      { header: 'Area(SqM)', field: 'area_in_sq_m' },
      {
        header: 'Actions',
        field: 'actions',
        type: 'actions',
        actions: [
          // Using modern classes: 'btn-img-modern' and 'btn-map-modern'
          { action: 'IMG1', icon: 'fa fa-image', tooltip: 'View Image 1', label: 'Img 1' },
          { action: 'IMG2', icon: 'fa fa-image', tooltip: 'View Image 2', label: 'Img 2' },
          { action: 'MAP', icon: 'fa fa-location-arrow', tooltip: 'Go to Map' }
        ]
      }
    ];
  }

  loadStallData() {
    this.serverReq.getAllStallDetails().subscribe((res: any) => {
      const result = (typeof res === 'string') ? JSON.parse(res) : res;
      this.data = result.Data || [];
      
      console.log("stalls data:" + this.data);
    });
  }

   handleGridAction(event: { action: string; row: any }) {
    if (event.action === 'IMG1') {
        this.openImage(event.row.stall_id, 1);
    } else if (event.action === 'IMG2') {
        this.openImage(event.row.stall_id, 2);
    } else if (event.action === 'MAP') {
        this.zoomToLocation(event.row.lat, event.row.lng);
    }
  }

  private initMap() {
    this.map = L.map('stallMap', { zoomControl: false }).setView([23.763410, 91.724147], 12);
    L.tileLayer('http://{s}.google.com/vt?lyrs=m&x={x}&y={y}&z={z}', { 
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'] 
    }).addTo(this.map);
    L.control.zoom({ position: 'topright' }).addTo(this.map);
    
    // Fix: Force map to recalculate size in case it was hidden
    setTimeout(() => {
      this.map.invalidateSize();
    }, 500);
  }

zoomToLocation(lat: any, lng: any) {
  if (!lat || !lng) return;
  if (this.marker) this.map.removeLayer(this.marker);
  
  // Create marker with the defined icon
  this.marker = L.marker([lat, lng], { icon: this.googleIcon }).addTo(this.map);
  this.map.setView([lat, lng], 17);
  
  document.getElementById('map-card')?.scrollIntoView({ behavior: 'smooth' });
}

openImage(stallId: any, index: number) {
  this.selectedImageUrl = '';
  this.selectedImageName = '';
  this.showPhotoPreview = true;

  this.serverReq.getStallImages(stallId).subscribe({
    next: (res: any) => {

      const result = (typeof res === 'string') ? JSON.parse(res) : res;
      const data = result?.Data || [];

      // 🔥 dynamic keys
      const imageKey = `image${index}`;
      const nameKey = `image${index}_name`;

      // 🔍 find values
      const imageObj = data[0].find((d: any) => d.Key === imageKey);
      const nameObj = data[0].find((d: any) => d.Key === nameKey);

      const base64 = imageObj?.Value || '';
      const imageName = nameObj?.Value || '';

      // ✅ set image
      if (base64.trim() !== '') {
        this.selectedImageUrl = `data:image/jpeg;base64,${base64}`;
      } else {
        this.selectedImageUrl = 'https://placehold.co/600x400?text=No+Image+Available';
      }

      // ✅ set name (optional)
      this.selectedImageName = imageName;

      console.log('Selected Image:', imageKey, this.selectedImageUrl);
    },

    error: (err) => {
      console.error('Image load error:', err);
      this.selectedImageUrl = 'https://placehold.co/600x400?text=Load+Error';
    }
  });
}


   closePreview() {
    this.showPhotoPreview = false;
    this.selectedImageUrl = '';
  }

private triggerModal() {
  const btn = document.getElementById('imgModalTrigger');
  if (btn) btn.click();
}
}
