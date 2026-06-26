import { AfterViewInit, Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import Chart from 'chart.js/auto';
import { ServerRequests } from '../../../services/ServerRequests';
import * as L from 'leaflet';
import html2canvas from 'html2canvas';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-capacity-dashboard',
  templateUrl: './capacitydashboard.component.html',
  styleUrls: ['./capacitydashboard.component.css']
})
export class CapacityDashboardComponent implements AfterViewInit, OnInit {
  districttype: any[] = [];
  division: any = [];
  range: any = [];
  selectedDistrict: any;

  divisionchange: any;
  rangechanged: any;
  schematype: string[] = [];
  schemaname: any;
  allbeatsdata: any;
  cardsdata: any;
  stats: StatItem[] = []; // Default empty

  trainingActivityChart?: Chart;
  participantTypeChart?: Chart;
  trainingByTypeChart?: Chart;
  participantTypeOfficersChart?: Chart;

  markersLayer!: L.LayerGroup;
  schemaMaster: any[] = [];
  @ViewChild('map') mapContainer!: ElementRef;
  private map!: L.Map;
  dashboarddata: boolean = false;

   showBasemapMenu: boolean = false;
  activeBaseLayerName: string = 'osm';
  osm: any; 

  @ViewChild('trainingbyactivity') TrainingByactivity!: ElementRef<HTMLCanvasElement>;
  @ViewChild('particiantstype') participanttype!: ElementRef<HTMLCanvasElement>;
  @ViewChild('participanttypeofficers') participanttypeofficers!: ElementRef<HTMLCanvasElement>;
  @ViewChild('trainingbytype') trainingbytype!: ElementRef<HTMLCanvasElement>;

  // --- COLORFUL PALETTE ---
  private brightColors = [
    '#FF6384', // Red/Pink
    '#36A2EB', // Blue
    '#FFCE56', // Yellow
    '#4BC0C0', // Teal
    '#9966FF', // Purple
    '#FF9F40', // Orange
    '#C9CBCF'  // Gray
  ];
  layerDetailsArray: any[] = [];
  actuallayername: string = '';
  geoServerUrl: string = '';
  currentBaseLayer: any;
  googleStreets: any;
  googleSatellite: any;
  drawnItems!: L.FeatureGroup;
  drawControl: any;
  infoMode: boolean = false;


  constructor(public coreservices: ServerRequests,
    private http: HttpClient,
  ) {
    this.geoServerUrl = this.coreservices.Geoserver_URl;
  }

  ngOnInit() {
    // Initial placeholders
    this.stats = [
      { title: 'Trainings Expected', value: 0, icon: '📅' },
      { title: 'Trainings Conducted', value: 0, icon: '✅' },
      { title: 'Participants Expected', value: 0, icon: '👥' },
      { title: 'Participants Attended', value: 0, icon: '🎓' }
    ];


    this.getallgeo();
    this.getLookups();
    this.loadLayerByName('geojsonLayer');
    this.loadLayerByName('geojsonforestRange');
   
    // STEP 1: Load All Geo Data FIRST. 
    // We cannot populate dropdowns until this finishes.
    this.getallgeo();
    this.getLookups();


  }
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
  ngAfterViewInit(): void {
    this.initMap();
    this.toggleInfo();
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

  downloadDashboard() {
    const dashboardElement = document.getElementById('dashboard-container');
    if (dashboardElement) {
      html2canvas(dashboardElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#f0f2f5'
      }).then(canvas => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'Capacity_Dashboard_Report.png';
        link.click();
      }).catch(err => console.error("Error capturing dashboard:", err));
    }
  }

  initMap() {
    this.map = L.map('map', {
      zoomControl: true
    }).setView([23.8315, 91.2868], 8);

    this.osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'OpenStreetMap'
    });


    this.googleStreets = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      attribution: 'Google Streets'
    });

    this.googleSatellite = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      attribution: 'Google Satellite'
    });

    this.osm.addTo(this.map);
    this.activeBaseLayerName = 'osm';

    L.control.zoom({ position: 'topright' }).addTo(this.map);
    this.drawnItems = new L.FeatureGroup();
    this.map.addLayer(this.drawnItems);

    this.map.on('draw:created', (e: any) => {
      const layer = e.layer;
      const type = e.layerType;
      if (type === 'polyline') {
        const latlngs = layer.getLatLngs();
        let totalDistance = 0;
        for (let i = 0; i < latlngs.length - 1; i++) {
          totalDistance += latlngs[i].distanceTo(latlngs[i + 1]);
        }
        const distanceKm = (totalDistance / 1000).toFixed(2);
        layer.bindPopup("Distance : " + distanceKm + " km").openPopup();
      }
      if (type === 'polygon') {
        const latlngs = layer.getLatLngs()[0];
        const area = (L as any).GeometryUtil.geodesicArea(latlngs);
        const areaKm = (area / 1000000).toFixed(2);
        layer.bindPopup("Area : " + areaKm + " km²").openPopup();
      }
      this.drawnItems.addLayer(layer);
    });
      this.markersLayer = L.layerGroup().addTo(this.map);
  }


   toggleBasemapMenu() {
    this.showBasemapMenu = !this.showBasemapMenu;
  }

  changeBaseMap(type: string) {
    this.activeBaseLayerName = type;

    // Remove current base layers
    if (this.map.hasLayer(this.osm)) this.map.removeLayer(this.osm);
    if (this.map.hasLayer(this.googleStreets)) this.map.removeLayer(this.googleStreets);
    if (this.map.hasLayer(this.googleSatellite)) this.map.removeLayer(this.googleSatellite);

    // Add the selected one
    if (type === 'streets') this.googleStreets.addTo(this.map);
    else if (type === 'satellite') this.googleSatellite.addTo(this.map);
    else if (type === 'osm') this.osm.addTo(this.map);

    // Keep tiles in the back so your geojson/markers stay on top
    [this.osm, this.googleStreets, this.googleSatellite].forEach(l => {
      if (l && this.map.hasLayer(l)) l.bringToBack();
    });

    this.showBasemapMenu = false;
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
         // setTimeout(() => this.fitToStateBoundary(), 300);
        }
      }
    });
  }
 

  getLookups() {
    this.coreservices.getAllLookUps(1).subscribe({
      next: res => {
        const schemaArray = res.Data.scheme_master;
        this.schemaMaster = schemaArray;
        if (!schemaArray) return;
        const list = Array.isArray(schemaArray) ? schemaArray : [schemaArray];
        this.schematype = [...new Set(list.map(item => item.scheme_name))];
      },
      error: err => console.error('Lookup Error:', err)
    });
  }

  getallgeo() {
    this.coreservices.getAllGeo(1).subscribe({
      next: res => {
        this.allbeatsdata = res?.Data ?? [];
        sessionStorage.setItem("jurisdictionDetails", JSON.stringify(this.allbeatsdata));

        // STEP 3: Once Geo data is saved, NOW we get the user's jurisdiction
        this.getjuridictiondetails();
      },
      error: err => console.error('Grid Data Error:', err)
    });
  }

  getjuridictiondetails() {
    const data = sessionStorage.getItem('Session');
    if (!data) {
      // If no user session, just load global dashboard
      this.getdashboardfilter();
      return;
    }

    const parsedData = JSON.parse(data);
    const userId = parsedData.Data[0].user_id;

    this.coreservices.getjuridictiondetails(userId).subscribe({
      next: res => {
        const userdata = res?.Data ?? [];
        if (!userdata.length) {
          this.getdashboardfilter(); // Load global if no jurisdiction
          return;
        }

        const jurisdictionObj = JSON.parse(userdata[0].jurisdiction_details);

        // Populate District Dropdown
        if (jurisdictionObj.Jurisdiction && jurisdictionObj.Jurisdiction.district) {
          this.districttype.push(...jurisdictionObj.Jurisdiction.district);

          // STEP 4: Set Default Selected District
          this.selectedDistrict = this.districttype[0];

          // STEP 5: Manually trigger the change logic to populate 'Sub Division' dropdown
          this.onDistrictChange(this.selectedDistrict);

          // STEP 6: Load Dashboard Charts for this district
          this.getdashboardfilter();
        } else {
          // Fallback if no district in jurisdiction
          this.getdashboardfilter();
        }
      },
      error: err => {
        console.error('Jurisdiction Error:', err);
        this.getdashboardfilter(); // Fallback load
      }
    });
  }

  onDistrictChange(value: any) {
    this.selectedDistrict = value;

    // --- Reset Child Selections to avoid filtering by old/wrong sub-division ---
    this.divisionchange = null; // or undefined
    this.rangechanged = null;
    this.range = [];
    // --------------------------------------------------------------------------

    // Trigger API Load
    this.getdashboardfilter();

    if (!this.selectedDistrict) return;

    // Populate Sub Division Options
    const district = this.selectedDistrict.toLowerCase();
    const beatsStr = sessionStorage.getItem('jurisdictionDetails');
    if (!beatsStr) return;

    const beats: any[] = JSON.parse(beatsStr);
    const districtBeats = beats.filter(b => b?.district_name?.toLowerCase() === district);

    const uniqueSubdivisions = Array.from(new Map(districtBeats.map(b => [b.subdivision_id, {
      subdivision_id: b.subdivision_id,
      subdivision_name: b.subdivision_name,
    }])).values());

    this.division = [];
    uniqueSubdivisions.forEach((item: any) => this.division.push(item.subdivision_name));
  }


  subdivisionchange(subdivision: any) {
    this.divisionchange = subdivision;

    // --- Reset Child Selection ---
    this.rangechanged = null;
    // -----------------------------

    // Trigger API Load
    this.getdashboardfilter();

    // Populate Range Options
    this.range = [];
    const beatsStr = sessionStorage.getItem('jurisdictionDetails');
    if (!beatsStr) return;
    const beats: any[] = JSON.parse(beatsStr);
    const normalize = (v: any) => (v ?? '').toString().trim().toLowerCase();
    const subdivisionNormalized = normalize(subdivision);
    const rangebeats = beats.filter(b => normalize(b.subdivision_name) === subdivisionNormalized);

    const uniquerange = Array.from(new Map(rangebeats.map(b => [b.range_name, { rangename: b.range_name }])).values());
    uniquerange.forEach((item: any) => this.range.push(item.rangename));
  }

  rangechange(event: any) {
    this.rangechanged = event;
    // Trigger API Load
    this.getdashboardfilter();
  }

  selectedschematype(event: any) {
    const data = this.schemaMaster.find(c => c.scheme_name === event);
    if (data != null) {
      this.schemaname = data.id;
    }


    // Trigger API Load
    this.getdashboardfilter();
  }

  getdashboardfilter() {
    console.log("Fetching Data for:", this.selectedDistrict);
    this.coreservices.getcapacitydashboarddata(
      this.selectedDistrict,
      this.divisionchange,
      this.rangechanged,
      this.schemaname
    ).subscribe({
      next: res => {
        console.log("API Response:", res);
        this.cardsdata = res?.Data;
        this.dashboarddata = true;
        if (!this.cardsdata) return;

        this.stats = [
          { title: 'Trainings Expected', value: this.cardsdata.training_expected ?? 0, icon: '📅' },
          { title: 'Trainings Conducted', value: this.cardsdata.training_conducted ?? 0, icon: '✅' },
          { title: 'Participants Expected', value: this.cardsdata.participant_expected ?? 0, icon: '👥' },
          { title: 'Participants Attended', value: this.cardsdata.participant_attended ?? 0, icon: '🎓' }
        ];

        this.rendertraininactivityChart();
        this.renderPartispantstypeChart();
        this.renderparticipanttypeofficersChart();
        this.rendertrainingbytypecharts();
        this.renderTrainingLocationMap();
      },
      error: err => console.error('Dashboard Error:', err)
    });
  }

  // --- CHART RENDERING (UPDATED FOR COLOR & TYPES) ---

  rendertraininactivityChart() {
    if (!this.cardsdata) return;
    const dashboardData = typeof this.cardsdata === 'string' ? JSON.parse(this.cardsdata) : this.cardsdata;
    const activityData = dashboardData.training_by_activity_type ?? [];
    if (!activityData.length) return;

    const labels = activityData.map((item: any) => item.activity_type);
    const values = activityData.map((item: any) => item.count);

    if (this.trainingActivityChart) this.trainingActivityChart.destroy();

    this.trainingActivityChart = new Chart(this.TrainingByactivity.nativeElement, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: this.brightColors, // Colorful
          borderWidth: 2,
          borderColor: '#ffffff',
          hoverOffset: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: {
            position: 'right',
            labels: { usePointStyle: true, font: { family: 'Poppins', size: 11 } }
          }
        }
      }
    });
  }

  renderPartispantstypeChart() {
    const dashboardData = typeof this.cardsdata === 'string' ? JSON.parse(this.cardsdata) : this.cardsdata;
    const activityData = dashboardData.training_parti_comm_social ?? [];
    if (!activityData.length) return;

    const labels = activityData.map((item: any) => item.social_category);
    const values = activityData.map((item: any) => item.count);

    if (this.participantTypeChart) this.participantTypeChart.destroy();

    this.participantTypeChart = new Chart(this.participanttype.nativeElement, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Participants',
          data: values,
          backgroundColor: this.brightColors, // Colorful Bars
          borderRadius: 8,
          barThickness: 30
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: { color: '#f0f2f5' },
            ticks: { font: { family: 'Poppins' } }
          },
          y: {
            grid: { display: false },
            ticks: { font: { family: 'Poppins', weight: 'bold' } } // Fixed: use 'bold'
          }
        },
        plugins: { legend: { display: false } }
      }
    });
  }

  renderparticipanttypeofficersChart() {
    const dashboardData = typeof this.cardsdata === 'string' ? JSON.parse(this.cardsdata) : this.cardsdata;
    const activityData = dashboardData.training_parti_dept_lvlpar ?? [];
    if (!activityData.length) return;

    const labels = activityData.map((item: any) => item.lvl_of_participant);
    const values = activityData.map((item: any) => item.count);

    if (this.participantTypeOfficersChart) this.participantTypeOfficersChart.destroy();

    this.participantTypeOfficersChart = new Chart(this.participanttypeofficers.nativeElement, {
      type: 'polarArea', // Changed to Polar Area for more visual variety
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: { usePointStyle: true, font: { family: 'Poppins', size: 11 } }
          }
        }
      }
    });
  }

  rendertrainingbytypecharts() {
    const dashboardData = typeof this.cardsdata === 'string' ? JSON.parse(this.cardsdata) : this.cardsdata;
    const activityData = dashboardData.training_by_participant_type ?? [];
    if (!activityData.length) return;

    const labels = activityData.map((item: any) => item.activity_type);
    const values = activityData.map((item: any) => item.count);

    if (this.trainingByTypeChart) this.trainingByTypeChart.destroy();

    this.trainingByTypeChart = new Chart(this.trainingbytype.nativeElement, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Count',
          data: values,
          backgroundColor: '#9966FF', // Distinct Purple
          borderRadius: 8,
          barThickness: 30
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: { color: '#f0f2f5' },
            ticks: { font: { family: 'Poppins' } }
          },
          y: {
            grid: { display: false },
            ticks: { font: { family: 'Poppins', weight: 'bold' } } // Fixed: use 'bold'
          }
        },
        plugins: { legend: { display: false } }
      }
    });
  }

  renderTrainingLocationMap() {
    const redIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png', // Violet marker
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    const dashboardData = typeof this.cardsdata === 'string' ? JSON.parse(this.cardsdata) : this.cardsdata;
    const locations = dashboardData.training_part_location_department_community ?? [];

    if (!locations.length) return;

    this.markersLayer.clearLayers();

    locations.forEach((item: any) => {
      const marker = L.marker([item.lat, item.lng], { icon: redIcon })
        .bindPopup(`
          <div style="font-family:Poppins; font-size:13px;">
            <strong style="color:#764ba2">Training_Id:${item.training_id}</strong><br/>
            Topic:${item.topic}<br/>
            <span style="color:#718096; font-size:11px;">Department:${item.department}</span>
          </div>
        `);
      this.markersLayer.addLayer(marker);
    });

    const group = new L.FeatureGroup(locations.map((item: any) => L.marker([item.lat, item.lng])));
    this.map.fitBounds(group.getBounds().pad(0.2));
    setTimeout(() => { this.map.invalidateSize(); }, 300);
  }
}

interface StatItem {
  title: string;
  value: number;
  icon?: string;
}
