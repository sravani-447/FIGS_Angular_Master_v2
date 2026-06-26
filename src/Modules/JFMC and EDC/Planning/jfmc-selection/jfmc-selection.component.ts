import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import * as turf from '@turf/turf';

declare var shp: any;
declare var tokml: any;
declare var shpwrite: any;

@Component({
  selector: 'app-jfmc-selection',
  templateUrl: './jfmc-selection.component.html',
  styleUrl: './jfmc-selection.component.css'
})
export class JFMCSelectionComponent implements AfterViewInit {
  isLoading = false;
  ppaName = '';
  habName = '';
  gridData: any[] = [];
  intersectedFeatures: any[] = [];
  
  columns = [
    { header: 'ID', field: 'hab_id' },
    { header: 'FDS SCORE', field: 'FDS_score' },
    { header: 'PPA SCORE', field: 'PPA_Score' },
    { header: 'AREA (HA)', field: 'area' }
  ];

  private map!: L.Map;
  private ppaGeo: any;
  private habGeo: any;

  ngAfterViewInit() {
    this.map = L.map('map', { zoomControl: false }).setView([23.763410, 91.743373], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
    L.control.zoom({ position: 'bottomright' }).addTo(this.map);
  }

  async onFileChange(event: any, type: 'ppa' | 'hab') {
    const file = event.target.files[0];
    if (!file) return;
     if (type === 'ppa') {
    this.ppaName = file.name;
  } else {
    this.habName = file.name;
  }
    try {
      const buffer = await file.arrayBuffer();
      const geojson = await shp(buffer);
      if (type === 'ppa') this.ppaGeo = geojson;
      else this.habGeo = geojson;
    } catch (e) { console.error(e); }
  }

 Compare() {
  if (!this.ppaGeo || !this.habGeo) {
    alert("Please upload both PPA and Habitat shapefiles.");
    return;
  }
  this.isLoading = true;
  
  setTimeout(() => {
    const arrSourceNew = this.ppaGeo.features.filter((p: any) => p.properties.PPA_Score >= 6);
    const arrTarget = this.habGeo.features;
    this.intersectedFeatures = [];

    arrTarget.forEach((targetFeat: any) => {
      arrSourceNew.forEach((sourceFeat: any) => {
        const intersection = turf.intersect(turf.featureCollection([sourceFeat, targetFeat]));
        if (intersection != null) {
          const resultProps = {
            ...targetFeat.properties,
            PPA_Score: sourceFeat.properties.PPA_Score,
            hab_id: targetFeat.properties.fid || targetFeat.properties.ID,
            FDS_score: sourceFeat.properties.FDS_score,
            area: targetFeat.properties.Shape_Area?.toFixed(2) || 0
          };
          this.intersectedFeatures.push({ ...targetFeat, properties: resultProps });
        }
      });
    });

    this.gridData = this.intersectedFeatures.map(f => f.properties);
    const layer = L.geoJSON({ type: 'FeatureCollection', features: this.intersectedFeatures } as any, {
      style: { color: '#f39c12', weight: 2, fillOpacity: 0.5 }
    });
    this.map.addLayer(layer);
    
    this.isLoading = false; 
  }, 500);
}

  downloadKml() {
    const kml = tokml({ type: 'FeatureCollection', features: this.intersectedFeatures });
    const blob = new Blob([kml], { type: 'application/vnd.google-earth.kml+xml' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'Tripura_Forest_Selection.kml'; a.click();
  }

  downloadShp() {
    if (!this.intersectedFeatures || this.intersectedFeatures.length === 0) {
      alert("No data generated yet. Please run 'GO' first.");
      return;
    }

    const featureCollection = {
      type: 'FeatureCollection',
      features: this.intersectedFeatures
    };

    const options = {
      folder: 'Tripura_Forest_Shapefiles', 
      types: {
        point: 'points',
        polygon: 'polygons',
        line: 'lines'
      }
    };

    shpwrite.download(featureCollection, options);
  }

}