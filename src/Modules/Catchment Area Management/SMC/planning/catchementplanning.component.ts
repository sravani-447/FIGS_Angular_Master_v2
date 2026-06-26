import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import * as turf from '@turf/turf';
import { GeoJSON } from 'geojson';

declare var shp: any;
declare var tokml: any;
declare var shpwrite: any;

@Component({
  selector: 'app-catchementplanning',
  templateUrl: './catchementplanning.component.html',
  styleUrls: ['./catchementplanning.component.css']
})
export class catchementPlanningComponent implements AfterViewInit {
  isLoading = false;
  data: any[] = [];
  intersectedFeatures: any[] = [];
  count: number = 0;

  // File names
  watershedName = '';
  waterStockName = '';
  pourPointName = '';

  // Columns for displaying grid data
  columns = [
    { header: 'ID', field: 'id' },
    { header: 'FDS SCORE', field: 'FDS_score' },
    { header: 'PPA SCORE', field: 'PPA_Score' },
    { header: 'AREA (HA)', field: 'area' }
  ];

  private map!: L.Map;
  private watershedGeo: GeoJSON.FeatureCollection<GeoJSON.GeometryObject> | null = null;
  private waterStockGeo: GeoJSON.FeatureCollection<GeoJSON.GeometryObject> | null = null;
  private pourPointGeo: GeoJSON.FeatureCollection<GeoJSON.GeometryObject> | null = null;

  ngAfterViewInit() {
    this.map = L.map('map', { zoomControl: false }).setView([23.763410, 91.743373], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
    L.control.zoom({ position: 'bottomright' }).addTo(this.map);
  }

  async onFileChange(event: any, type: 'watershed' | 'waterStock' | 'pourPoint') {
    const file = event.target.files[0];
    if (!file) return;

    if (type === 'watershed') this.watershedName = file.name;
    else if (type === 'waterStock') this.waterStockName = file.name;
    else if (type === 'pourPoint') this.pourPointName = file.name;

    try {
      const geojson = await shp(await file.arrayBuffer());
      if (type === 'watershed') this.watershedGeo = geojson;
      else if (type === 'waterStock') this.waterStockGeo = geojson;
      else if (type === 'pourPoint') this.pourPointGeo = geojson;
    } catch (e) {
      console.error('Error reading shapefile', e);
    }
  }
Compare() {
  if (!this.watershedGeo || !this.waterStockGeo || !this.pourPointGeo) {
    alert("Please upload all required shapefiles.");
    return;
  }

  this.isLoading = true;
  const interSectedFeature: any[] = [];
  const arrSourceNew = this.watershedGeo.features.filter((f: any) => f.properties?.['PPA_Score'] >= 6);
  const arrTarget = this.waterStockGeo.features;

  // Iterate over the target features (water stock)
  arrTarget.forEach((element: any) => {
    if (element.properties) {  // Check if properties exist
      arrSourceNew.forEach((element1: any) => {
        if (element1.properties) {  // Check if properties exist for element1
          const intersection = turf.intersect(turf.featureCollection([element1, element]));

          if (intersection) {
            // Assign properties using bracket notation
            element.properties['PPA_Score'] = element1.properties['PPA_Score'];
            element.properties['hab_id'] = element.properties['fid'];
            element.properties['ed_sscore'] = element1.properties['ed_sscore'];
            element.properties['FDS_score'] = element1.properties['FDS_score'];
            interSectedFeature.push(element);
          }
        }
      });
    }
  });

  // Update the feature count
  this.count = interSectedFeature.length;

  // Map the intersected features for grid display
  this.data = interSectedFeature.map((f: any) => f.properties);

  // Update map with the intersected features
  const newGeojson = { type: 'FeatureCollection', features: interSectedFeature };
  
  // Explicitly type the GeoJSON to match expected structure (Polygon/MultiPolygon)
  const geoJsonLayer = L.geoJSON(newGeojson as GeoJSON.FeatureCollection<GeoJSON.Polygon | GeoJSON.MultiPolygon, any>, {
    onEachFeature: function (feature: any, layer: any) {
      let popupContent = "<p><strong>Attributes:</strong></p>";
      for (let key in feature.properties) {
        popupContent += `<p>${key}: ${feature.properties[key]}</p>`;
      }
      layer.bindPopup(popupContent);
    },
    style: { color: '#f39c12', weight: 2, fillOpacity: 0.5 }
  });

  // Add the GeoJSON layer to the map
  this.map.addLayer(geoJsonLayer);

  this.isLoading = false;
}

  downloadKml() {
    const kml = tokml({ type: 'FeatureCollection', features: this.intersectedFeatures });
    const blob = new Blob([kml], { type: 'application/vnd.google-earth.kml+xml' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'SMC_Planning_Selection.kml';
    a.click();
  }

  downloadShp() {
    if (!this.intersectedFeatures.length) {
      alert("No data generated yet. Please run 'GO' first.");
      return;
    }

    const featureCollection = { type: 'FeatureCollection', features: this.intersectedFeatures };
    const options = { folder: 'SMC_Planning_Shapefiles' };
    shpwrite.download(featureCollection, options);
  }

  onMapMarkerClick(feature: any) {
    // Logic for map marker click, e.g., zoom to the feature or highlight it on the map
    console.log('Map marker clicked for feature', feature);
  }
}