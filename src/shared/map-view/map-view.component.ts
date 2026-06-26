import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import { ServerRequests } from '../../services/ServerRequests';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-map-view',
  template: `<div #mapContainer style="height: 100%; width: 100%;"></div>`,
  styles: [`:host { display: block; height: 100%; width: 100%; }`]
})
export class MapViewComponent implements OnChanges, AfterViewInit {
  @Input() data: any[] = []; // This comes from your DB response
  @ViewChild('mapContainer') mapContainer!: ElementRef;

  @Input() set baseLayer(type: string) {
    if (this.map && type) {
      this.updateBaseLayer(type);
    }
    this._activeLayerName = type;
  }
  
  private _activeLayerName: string = 'streets';
  private map!: L.Map;
  
  // Define layers locally for this component
  private googleStreets = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', { subdomains: ['mt0', 'mt1', 'mt2', 'mt3'] });
  private googleSatellite = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', { subdomains: ['mt0', 'mt1', 'mt2', 'mt3'] });
  private osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');



    ngOnInit() {}

  private markerLayer = L.layerGroup();
  layerConfig = [
    { name: 'geojsonLayer', type: 'State_Boundary', color: 'blue', weight: 3 },
    { name: 'geojsonDistrict', type: 'Forest_District', color: 'red', weight: 1.5 },
    { name: 'geojsonBeat', type: 'Forest_beat_148', color: 'green', weight: 1.5 },
    { name: 'geojsonJfmc', type: 'JFMC_Boundary', color: 'yellow', weight: 1.5 },
    { name: 'geojsonLayerRecorded_forest_area', type: 'Total_Forest', color: 'brown', weight: 1.5 },
    { name: 'geojsonLayerCompartment_boundary', type: 'Compartment_Boundary_Working_Circle', color: 'black', weight: 1.5 },
    { name: 'geojsonforestRange', type: 'Forest_Range', color: '#081cf9', weight: 2 },
    { name: 'geojsonPlantationPreSurvey', type: 'Scatform_presurvey', color: '#0288D1', weight: 0.8 },
    { name: 'geojsonReSurvey', type: 'Scatform_resurvey_2020-21', color: '#d11002', weight: 2 },
    { name: 'geojsonReSurvey_21', type: 'Scatform_resurvey_2021-22', color: '#3602d1', weight: 2 },
    { name: 'geojsonReSurvey_22', type: 'Scatform_resurvey_2022-23', color: '#d1d102', weight: 2 },
    { name: 'geojsonReSurvey_23', type: 'Scatform_resurvey_2023-24', color: '#cd209c', weight: 2 },
    { name: 'geojsonReSurvey_24', type: 'Plantation_Resurvey_2024-25', color: '#0f0210', weight: 2 },
    { name: 'geojsonReSurvey_25', type: 'Gomati_Khowai_West_District_resurvey_2025-2026', color: '#352106', weight: 0.1 },
    { name: 'geojsonAgroforestryPreSurvey', type: 'Agroforestry_Presurvey', color: '#00897B', weight: 0.8 },
    { name: 'geojsonAgroforestryReSurvey', type: 'Agroforestry_Resurvey', color: '#00695C', weight: 0.8 },
    { name: 'geojsonNursery', type: 'Nursury', color: 'orange' },
    { name: 'geojsonLivestock', type: 'Live_stock', color: '#8D6E63' },
    { name: 'geojsonFishery', type: 'Fishery', color: '#0288D1' },
    { name: 'geojsonEcoTourism', type: 'Eco_Tourism', color: '#66BB6A' },
    { name: 'geojsonHomeStay', type: 'Home_Stay', color: '#AB47BC' },
    { name: 'geojsonNTFPCentre', type: 'NTFP_Centre', color: '#EF5350' },
    { name: 'geojsonNCEOutlets', type: 'NCE_Outlets', color: '#26C6DA' },
    { name: 'geojsonPublicFacility', type: 'Public_Facility_Collected', color: '#EC407A' },
    { name: 'geojsonNTFPResourceMap', type: 'NTFP_Resource_Map', color: '#8BC34A', weight: 1 },
    { name: 'FDS_Grid', type: 'FDS_Grid', color: '#000000', weight: 0.2 },
    { name: 'ppa', type: 'ppa_intersect', weight: 1 },
    { name: 'geojsonMicrowatershed', type: 'Micro_Watershed', color: '#000000', weight: 0.5 },
    { name: 'geojsonContour', type: 'Contour', color: '#570000', weight: 1 },
    { name: 'geojsonStreams', type: 'Streams', color: 'blue', weight: 1 },
    { name: 'geojsonForestSlopeGrid', type: 'Slope_Status_Grid_Thematic', color: '#A1887F', weight: 0.5 },
    { name: 'geojsonResidentialAreas', type: 'Habitation', color: 'darkred', weight: 1 },
    { name: 'geojsonRoad', type: 'Road', color: '#0000', weight: 1.5 },
    { name: 'geojsonRivers', type: 'Major_Rivers', color: 'navy', weight: 1.5 },
    { name: 'geojsonJFMCLocations', type: 'JFMC_Locations_Phase1', color: 'purple' },
    { name: 'geojsonCheckDam', type: 'Checkdam_Phase1', color: 'teal' },
    { name: 'geojsonBFBPPublicFacility', type: 'Public_Facility', color: 'red' },
    { name: 'geojsonOfficeLocations', type: 'Beat_Office_Locations', color: 'darkblue' },
    { name: 'geojsonBFBPNursery', type: 'Nursury', color: 'orange' },
    { name: 'geojsonEcoParkGardens', type: 'Eco_Park_Gardens', color: '#33691E', weight: 1 },
    { name: 'geojsonAgroforestryPoints', type: 'AgroForestry_Points', color: 'darkgreen' },
    { name: 'geojsonJFMCMicrowatershed', type: 'Micro_Watershed', color: '#000000', weight: 1 },
    { name: 'geojsonJFMCContour', type: 'Contour', color: 'gray', weight: 0.5 },
    { name: 'geojsonJFMCStreams', type: 'Streams', color: 'blue', weight: 1 },
    { name: 'geojsonJFMCRoad', type: 'Road', color: '#0000', weight: 1.5 },
    { name: 'geojsonJFMCRivers', type: 'Rivers', color: 'navy', weight: 1.5 },
    { name: 'geojsonJFMCCheckDam', type: 'Checkdam_Phase2', color: 'teal' },
    { name: 'geojsonJFMCPublicFacility', type: 'Public_Facility', color: 'red' },
    { name: 'geojsonJFMCResidential', type: 'Residential_Area', color: 'darkred', weight: 1 }
  ];
  layerDetailsArray: any[] = [];
  actuallayername: string = '';
  geoServerUrl: string;
  infoMode: boolean = false;
  constructor(public coreservices: ServerRequests,
    private http: HttpClient,
  ) {
    this.geoServerUrl = this.coreservices.Geoserver_URl;
  }
  ngAfterViewInit() {
    this.initMap();
    this.loadLayerByName('geojsonLayer');
    this.loadLayerByName('geojsonforestRange');
    this.toggleInfo();
  }

  ngOnChanges(changes: SimpleChanges) {
    // Whenever [data] changes from the DB, update markers
    if (changes['data'] && this.map) {
      this.updateMarkers();
    }
  }

  private initMap() {
    // Initial placeholder map
    this.map = L.map(this.mapContainer.nativeElement, {
      center: [23.8315, 91.2868], // Default to center of Tripura until data loads
      zoom: 8,
      zoomControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

      this.updateBaseLayer(this._activeLayerName);

    this.markerLayer.addTo(this.map);

    // Fix for the "Gray Box" / hidden map issue
    setTimeout(() => {
      this.map.invalidateSize();
    }, 400);
  }


public updateBaseLayer(type: string) {
  if (!this.map) return;

  // Remove current tile layers
  this.map.eachLayer((layer: any) => {
    if (layer instanceof L.TileLayer) {
      this.map.removeLayer(layer);
    }
  });


   if (type === 'streets') {
    this.googleStreets.addTo(this.map);
  } else if (type === 'satellite') {
    this.googleSatellite.addTo(this.map);
  } else {
    this.osm.addTo(this.map);
  }

}





  loadLayerByName(layerName: string) {
    // 1. Check if it is a pre-loaded WMS layer
    this.actuallayername = layerName;
    const existingLayer = this.layerDetailsArray.find(x => x.layername === layerName);
    if (existingLayer) {
      if (!this.map.hasLayer(existingLayer.layer)) this.map.addLayer(existingLayer.layer);
      return;
    }

    // 2. Otherwise load GeoJSON from config
    const layerConfig = this.layerConfig.find(l => l.name === layerName);
    if (!layerConfig) return;
    const baseUrl = this.geoServerUrl + "/geoserver/ws_figs/ows";
    const url = `${baseUrl}?service=WFS&version=1.0.0&request=GetFeature&typeName=ws_figs:${encodeURIComponent(layerConfig.type)}&maxFeatures=500000000&srsName=EPSG:4326&outputFormat=application/json`;
    this.loadGeoJson(url, layerConfig.name, { color: layerConfig.color, weight: layerConfig.weight ?? 1.5 });
    if (layerName == 'geojsonCheckDam') {
      this.loadGeoJson(
        'http://183.82.114.29:9901/geoserver/ws_figs/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=ws_figs:Checkdam_Phase2&outputFormat=application/json',
        'geojsonCheckDam',
        { color: 'red', weight: 0.1 }
      );
    }
  }

  loadGeoJson(url: string, layerName: string, style: any) {

    // ✅ Remove existing layer if already added
    const existingLayer = this.layerDetailsArray.find(x => x.layername === layerName);
    if (existingLayer) {
      this.map.removeLayer(existingLayer.layer);
      this.layerDetailsArray = this.layerDetailsArray.filter(x => x.layername !== layerName);
    }

    // ✅ 👉 HANDLE PPA AS WMS
    if (layerName === 'ppa') {

      // 🔥 REMOVE ALL GEOJSON GRID LAYERS (important)
      this.layerDetailsArray.forEach(l => {
        if (l.layername !== 'ppa') {
          this.map.removeLayer(l.layer);
        }
      });

      const wmsLayer = L.tileLayer.wms(
        'http://183.82.114.29:9901/geoserver/ws_figs/wms',
        {
          layers: 'ws_figs:ppa_intersect',
          format: 'image/png',
          transparent: true
        }
      );

      this.layerDetailsArray.push({
        layername: layerName,
        layer: wmsLayer
      });

      this.map.addLayer(wmsLayer);

      return;
    }

    // ✅ NORMAL GEOJSON FLOW
    this.http.get(url).subscribe({
      next: (res: any) => {

        if (!res || !res.features) {
          this.layerDetailsArray.push({
            layername: layerName,
            layer: L.geoJSON()
          });
          return;
        }

        const geoLayer = L.geoJSON(res, {

          // ✅ For polygons/lines
          style: () => ({
            color: style.color || 'red',
            weight: style.weight || 2,
            fill: false,
            fillOpacity: 0
          }),

          // ✅ 👉 ADD THIS FOR POINTS
          pointToLayer: (feature: any, latlng: any) => {
            return L.circleMarker(latlng, {
              radius: 3,              // 🔥 small like a point
              color: style.color || 'red',
              fillColor: 'red',
              fillOpacity: 1,
              weight: 0
            });
          },

          onEachFeature: (feature: any, layer: any) => {
            let popup = '<b>Attributes</b><br>';

            if (feature?.properties) {
              Object.keys(feature.properties).forEach(key => {
                popup += key + ' : ' + feature.properties[key] + '<br>';
              });
            }

            layer.bindPopup(popup, { maxHeight: 200 });
          }
        });

        this.layerDetailsArray.push({
          layername: layerName,
          layer: geoLayer
        });

        this.map.addLayer(geoLayer);

        if (layerName === 'geojsonLayer') {
          //setTimeout(() => this.fitToStateBoundary(), 300);
        }
      }
    });
  }
  toggleInfo() {
    this.infoMode = !this.infoMode;

    if (this.infoMode) {
      this.map.getContainer().style.cursor = 'pointer';
      this.map.on('click', this.onMapClick, this);
    } else {
      this.map.getContainer().style.cursor = '';
      this.map.off('click', this.onMapClick, this);
      this.map.closePopup();
    }
  }


  onMapClick(e: any) {
    if (!this.infoMode) return;

    let geoContent = `<b style="color:black">Information</b><br>`;
    let geoFound = false;

    // =========================
    // ✅ 1. GEOJSON
    // =========================
    this.map.eachLayer((layer: any) => {
      if (layer.feature) {

        let isHit = false;

        if (layer.getBounds && layer.getBounds().contains(e.latlng)) {
          isHit = true;
        }

        if (!isHit && layer.getLatLng) {
          const latlng = layer.getLatLng();
          if (latlng.distanceTo(e.latlng) < 20) {
            isHit = true;
          }
        }

        if (isHit) {
          geoFound = true;

          const props = layer.feature.properties || {};
          geoContent += `<b style="color:blue">Layer Info</b><br>`;

          Object.keys(props).forEach(key => {
            if (props[key] != null) {
              geoContent += `<b>${key}:</b> ${props[key]}<br>`;
            }
          });

          geoContent += `<hr>`;
        }
      }
    });

    // =========================
    // ✅ 2. CHECK PPA ACTIVE (NO VARIABLE)
    // =========================
    let isPpaVisible = false;

    this.map.eachLayer((layer: any) => {
      if (
        layer._url &&
        layer._url.includes('geoserver') &&
        layer.wmsParams &&
        layer.wmsParams.layers === 'ws_figs:ppa_intersect'
      ) {
        isPpaVisible = true;
      }
    });

    // =========================
    // ✅ 3. IF NO PPA → GEOJSON ONLY
    // =========================
    if (!isPpaVisible) {
      if (geoFound) {
        L.popup().setLatLng(e.latlng).setContent(geoContent).openOn(this.map);
      } else {
        this.showLatLngPopup(e);
      }
      return;
    }

    // =========================
    // ✅ 4. WMS CALL
    // =========================
    const point = this.map.latLngToContainerPoint(e.latlng);
    const size = this.map.getSize();

    const url = `
  http://183.82.114.29:9901/geoserver/ws_figs/wms
  ?service=WMS
  &version=1.1.1
  &request=GetFeatureInfo
  &layers=ws_figs:ppa_intersect
  &query_layers=ws_figs:ppa_intersect
  &styles=
  &bbox=${this.map.getBounds().toBBoxString()}
  &feature_count=10
  &height=${size.y}
  &width=${size.x}
  &info_format=application/json
  &srs=EPSG:4326
  &x=${Math.floor(point.x)}
  &y=${Math.floor(point.y)}
  `;

    this.http.get(url).subscribe((res: any) => {

      let ppaFound = false;
      let ppaContent = `<b style="color:green">PPA Info</b><br>`;

      if (res.features && res.features.length > 0) {

        res.features.forEach((f: any) => {
          const props = f.properties || {};

          let allowedFields = [
            'FID_PPA',
            'PPA_Score',
            'Beat_Name',
            'Range',
            'Sub_Divisi',
            'District_F'
          ];

          allowedFields.forEach(key => {
            if (props[key] != null) {
              ppaContent += `<b>${key}:</b> ${props[key]}<br>`;
            }
          });

          ppaContent += `<hr>`;
        });

        ppaFound = true;
      }

      // =========================
      // ✅ 5. FINAL OUTPUT
      // =========================
      if (ppaFound) {
        L.popup().setLatLng(e.latlng).setContent(ppaContent).openOn(this.map);
      }
      else if (geoFound) {
        L.popup().setLatLng(e.latlng).setContent(geoContent).openOn(this.map);
      }
      else {
        this.showLatLngPopup(e);
      }

    }, () => {
      if (geoFound) {
        L.popup().setLatLng(e.latlng).setContent(geoContent).openOn(this.map);
      } else {
        this.showLatLngPopup(e);
      }
    });
  }
  showLatLngPopup(e: any) {
    throw new Error('Method not implemented.');
  }

  private updateMarkers() {
    // 1. Clear existing markers from previous filter
    this.markerLayer.clearLayers();

    if (!this.data || this.data.length === 0) return;

    const bounds: L.LatLngExpression[] = [];

    // 2. Loop through DB Data
    this.data.forEach((item: any) => {
      // Check if DB record has coordinates
      if (item.lat && item.lng) {
        const lat = parseFloat(item.lat);
        const lng = parseFloat(item.lng);
        const pos: L.LatLngExpression = [lat, lng];

        // 3. Create Dynamic Popup content from any DB keys
        const popupContent = `
          <div style="font-family: Poppins; padding: 5px;">
            <b style="color: #6366f1;">${item.shg_name || item.name_of_committee || 'Details'}</b><br/>
            <small>ID: ${item.jfmc_id || item.loan_id || 'N/A'}</small><br/>
            <hr style="margin: 5px 0; border: 0; border-top: 1px solid #eee;">
            <span>Status: ${item.status || 'Active'}</span>
          </div>
        `;

        const marker = L.marker(pos).bindPopup(popupContent);
        this.markerLayer.addLayer(marker);
        bounds.push(pos);
      }
    });

    // 4. DYNAMIC VIEW: Automatically zoom and center to fit all markers from DB
    if (bounds.length > 0) {
      this.map.fitBounds(L.latLngBounds(bounds), { padding: [30, 30] });
    }
  }
}