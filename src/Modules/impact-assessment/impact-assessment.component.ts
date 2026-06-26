
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import Chart from 'chart.js/auto';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ServerRequests } from '../../services/ServerRequests';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-impact-assessment',
  templateUrl: './impact-assessment.component.html',
  styleUrls: ['./impact-assessment.component.css']
})
export class ImpactAssessmentComponent implements AfterViewInit {
 map!: L.Map;
  showLayers = false;
  geoServerUrl: any;
  layerDetailsArray: any[] = [];
  drawnItems!: L.FeatureGroup;
  drawControl: any;
  expandedNodes: { [key: string]: boolean } = {};
  slider: any = null;  // For side-by-side slider
  layerOpacity: number = 100;  // Opacity slider (0-100%)
  selectedResYear: string = 'geojsonReSurvey';  // Year slider

  // NEW: State for checkboxes
  checkedStates: { [key: string]: boolean } = {};

  // API and Data properties
  jurisdictionDetails: any[] = [];
  jurisdictionDetailsAssigned: any = {};
  smcDashboardData: any;

  // Dropdowns data
  districtsList: any[] = [];
  subdivisionsList: any[] = [];
  rangesList: any[] = [];
  beatsList: any[] = [];
  jfmcList: any[] = [];
  schemesList: any[] = [];
isDarkMode: boolean = false; 
  // Selected values
  selectedDistrict: string = '';
  selectedSubdivision: string = '';
  selectedRange: string = '';
  selectedBeat: string = '';
  selectedJFMC: string = '';
  selectedScheme: string = '';
  googleStreets: any;
  googleSatellite: any;
  googleHybrid: any;
  activeBaseLayer: L.TileLayer | null = null;
  showBasemapMenu = false;
  activeBaseLayerName: string = '';
  rasterdataonly:boolean = false;
  showDataGrid: boolean = false;
  activeImpactLayer: any;
  fcd: boolean=false;
  showLulcLegend: boolean=false;
  barChart: any;
  lineChart: any;
  showCharts :boolean = false;
  showChangeDetectionLegend:boolean = false;
  selectedLayer: string = '';

  staticTableData = [
    { slNo: 1, reference: 'Scrub Land', new: 'Scrub Land', change: 'No Change', area: 4.19 },
    { slNo: 2, reference: 'Open Forest', new: 'Scrub Land', change: 'Open Forest - Scrub Land', area: 838.08 },
    { slNo: 3, reference: 'Moderate Dense Forest', new: 'Scrub Land', change: 'Moderate Dense Forest - Scrub Land', area: 12909.49 },
    { slNo: 4, reference: 'Very Dense Forest', new: 'Scrub Land', change: 'Very Dense Forest - Scrub Land', area: 9907.15 },
  ];

forestChartData = [
  { label: 'Scrub', area23: 35.7, area25: 23658.91 },
  { label: 'Open', area23: 7052.48, area25: 99369.68 },
  { label: 'Moderate', area23: 171432.9, area25: 130013.04 },
  { label: 'Very Dense', area23:144387.24 , area25: 69451.8 }
];

// normalize values
getHeight(value: number): number {
  const max = 160000;
  return (value / max) * 100;
}
  chartContainer: any;
  renderer: any;

  constructor(
    private http: HttpClient,
    public service: ServerRequests
  ) {
    this.geoServerUrl = this.service.Geoserver_URl;
  }

  managerTeam = [
    {
      "id": "j1",
      "text": "Admin Boundary",
      "children": [
        { "parent": "j1", "id": "j1_1", "text": "State Boundary", "layername": "geojsonLayer" },
        { "parent": "j1", "id": "j1_2", "text": "District Boundary", "layername": "geojsonDistrict" },
        { "parent": "j1", "id": "j1_6", "text": "Range Boundry", "layername": "geojsonforestRange" },
        { "parent": "j1", "id": "j1_3", "text": "Beat Boundary", "layername": "geojsonBeat" },
        { "parent": "j1", "id": "j1_4", "text": "JFMC Project Boundary Area", "layername": "geojsonJfmc" },
        { "parent": "j1", "id": "j1_5", "text": "Recorded Forest Area", "layername": "geojsonLayerRecorded_forest_area" },
        { "parent": "j1", "id": "j1_6_c", "text": "Compartment Boundary", "layername": "geojsonLayerCompartment_boundary" },
      ]
    },
    {
      "id": "j2",
      "text": "Collected Data",
      "children": [
        {
          "parent": "j2",
          "id": "j2_1",
          "text": "Plantation",
          "children": [
            { "parent": "j2_1", "id": "j2_1_1", "text": "Pre-Survey", "layername": "geojsonPlantationPreSurvey" },
            {
              "parent": "j2_1",
              "id": "j2_1_2",
              "text": "Re-Survey",
              "children": [
                { "parent": "j2_1_2", "id": "j2_1_2_1", "text": "Re-Survey 2020-21", "layername": "geojsonReSurvey" },
                { "parent": "j2_1_2", "id": "j2_1_2_2", "text": "Re-Survey 2021-22", "layername": "geojsonReSurvey_21" },
                { "parent": "j2_1_2", "id": "j2_1_2_3", "text": "Re-Survey 2022-23", "layername": "geojsonReSurvey_22" },
                { "parent": "j2_1_2", "id": "j2_1_2_4", "text": "Re-Survey 2023-24", "layername": "geojsonReSurvey_23" },
                { "parent": "j2_1_2", "id": "j2_1_2_5", "text": "Re-Survey 2024-25", "layername": "geojsonReSurvey_24" },
                { "parent": "j2_1_2", "id": "j2_1_2_6", "text": "Re-Survey 2025-26", "layername": "geojsonReSurvey_25" }
              ]
            }
          ]
        },
        {
          "parent": "j2",
          "id": "j2_2",
          "text": "Agroforestry",
          "children": [
            { "parent": "j2_2", "id": "j2_2_1", "text": "Pre-Survey", "layername": "geojsonAgroforestryPreSurvey" },
            { "parent": "j2_2", "id": "j2_2_2", "text": "Re-Survey", "layername": "geojsonAgroforestryReSurvey" }
          ]
        },
        {
          "parent": "j2",
          "id": "j2_3",
          "text": "Location Data",
          "children": [
            { "parent": "j2_3", "id": "j2_3_1", "text": "Nursery", "layername": "geojsonNursery" },
            { "parent": "j2_3", "id": "j2_3_2", "text": "Live stock", "layername": "geojsonLivestock" },
            { "parent": "j2_3", "id": "j2_3_3", "text": "Fishery", "layername": "geojsonFishery" },
            { "parent": "j2_3", "id": "j2_3_4", "text": "Eco-Tourism Site", "layername": "geojsonEcoTourism" },
            { "parent": "j2_3", "id": "j2_3_5", "text": "Home Stay Site", "layername": "geojsonHomeStay" },
            { "parent": "j2_3", "id": "j2_3_6", "text": "NTFP Centre", "layername": "geojsonNTFPCentre" },
            { "parent": "j2_3", "id": "j2_3_7", "text": "NCE Outlets", "layername": "geojsonNCEOutlets" },
            { "parent": "j2_3", "id": "j2_3_8", "text": "Public Facility", "layername": "geojsonPublicFacility" }
          ]
        },
        { "parent": "j2", "id": "j2_4", "text": "NTFP Resource Map", "layername": "geojsonNTFPResourceMap" }
      ]
    },
    {
      "id": "j3",
      "text": "BFBP Layers (1:25000)",
      "children": [
        {
          "parent": "j3",
          "id": "j3_1",
          "text": "Satellite Image Analytics",
          "children": [
            { "parent": "j3_1", "id": "j3_1_1", "text": "Forest Degradation Status Map", "layername": "fdsMapRaster" },
            { "parent": "j3_1", "id": "j3_1_2", "text": "Forest Degradation Grid Map", "layername": "FDS_Grid" },
            { "parent": "j3_1", "id": "j3_1_3", "text": "Canopy Density & VegetationType", "layername": "geojsonCanopyDensity" },
            { "parent": "j3_1", "id": "j3_1_4", "text": "Project Priority Area", "layername": "ppa" },
            { "parent": "j3_1", "id": "j3_1_5", "text": "Landuse / Land cover", "layername": "lulcLayer" },
            { "parent": "j3_1", "id": "j3_1_6", "text": "Soil Erosion", "layername": "soil_erosion" }
          ]
        },
        {
          "parent": "j3",
          "id": "j3_2",
          "text": "DEM Analytics",
          "children": [
            { "parent": "j3_2", "id": "j3_2_1", "text": "Forest Slope Status Map", "layername": "demforestslope" },
            { "parent": "j3_2", "id": "j3_2_2", "text": "Forest Slope Grid Map", "layername": "geojsonForestSlopeGrid" },
            { "parent": "j3_2", "id": "j3_2_3", "text": "Microwatershed", "layername": "geojsonMicrowatershed" },
            { "parent": "j3_2", "id": "j3_2_4", "text": "Contour", "layername": "geojsonContour" },
            { "parent": "j3_2", "id": "j3_2_5", "text": "Streams", "layername": "geojsonStreams" }
          ]
        },
        {
          "parent": "j3",
          "id": "j3_3",
          "text": "Digitized / Plotted Vector Data",
          "children": [
            { "parent": "j3_3", "id": "j3_3_1", "text": "Residential Areas ", "layername": "geojsonResidentialAreas" },
            { "parent": "j3_3", "id": "j3_3_2", "text": "Road", "layername": "geojsonRoad" },
            { "parent": "j3_3", "id": "j3_3_3", "text": "Rivers", "layername": "geojsonRivers" },
            { "parent": "j3_3", "id": "j3_3_4", "text": "JFMC Locations", "layername": "geojsonJFMCLocations" },
            { "parent": "j3_3", "id": "j3_3_5", "text": "Check Dam", "layername": "geojsonCheckDam" },
            { "parent": "j3_3", "id": "j3_3_6", "text": "Public Facility", "layername": "geojsonBFBPPublicFacility" },
            { "parent": "j3_3", "id": "j3_3_7", "text": "Office Locations", "layername": "geojsonOfficeLocations" },
            { "parent": "j3_3", "id": "j3_3_8", "text": "Nursery", "layername": "geojsonBFBPNursery" },
            { "parent": "j3_3", "id": "j3_3_9", "text": "Eco-park & Gardens", "layername": "geojsonEcoParkGardens" },
            { "parent": "j3_3", "id": "j3_3_10", "text": "Agroforestry Points", "layername": "geojsonAgroforestryPoints" }
          ]
        }
      ]
    },
    {
      "id": "j4",
      "text": "JFMC Layers (1:12500)",
      "children": [
        {
          "parent": "j4",
          "id": "j4_1",
          "text": "Satellite Image Analytics",
          "children": [
            { "parent": "j4_1", "id": "j4_1_1", "text": "Vegetation Type", "layername": "geojsonJFMCVegetationType" },
            { "parent": "j4_1", "id": "j4_1_2", "text": "Forest Cover Map", "layername": "geojsonJFMCForestCover" },
            { "parent": "j4_1", "id": "j4_1_3", "text": "Landuse Map", "layername": "geojsonJFMCLanduse" }
          ]
        },
        {
          "parent": "j4",
          "id": "j4_3",
          "text": "Digitized / Plotted Vector Data",
          "children": [
            { "parent": "j4_3", "id": "j4_3_1", "text": "Road", "layername": "geojsonJFMCRoad" },
            { "parent": "j4_3", "id": "j4_3_2", "text": "Water Body", "layername": "geojsonJFMCRivers" },
            { "parent": "j4_3", "id": "j4_3_3", "text": "Rivers", "layername": "geojsonRivers" },
            { "parent": "j4_3", "id": "j4_3_5", "text": "Check Dam", "layername": "geojsonJFMCCheckDam" },
            { "parent": "j4_3", "id": "j4_3_6", "text": "Public Facility", "layername": "geojsonJFMCPublicFacility" },
            { "parent": "j4_3", "id": "j4_3_7", "text": "Residential Map", "layername": "geojsonJFMCResidential" }
          ]
        }
      ]
    }
  ];

  layerConfig = [
    { name: 'geojsonLayer', type: 'State_Boundary', color: 'blue', weight: 3 },
    { name: 'geojsonDistrict', type: 'Forest_District', color: 'red', weight: 1.5 },
    { name: 'geojsonBeat', type: 'Forest_beat_148', color: 'green', weight: 1.5 },
    { name: 'geojsonJfmc', type: 'JFMC_Boundary', color: 'yellow', weight: 1.5 },
    { name: 'geojsonLayerRecorded_forest_area', type: 'Total_Forest', color: 'brown', weight: 1.5 },
    { name: 'geojsonLayerCompartment_boundary', type: 'Compartment_Boundary_Working_Circle', color: 'black', weight: 1.5 },
    { name: 'geojsonforestRange', type: 'Forest_Range', color: '#f9ed08', weight: 2 },
    { name: 'geojsonPlantationPreSurvey', type: 'Scatform_presurvey', color: '#0288D1', weight: 0.8 },
    { name: 'geojsonReSurvey', type: 'Scatform_resurvey_2020-21', color: '#d11002', weight: 2 },
    { name: 'geojsonReSurvey_21', type: 'Scatform_resurvey_2021-22', color: '#3602d1', weight: 2},
    { name: 'geojsonReSurvey_22', type: 'Scatform_resurvey_2022-23', color: '#d1d102', weight: 2},
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
    { name: 'ppa', type: 'PPA_Intersect', color: '#888800', weight: 1 },
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
   renderDynamicChart() {
    // 1. Clear previous canvas if any
    const container = this.chartContainer.nativeElement;
    container.innerHTML = '';

    // 2. Create Canvas Element dynamically (No canvas in HTML)
    const canvas = this.renderer.createElement('canvas');
    this.renderer.setAttribute(canvas, 'id', 'dynamicBarChart');
    this.renderer.appendChild(container, canvas);

    // 3. Initialize Chart.js
    new Chart(canvas, {
      type: 'bar',
      data: {
        labels: ['SHG A', 'SHG B', 'SHG C', 'SHG D', 'SHG E'],
        datasets: [{
          label: 'Gradation Value',
          data: [0, 55, 60, 65, 70],
          backgroundColor: [
            'rgba(0,0,0,0)', // SHG A (Empty)
            '#FFC107',       // SHG B (Yellow)
            '#AEEA00',       // SHG C (Lime)
            '#448AFF',       // SHG D (Blue)
            '#00BCD4'        // SHG E (Cyan)
          ],
          barThickness: 35
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            min: 50,
            max: 70,
            ticks: { color: '#666', stepSize: 5 },
            grid: { color: '#1b4d3e' }
          },
          x: {
            ticks: { color: '#666' },
            grid: { display: false }
          }
        }
      }
    });
  }
// Inside your component class
// In your component.ts


calculateHeight(value: number): string {
  const maxValue = 180000; // This matches your Y-axis top value
  if (!value || value <= 0) return '0%';
  
  // Calculate percentage
  let percentage = (value / maxValue) * 100;
  
  // Cap it at 100% so it doesn't break the UI
  if (percentage > 100) percentage = 100;
  
  return percentage + '%'; 
}

  ngAfterViewInit(): void {
    this.initMap();
    this.initializeExpandedNodes();
    this.loadWmsLayers(); // Initialize Raster Layers
    this.loadLayerByName('geojsonLayer');
    this.checkedStates['j1_1'] = true;
    this.changeBaseMap('streets');
    // this.showCharts = true;
  }

chartbutton(){
  this.showCharts  = true;
}
  initializeExpandedNodes() {
    this.managerTeam.forEach(group => {
      this.expandedNodes[group.id] = true;
    });
  }
  

  initMap() {
    this.map = L.map('map', {
      zoomControl: true
    }).setView([23.8315, 91.2868], 8);
    
    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
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

    osm.addTo(this.map);

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
  }

 loadWmsLayers() {
  const wmsBase = this.geoServerUrl + "/geoserver/cite/wms";
  const wmsLayers = [
    { name: 'fdsMapRaster', layer: 'cite:FDS1' },
    { name: 'geojsonCanopyDensity', layer: 'cite:fcd' },
    { name: 'geojsonStreams', layer: 'cite:Streams' },
    { name: 'lulcLayer', layer: 'cite:lulc' },
    { name: 'soil_erosion', layer: 'cite:Potential_Soil_Erosion' },
    { name: 'demforestslope', layer: 'cite:slope' },
    { name: 'geojsonJFMCVegetationType', layer: 'cite:vegetation_type' },
    { name: 'geojsonJFMCForestCover', layer: 'cite:jfmc_fcd' },
    { name: 'geojsonJFMCLanduse', layer: 'cite:jfmc_lulc' },
    { name: 'FCDMarch2025', layer: 'cite:FCD_March_2025_Final' },
    { name: 'fdsMapRasterChangeDetection', layer: 'cite:FCD_Change_Raster_2003_2005' },
  ];

  wmsLayers.forEach(item => {
    const wmsLayer = L.tileLayer.wms(wmsBase, {
      layers: item.layer,
      format: 'image/png', // Must be PNG for transparency
      transparent: true,   // Tells GeoServer to send transparent background
      version: '1.1.0',
      maxZoom: 20,
      opacity: 100,
      uppercase: true,
      className: 'remove-white-bg', // ADD THIS CLASS
    });

    this.layerDetailsArray.push({
      layername: item.name,
      layer: wmsLayer,
    });
  });
}
infoMode = false;

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

  let found = false;

  this.map.eachLayer((layer: any) => {

    if (layer.feature) { // GeoJSON layer

      if (layer.getBounds && layer.getBounds().contains(e.latlng)) {

        found = true;

        const props = layer.feature.properties || {};
        let content = `<b>Information</b><br>`;

        Object.keys(props).forEach(key => {
          content += `<b>${key}:</b> ${props[key]}<br>`;
        });

        if (Object.keys(props).length === 0) {
          content += 'No data available';
        }

        L.popup()
          .setLatLng(e.latlng)
          .setContent(content)
          .openOn(this.map);
      }
    }

  });

  // 👉 If no feature found → show lat/lng
  if (!found) {
    const latlng = e.latlng;

    L.popup()
      .setLatLng(latlng)
      .setContent(`
        <b>Location</b><br>
        Lat: ${latlng.lat.toFixed(5)} <br>
        Lng: ${latlng.lng.toFixed(5)}
      `)
      .openOn(this.map);
  }
}
attachInfoEvent(layer: any, feature: any) {
  layer.on('click', (e: any) => {

    if (!this.infoMode) return;

    // 🚫 Prevent map click from firing
    L.DomEvent.stopPropagation(e);

    const props = feature?.properties || {};

    let content = `<b>Information</b><br>`;

    Object.keys(props).forEach(key => {
      content += `<b>${key}:</b> ${props[key]}<br>`;
    });

    if (Object.keys(props).length === 0) {
      content += 'No data available';
    }

    L.popup()
      .setLatLng(e.latlng)
      .setContent(content)
      .openOn(this.map);
  });
}

zoomToExtent() {
  this.map.setView([23.8315, 91.2868], 8);
}

  setTool(tool: string) {
    if (this.drawControl) {
      this.map.removeControl(this.drawControl);
    }
    if (tool === 'line') {
      this.drawControl = new (L.Control as any).Draw({
        draw: {
          polyline: { shapeOptions: { color: 'red', weight: 4 } },
          polygon: false, rectangle: false, circle: false, marker: false, circlemarker: false
        },
        edit: { featureGroup: this.drawnItems }
      });
      this.map.addControl(this.drawControl);
    }
    if (tool === 'polygon') {
      this.drawControl = new (L.Control as any).Draw({
        draw: {
          polygon: { allowIntersection: false, showArea: true, shapeOptions: { color: 'green' } },
          polyline: false, rectangle: false, circle: false, marker: false, circlemarker: false
        },
        edit: { featureGroup: this.drawnItems }
      });
      this.map.addControl(this.drawControl);
    }
    if (tool === 'pan') {
      this.map.dragging.enable();
    }
  }

  clearDrawings() {
    this.drawnItems.clearLayers();
  }

  toggleSlider(leftLayerName: string = 'fdsMapRaster', rightLayerName: string = 'lulcLayer') {
    const leftLayer = this.layerDetailsArray.find(x => x.layername === leftLayerName);
    const rightLayer = this.layerDetailsArray.find(x => x.layername === rightLayerName);
    if (!leftLayer || !rightLayer) return;
    if (this.slider) {
      this.map.removeControl(this.slider);
      this.slider = null;
    }
    if (!this.map.hasLayer(leftLayer.layer)) this.map.addLayer(leftLayer.layer);
    if (!this.map.hasLayer(rightLayer.layer)) this.map.addLayer(rightLayer.layer);
    this.slider = (L as any).control.sideBySide(leftLayer.layer, rightLayer.layer).addTo(this.map);
    
  }

  deactivateSlider() {
    if (this.slider != null) {
      this.slider.remove();
      this.slider = null;
    }
  }

  loadLayerByName(layerName: string) {
    // 1. Check if it is a pre-loaded WMS layer
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
  }

  loadGeoJson(url: string, layerName: string, style: any) {
    this.http.get(url).subscribe({
      next: (res: any) => {
        if (!res || !res.features) {
          this.layerDetailsArray.push({ layername: layerName, layer: L.geoJSON() });
          return;
        }
        const geoLayer = L.geoJSON(res, {
          style: (feature) => {
            return { color: style.color || 'blue', weight: style.weight || 2, fill: false, fillOpacity: 0 };
          },
          onEachFeature: (feature, layer) => {
            let popup = '<b>Attributes</b><br>';
            for (let key in feature.properties) {
              popup += key + ' : ' + feature.properties[key] + '<br>';
            }
            layer.bindPopup(popup, { maxHeight: 200 });
          }
        });
        this.layerDetailsArray.push({ layername: layerName, layer: geoLayer });
        this.map.addLayer(geoLayer);
        if (layerName === 'geojsonLayer') {
          setTimeout(() => this.fitToStateBoundary(), 300);
        }
      },
      error: (err) => {
        this.layerDetailsArray.push({ layername: layerName, layer: L.geoJSON() });
      }
    });
  }

  toggleLayerPanel() {
    this.showLayers = !this.showLayers;
  }

  toggleTreeNode(nodeId: string) {
    this.expandedNodes[nodeId] = !this.expandedNodes[nodeId];
  }

  onNodeToggle(event: any, node: any) {
    const isChecked = event.target.checked;
    this.checkedStates[node.id] = isChecked;
    this.toggleChildrenRecursive(node, isChecked);
  }

  private toggleChildrenRecursive(node: any, isChecked: boolean) {
    if (node.layername) {
      this.checkedStates[node.id] = isChecked;
      this.onLayerToggle(isChecked, node.layername);
    }
    if (node.children && node.children.length > 0) {
      node.children.forEach((child: any) => {
        this.checkedStates[child.id] = isChecked;
        this.toggleChildrenRecursive(child, isChecked);
      });
    }
  }

  onLayerToggle(event: any, layerName: string) {
    const checked: boolean = typeof event === 'boolean' ? event : (event?.target?.checked ?? false);
    if (checked) {
      this.loadLayerByName(layerName);
      if(layerName == "fdsMapRaster" || layerName == "geojsonCanopyDensity" || layerName == "geojsonStreams" || layerName == "lulcLayer" 
        || layerName == "soil_erosion" || layerName == "demforestslope" || layerName == "geojsonJFMCVegetationType" || layerName == "geojsonJFMCForestCover" || layerName == "geojsonJFMCLanduse"){
        this.rasterdataonly = true;
      }
    } else {
      const layerObj = this.layerDetailsArray.find(x => x.layername === layerName);
      if (layerObj && this.map.hasLayer(layerObj.layer)) {
        this.map.removeLayer(layerObj.layer);
      }
    }
  }

  fitToStateBoundary() {
    const stateBoundaryLayer = this.layerDetailsArray.find(layer => layer.layername === 'geojsonLayer');
    if (stateBoundaryLayer && stateBoundaryLayer.layer) {
      try {
        const bounds = (stateBoundaryLayer.layer as any).getBounds();
        if (bounds && bounds.isValid()) {
          this.map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
        }
      } catch (error) { }
    }
  }

changeBaseMap(type: string) {
  this.activeBaseLayerName = type;

  // 1. Identify and remove only the BASE tile layers
  this.map.eachLayer((layer: any) => {
    // We check if it's a TileLayer BUT ensure it is NOT a WMS layer.
    // Checking for 'wmsParams' is safer than 'instanceof' in some Angular builds.
    if (layer instanceof L.TileLayer && !layer.hasOwnProperty('wmsParams')) {
      this.map.removeLayer(layer);
    }
  });

  // 2. Define the new layer variable
  let selectedLayer: L.TileLayer;

  if (type === 'streets') {
    selectedLayer = this.googleStreets;
  } else if (type === 'satellite') {
    selectedLayer = this.googleSatellite;
  } else {
    // Default to OSM
    selectedLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'OpenStreetMap'
    });
  }

  // 3. Add to map and FORCE it to the background
  selectedLayer.addTo(this.map);
  selectedLayer.bringToBack(); // <--- THIS IS CRITICAL

  // 4. Optional: If you have WMS layers currently active, 
  // you might need to nudge them to the front if they are still hidden
  this.layerDetailsArray.forEach(item => {
    if (this.map.hasLayer(item.layer)) {
      if (item.layer.bringToFront) {
        item.layer.bringToFront();
      }
    }
  });
}

  updateOpacity(event: any) {
    this.layerOpacity = event.target.value;
    const opacityVal = this.layerOpacity / 100;
    this.layerDetailsArray.forEach(item => {
      if (item.layer.setOpacity) item.layer.setOpacity(opacityVal);
      else if (item.layer.setStyle) item.layer.setStyle({ fillOpacity: opacityVal, opacity: opacityVal });
    });
  }

  toggleBasemapMenu() {
    this.showBasemapMenu = !this.showBasemapMenu;
   
  }
 





    showImpactPanel: boolean = true;
  isImpactMinimized: boolean = false;

  // Year Selection Variables
  years: number[] = [];
  selectedFromYear: number | string = 'From Year';
  selectedToYear: number | string = 'To Year';

  // Your Layer Data (Matching your image colors)
  impactLayerList: ImpactLayer[] = [
    { name: 'FCD March 2023', visible: false, color: '#76b100',legend:false },
    { name: 'FCD March 2025', visible: false, color: '#ffff00',legend:false },
    { name: 'FCD Change Detection 2023-2025', visible: false, color: '#ffff00',legend:false },
    { name: 'LULC Change Detection', visible: false, color: '#a3cf0d',legend:false },
  ];



  ngOnInit(): void {
    this.generateYearList();
  }

  // Populate the year dropdowns (e.g., 2000 to 2024)
  generateYearList() {
    const currentYear = new Date().getFullYear();
    const startYear = 2007;
    for (let i = currentYear; i >= startYear; i--) {
      this.years.push(i);
    }
  }

  // Toggle the switch for a specific layer
toggleImpactLayer(layer: ImpactLayer) {

  if (layer.name === 'FCD March 2023' && layer.visible == false) {
  this.selectedLayer = '2023';
}

else if (layer.name === 'FCD March 2025' && layer.visible == false) {
  this.selectedLayer = '2025';
}

else if (layer.name === 'FCD Change Detection 2023-2025' && layer.visible == false) {
  this.selectedLayer = 'change';
}

  this.showDataGrid = true;
  if(layer.name == "FCD Change Detection 2023-2025"){
    //this.closeImpactPanel();
   // this.showCharts = true;
  }
  else{
    this.showCharts = false;
  }
    setTimeout(() => {
      this.renderDynamicChart();
    }, 200);

  // Toggle current
  layer.visible = !layer.visible;
  layer.legend = !layer.legend;

  console.log(`${layer.name} is now ${layer.visible ? 'Visible' : 'Hidden'}`);

  // 🔴 Reset legends
  // this.fcd = false;
  // this.showLulcLegend = false;

  // 🧹 Remove previous layer
  if (this.activeImpactLayer) {
    this.map.removeLayer(this.activeImpactLayer);
    this.activeImpactLayer = null;
  }
const fcdLayers = ["FCD March 2023", "FCD March 2025"];
const lulclayer = ["LULC Change Detection"];
const changedetection = ["FCD Change Detection 2023-2025"]

 if (!layer.visible && fcdLayers.includes(layer.name)) {
  this.fcd = false;
}
else if(!layer.visible && lulclayer.includes(layer.name)){
this.showLulcLegend = false
}
else if(!layer.visible && changedetection.includes(layer.name)){
  this.showChangeDetectionLegend = false;
  this.showCharts = false;
  // this.isImpactMinimized = true;
}
  

  let layerName = '';
 

  if (layer.name === "FCD March 2023" && layer.visible == true) {
    layerName = "fdsMapRaster";
    this.fcd = true;
    //this.showChangeDetectionLegend = false;
  } 
  else if (layer.name === "FCD March 2025"  && layer.visible == true ) {
    layerName = "FCDMarch2025";
    this.fcd = true;
    //this.showChangeDetectionLegend = false;
  }
  else if(layer.name == "FCD Change Detection 2023-2025"  && layer.visible == true){
    layerName = "fdsMapRasterChangeDetection";
    this.showChangeDetectionLegend = true;
    //this.showLulcLegend = false; // ✅ show Change Detection legend
  }
  else if (layer.name === "LULC Change Detection"  && layer.visible == true) {
    layerName = "lulcLayer";
    //this.showChangeDetectionLegend = false;
    this.showLulcLegend = true; // ✅ show LULC legend
  }

  if (!layerName) return;

  this.loadLayerByName(layerName);

  const layerObj = this.layerDetailsArray.find(x => x.layername === layerName);
  if (layerObj) {
    this.activeImpactLayer = layerObj.layer;
  }
}
getChartData() {
  if (this.selectedLayer === '2023') {
    return this.forestChartData.map(d => ({
      label: d.label,
      area23: d.area23,
      area25: 0
    }));
  }

  if (this.selectedLayer === '2025') {
    return this.forestChartData.map(d => ({
      label: d.label,
      area23: 0,
      area25: d.area25
    }));
  }

  return this.forestChartData; // change detection → full data
}
  // Minimize/Expand the panel
  toggleImpactPanel() {
    this.isImpactMinimized = !this.isImpactMinimized;
  }

  // Close the panel completely
  closeImpactPanel() {
    this.showImpactPanel = false;
  }


  // Optional: Logic to handle when years change
  onYearChange() {
    if (this.selectedFromYear !== 'From Year' && this.selectedToYear !== 'To Year') {
      console.log(`Filtering data from ${this.selectedFromYear} to ${this.selectedToYear}`);
      // Trigger map update logic here
    }
  }





// Modify toggleGrid to initialize charts after a small delay to ensure Canvas is in DOM
toggleGrid() {
  this.showDataGrid = !this.showDataGrid;
  if (this.showDataGrid) {
    setTimeout(() => {
      this.initDashboardCharts();
    }, 100);
  }
}
// Add these properties to your class




// Add this function to create the charts
initDashboardCharts() {
  // Destroy existing charts if they exist to prevent memory leaks/overlap
  if (this.barChart) this.barChart.destroy();
  if (this.lineChart) this.lineChart.destroy();

  // 1. Bar Chart (Gradation Value)
  const barCtx = document.getElementById('barChartCanvas') as HTMLCanvasElement;
  this.barChart = new Chart(barCtx, {
    type: 'bar',
    data: {
      labels: ['SHG A', 'SHG B', 'SHG C', 'SHG D', 'SHG E'],
      datasets: [{
        label: 'Gradation Value',
        data: [12, 45, 62, 85, 100],
        backgroundColor: ['#ffc107', '#ff9800', '#8bc34a', '#2196f3', '#00bcd4'],
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: { grid: { color: '#1a3322' }, ticks: { color: '#888' } },
        x: { ticks: { color: '#888' } }
      }
    }
  });

  // 2. Line Chart (Financial Analysis)
  const lineCtx = document.getElementById('lineChartCanvas') as HTMLCanvasElement;
  this.lineChart = new Chart(lineCtx, {
    type: 'line',
    data: {
      labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
      datasets: [
        {
          label: 'Series 1',
          data: [12, 19, 3, 5, 2, 3],
          borderColor: '#8bc34a',
          backgroundColor: '#8bc34a',
          tension: 0.4,
          pointRadius: 4
        },
        {
          label: 'Series 2',
          data: [7, 11, 5, 8, 3, 7],
          borderColor: '#2196f3',
          borderDash: [5, 5],
          tension: 0.4,
          pointRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: '#fff', boxWidth: 10 } } },
      scales: {
        y: { grid: { color: '#1a3322' }, ticks: { color: '#888' } },
        x: { ticks: { color: '#888' } }
      }
    }
  });
}

 gridData = [
    { status: 'John Douey', group: '-', scheme: '-', type: '-', year: '2023-24' },
    { status: 'John Douey', group: '-', scheme: '-', type: '-', year: '2023-24' },
    { status: 'John', group: '-', scheme: '-', type: '-', year: '2022-23' }
  ];

 closecharts(){
  this.showCharts = false;
  this.showImpactPanel = true;
  this.isImpactMinimized = false;
 }

 

}
interface ImpactLayer {
  name: string;
  visible: boolean;
  color: string;
  legend:boolean
}