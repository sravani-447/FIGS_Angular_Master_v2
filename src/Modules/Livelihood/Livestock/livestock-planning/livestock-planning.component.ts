import { Component } from '@angular/core';
import * as L from 'leaflet';
import * as turf from '@turf/turf';

declare var shp: any;
declare var tokml: any;
declare var shpwrite: any;

@Component({
  selector: 'app-livestock-planning',
  templateUrl: './livestock-planning.component.html',
  styleUrl: './livestock-planning.component.css'
})
export class LivestockPlanningComponent {
  isLoading = false;
    data: any[] = [];
    intersectedFeatures: any[] = [];
    count: number = 0;
  
    // File names
    climateShapeName = '';
    silviPasturalPlantationMapName = '';
    waterBodyName = '';

    // Grid Configuration
  gridColumns: any[] = [];
  gridData: any[] = [];
  
    // Columns for displaying grid data
    // check fields value
    columns = [
  { header: 'ID', field: 'id' },
  { header: 'Column1', field: 'Column1' },
  { header: 'Column2', field: 'Column2' },
  { header: 'Column3', field: 'Column3' }, // adjust field if different
  { header: 'Area', field: 'area' }
];
  
    private map!: L.Map;
    private climateShapeGeo: GeoJSON.FeatureCollection<GeoJSON.GeometryObject> | null = null;
    private silviPasturalPlantationMapGeo: GeoJSON.FeatureCollection<GeoJSON.GeometryObject> | null = null;
    private waterBodyGeo: GeoJSON.FeatureCollection<GeoJSON.GeometryObject> | null = null;
  
    ngAfterViewInit() {
      this.map = L.map('map', { zoomControl: false }).setView([23.763410, 91.743373], 10);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
      L.control.zoom({ position: 'bottomright' }).addTo(this.map);
    }
  
    async onFileChange(event: any, type: 'climateShape' | 'silviPasturalPlantationMap' | 'waterBody') {
      const file = event.target.files[0];
      if (!file) return;
  
      if (type === 'climateShape') this.climateShapeName = file.name;
      else if (type === 'silviPasturalPlantationMap') this.silviPasturalPlantationMapName = file.name;
      else if (type === 'waterBody') this.waterBodyName = file.name;
  
      try {
        const geojson = await shp(await file.arrayBuffer());
        if (type === 'climateShape') this.climateShapeGeo = geojson;
        else if (type === 'silviPasturalPlantationMap') this.silviPasturalPlantationMapGeo = geojson;
        else if (type === 'waterBody') this.waterBodyGeo = geojson;
      } catch (e) {
        console.error('Error reading shapefile', e);
      }
    }
  Compare() {
    if (!this.climateShapeGeo || !this.silviPasturalPlantationMapGeo || !this.waterBodyGeo) {
      alert("Please upload all required shapefiles.");
      return;
    }
  
    this.isLoading = true;
    const interSectedFeature: any[] = [];
    const arrSourceNew = this.climateShapeGeo.features.filter((f: any) => f.properties?.['PPA_Score'] >= 6);
    const arrTarget = this.silviPasturalPlantationMapGeo.features;
  
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
  
    this.count = interSectedFeature.length;
  
    this.data = interSectedFeature.map((f: any) => f.properties);
  
    const newGeojson = { type: 'FeatureCollection', features: interSectedFeature };
    
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
  
    this.map.addLayer(geoJsonLayer);
  
    this.isLoading = false;
  }
  
    downloadKml() {
      const kml = tokml({ type: 'FeatureCollection', features: this.intersectedFeatures });
      const blob = new Blob([kml], { type: 'application/vnd.google-earth.kml+xml' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'Livestock_Planning.kml';
      a.click();
    }
  
    downloadShp() {
      if (!this.intersectedFeatures.length) {
        alert("No data generated yet. Please run 'GO' first.");
        return;
      }
  
      const featureCollection = { type: 'FeatureCollection', features: this.intersectedFeatures };
      const options = { folder: 'Livestock_Planning_Shapefiles' };
      shpwrite.download(featureCollection, options);
    }
  
    onMapMarkerClick(feature: any) {
      console.log('Map marker clicked for feature', feature);
    }

}

