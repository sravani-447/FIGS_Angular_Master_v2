import { Component, AfterViewInit,Input } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-draw';
import 'leaflet-side-by-side';


import { HttpClient } from '@angular/common/http';
import { ServerRequests } from '../../services/ServerRequests';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})



export class MapComponent implements AfterViewInit {
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
  fcd: boolean = false;
  fds: boolean = false;
  potentialsoilerosion: boolean = false;
  showLulcLegend: boolean = false;
  jfmc_veg_type: boolean = false;
  showPpaLegend: boolean = false;
  actuallayername:string = '';
  jfmc_lulc: boolean = false;



  
  constructor(
    private http: HttpClient,
    public service: ServerRequests
  ) {
    this.geoServerUrl = this.service.Geoserver_URl;
  }


  @Input() set baseLayer(type: string) {
  if (this.map && type) {
    this.changeBaseMap(type); // Call your existing base map logic
  }
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
            // { "parent": "j3_1", "id": "j3_1_5", "text": "Landuse / Land cover", "layername": "lulcLayer" },
               {
              "parent": "j2_1",
              "id": "j2_1_2",
              "text": "Landuse / Land cover",
              "children": [
                { "parent": "j2_1_2", "id": "j2_1_2_1", "text": "lulc 2020-21", "layername": "bfbp_lulc_2020_v4" },
                { "parent": "j2_1_2", "id": "j2_1_2_2", "text": "lulc 2021-22", "layername": "bfbp_lulc_2021_v4" },
                { "parent": "j2_1_2", "id": "j2_1_2_3", "text": "lulc 2022-23", "layername": "bfbp_lulc_2022_v4" },
                { "parent": "j2_1_2", "id": "j2_1_2_4", "text": "lulc 2023-24", "layername": "bfbp_lulc_2023_v4" },
                { "parent": "j2_1_2", "id": "j2_1_2_5", "text": "lulc 2024-25", "layername": "bfbp_lulc_2024_v4" },
              ]
            },
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
    { name: 'geojsonReSurvey_21', type: 'Scatform_resurvey_2021-22', color: '#3602d1', weight: 2 },
    { name: 'geojsonReSurvey_22', type: 'Scatform_resurvey_2022-23', color: '#d1d102', weight: 2 },
    { name: 'geojsonReSurvey_23', type: 'Scatform_resurvey_2023-24', color: '#cd209c', weight: 2 },
    { name: 'geojsonReSurvey_24', type: 'Plantation_Resurvey_2024-25', color: '#0f0210', weight: 2 },
    { name: 'geojsonReSurvey_25', type: 'Gomati_Khowai_West_District_resurvey_2025-2026', color: '#352106', weight: 0.1 },
    
    // { name: 'LULC_2020_Projected_Mask', type: 'LULC_2021_Projected_Mask', color: '#3602d1', weight: 2 },
    // { name: 'LULC_2021_Projected_Mask', type: 'LULC_2022_Projected_Mask', color: '#d1d102', weight: 2 },
    // { name: 'LULC_2022_Projected_Mask', type: 'LULC_2023_Projected_Mask', color: '#cd209c', weight: 2 },
    // { name: 'LULC_2023_Projected_Mask', type: 'LULC_2024_Projected_Mask', color: '#0f0210', weight: 2 },
    // { name: 'LULC_2024_Projected_Mask', type: 'LULC_2025_Projected_Mask', color: '#352106', weight: 0.1 },


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
    this.initializeExpandedNodes();
    this.loadWmsLayers(); // Initialize Raster Layers
    this.loadLayerByName('geojsonLayer');
    this.checkedStates['j1_1'] = true;
    this.changeBaseMap('streets');
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
      { name: 'bfbp_lulc_2020_v4', layer: 'cite:bfbp_lulc_2020_v4' },
      { name: 'bfbp_lulc_2021_v4', layer: 'cite:bfbp_lulc_2021_v4' },
      { name: 'bfbp_lulc_2022_v4', layer: 'cite:bfbp_lulc_2022_v4' },
      { name: 'bfbp_lulc_2023_v4', layer: 'cite:bfbp_lulc_2023_v4' },
      { name: 'bfbp_lulc_2024_v4', layer: 'cite:bfbp_lulc_2024_v4' },
      { name: 'bfbp_lulc_2025_v4', layer: 'cite:bfbp_lulc_2025_v4' },
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
        className: 'remove-white-bg' // ADD THIS CLASS
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
${this.geoServerUrl}/geoserver/ws_figs/wms
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

 toggleSlider(
  leftLayerName: string = 'fdsMapRaster',
  rightLayerName: string = 'lulcLayer'
) {
  const leftLayerObj = this.layerDetailsArray.find(x => x.layername === leftLayerName);
  const rightLayerObj = this.layerDetailsArray.find(x => x.layername === rightLayerName);

  if (!leftLayerObj || !rightLayerObj) {
    console.warn('Layers not found');
    return;
  }

  const leftLayer = leftLayerObj.layer;
  const rightLayer = rightLayerObj.layer;

  // TOGGLE OFF
  if (this.slider) {
    try {
      this.map.removeControl(this.slider);
    } catch (e) {}
    this.slider = null;

    // Remove custom handle
    const handle = document.getElementById('custom-slider-handle');
    if (handle) handle.remove();

    return;
  }

  if (!this.map.hasLayer(leftLayer)) this.map.addLayer(leftLayer);
  if (!this.map.hasLayer(rightLayer)) this.map.addLayer(rightLayer);

  this.slider = (L as any).control.sideBySide(leftLayer, rightLayer);
  this.slider.addTo(this.map);

  // ✅ Inject custom handle after short delay
  setTimeout(() => {
    this.injectCustomSliderHandle();
  }, 300);
}
deactivateSlider() {
  if (this.slider != null) {
    this.slider.remove();
    this.slider = null;
  }
  // Remove custom handle
  const handle = document.getElementById('custom-slider-handle');
  if (handle) handle.remove();
}

  injectCustomSliderHandle() {
  // Remove existing custom handle if any
  const existing = document.getElementById('custom-slider-handle');
  if (existing) existing.remove();

  const mapContainer = document.getElementById('map');
  if (!mapContainer) return;

  // Create the handle div
  const handle = document.createElement('div');
  handle.id = 'custom-slider-handle';
  handle.innerHTML = `
    <div style="
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: white;
      border: 2px solid #ccc;
      box-shadow: 0 2px 10px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: ew-resize;
      gap: 4px;
    ">
      <div style="width:2px;height:18px;background:#666;border-radius:2px;"></div>
      <div style="width:2px;height:18px;background:#666;border-radius:2px;"></div>
      <div style="width:2px;height:18px;background:#666;border-radius:2px;"></div>
    </div>
  `;

  handle.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1001;
    pointer-events: none;
  `;

  mapContainer.appendChild(handle);

  // Follow the range input position
  this.trackSliderPosition(handle);
}

trackSliderPosition(handle: HTMLElement) {
  const range = document.querySelector('.leaflet-sbs-range') as HTMLInputElement;
  if (!range) return;

  const updatePosition = () => {
    const mapEl = document.getElementById('map');
    if (!mapEl || !range) return;
    const mapWidth = mapEl.offsetWidth;
    const val = parseFloat(range.value);
    const min = parseFloat(range.min) || 0;
    const max = parseFloat(range.max) || 100;
    const percent = (val - min) / (max - min);
    const px = percent * mapWidth;
    handle.style.left = px + 'px';
  };

  updatePosition();
  range.addEventListener('input', updatePosition);
  window.addEventListener('resize', updatePosition);
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
    if(layerName == 'geojsonCheckDam'){
            this.loadGeoJson(
          `${this.geoServerUrl}/geoserver/ws_figs/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=ws_figs:Checkdam_Phase2&outputFormat=application/json`,
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
        `${this.geoServerUrl}/geoserver/ws_figs/wms`,
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
          setTimeout(() => this.fitToStateBoundary(), 300);
        }
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
        this.potentialsoilerosion = false;
        this.showLulcLegend = false;
        this.showPpaLegend = false;
        this.fcd = false;
      });
    }
  }
  getPPAColor(score: number): string {
    if (score <= 5) return '#006400';   // Dense Forest
    if (score === 6) return '#7CFC00';  // Moderate
    if (score === 7) return '#FFC107';  // Open
    if (score >= 8) return '#FF0000';   // Scrub

    return '#999';
  }

  onLayerToggle(event: any, layerName: string) {
    const checked: boolean = typeof event === 'boolean' ? event : (event?.target?.checked ?? false);
    if (checked) {
      this.loadLayerByName(layerName);
      // if(layerName == "fdsMapRaster" || layerName == "geojsonCanopyDensity" || layerName == "geojsonStreams" || layerName == "lulcLayer" 
      //   || layerName == "soil_erosion" || layerName == "demforestslope" || layerName == "geojsonJFMCVegetationType" || layerName == "geojsonJFMCForestCover" || layerName == "geojsonJFMCLanduse"){
      //   this.rasterdataonly = true;
      // }
      if (layerName == "geojsonCanopyDensity") {
        this.fcd = true;
        //this.fds = false;
        //this.potentialsoilerosion = false;
        //this.showLulcLegend = false;
        //this.showPpaLegend = false;
      }
      else if (layerName == "geojsonJFMCForestCover") {
        this.fcd = true;
        // this.fds = false;
        // this.potentialsoilerosion = false;
        // this.showLulcLegend = false;
        // this.jfmc_veg_type = false;
        // this.showPpaLegend = false;
      }
      else if (layerName == "fdsMapRaster") {
        this.fds = true;
        // this.fcd = false;
        // this.potentialsoilerosion = false;
        // this.showLulcLegend = false;
        // this.showPpaLegend = false;
      }
      else if (layerName == "soil_erosion") {
        this.potentialsoilerosion = true;
        // this.fcd = false;
        // this.fds = false;
        // this.showLulcLegend = false;
        // this.showPpaLegend = false;
      }
      else if (layerName == "bfbp_lulc_2020_v4" || layerName == "bfbp_lulc_2021_v4" || layerName == "bfbp_lulc_2022_v4" || layerName == "bfbp_lulc_2023_v4" || layerName == "bfbp_lulc_2024_v4" || layerName == "bfbp_lulc_2025_v4") {
        this.showLulcLegend = true;
        //this.potentialsoilerosion = false;
        // this.fcd = false;
        // this.fds = false;
        // this.showPpaLegend = false;
      }
      else if (layerName == "geojsonJFMCVegetationType") {
        this.jfmc_veg_type = true;
        // this.showLulcLegend = false;
        // this.potentialsoilerosion = false;
        // this.fcd = false;
        // this.fds = false;
        // this.showPpaLegend = false;

      }
      else if(layerName == "geojsonJFMCLanduse"){
        this.jfmc_lulc = true;
      }
      else if (layerName == "ppa") {
        this.showPpaLegend = true;
        // this.jfmc_veg_type = false;
        // this.showLulcLegend = false;
        // this.potentialsoilerosion = false;
        // this.fcd = false;
        // this.fds = false;

      }
      else {
        this.jfmc_veg_type = false;
        this.showLulcLegend = false;
        this.potentialsoilerosion = false;
        this.fcd = false;
        this.fds = false;
        this.showPpaLegend = false;
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


}
