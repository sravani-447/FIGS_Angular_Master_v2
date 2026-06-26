import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as L from 'leaflet';

interface ForestCoverData {
  district: string;
  veryDense: number;
  moderatelyDense: number;
  openForest: number;
  scrub: number;
  nonForest: number;
  total: number;
}

interface CheckDamData {
  district: string;
  totalDams: number;
  operational: number;
  underMaintenance: number;
  underConstruction: number;
  storageCapacity: number;
}

interface AgroForestryData {
  district: string;
  areaCovered: number;
  saplingsDistributed: number;
  farmersBenefited: number;
  dominantSpecies: string;
}


interface TrainingRecord {
  year: string;
    totalSessions: number; 
  participants: number;
  classroom: number;
  online: number;
  workshop: number;
  exposure: number;
  sc: number;
  st: number;
  male: number;
  female: number;
}

interface JFMCForestRecord {
  gpVc: string;
  jfmcName: string;
  // areaHect: number;
  district: string;
  forestSub: string;
  range: string;
  beat: string;
  gpVcName: string;
  year: number;
  tropicalEvergreen: number;
  semiEvergreen: number;
  moistMixedDeciduous: number;
  mixedDeciduous: number;
  totalForestArea: number;
}

interface LoanRecord {
  district: string;
  jfmcFormed: number;
  loanGiven: number;
  loanRecovered: number;
  recoveryRate: number;
}

interface PlantationRecord {
  year: number; // Mapped from financial year format (e.g. '2020-21' -> 2020)
  plantationArea: number; // Summed from 'Plantation_Area_Ha'
  district: string;
}

interface CheckdamDistrictRecord {
  district: string;
  m1: number;
  m2: number;
  m3: number;
  total: number;
}

interface AgroforestryDistrictRecord {
  district: string;
  total: number;
}

@Component({
  selector: 'app-maindashboard',
  templateUrl: './maindashboard.component.html',
  styleUrls: ['./maindashboard.component.css']
})
export class MaindashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  formattedDateRange: string = 'May 22, 2024 – May 28, 2024';

// Loan CSV Properties
  loanRecords: LoanRecord[] = [];
  loanTotalJFMC: number = 457;
  loanTotalGiven: string = '86.01M';
  loanTotalRecovered: string = '31.17M';
  loanAvgRecoveryRate: string = '37.3%';

// Training CSV Properties
  trainingRecords: TrainingRecord[] = [];
  trainingYears: string[] = [];
  
  // Data Lines for Card 2
  lineClassroom: number[] = [];
  lineOnline: number[] = [];
  lineWorkshop: number[] = [];
  lineExposure: number[] = [];
  lineParticipants: number[] = [];

 m1Total: number = 826;
  m2Total: number = 529;
  m3Total: number = 10;
  agroforestryTotal: number = 3375.56;

jfmcRecords: JFMCForestRecord[] = [];
 showDownloadDropdown: boolean = false;
 // Card 1: Yearly Trend Overview properties
  trendDistrict: string = 'All Districts';
  trendYears: number[] = [2020, 2021, 2022, 2023, 2024, 2025, 2026];
  trendForestCoverData: number[] = [];
  trendSemiEvergreenData: number[] = [];
  trendTropicalData: number[] = [];


  // New Plantation CSV properties
  plantationRecords: PlantationRecord[] = [];
  trendPlantationData: number[] = []; // Replaces trendSemiEvergreenData

  // Card 2: Plantation Progress properties
  selectedProgressYear: number = 2024;
  progressYears: number[] = [2025,2024, 2023, 2022, 2021, 2020];
  plantedValue: number = 0;
  targetValue: number = 750000;
  survivalValue: number = 0;
  progressRate: number = 0;
  strokeDashOffset: number = 251.2;

  // Card 3: Top 5 Districts properties
  selectedTopDistrictsYear: number = 2025;
  topDistrictsList: { district: string; area: number; percentage: number }[] = [];

  // Map Instances
  private forestMap!: L.Map;
  private damMap!: L.Map;
  private agroMap!: L.Map;
  
  // Modal Map Instance
  private modalMap!: L.Map;
  showModal: boolean = false;
  activeModalMapTitle: string = '';

  // Separate layer targets
  private forestGeoJsonLayer!: L.GeoJSON;
  private damGeoJsonLayer!: L.GeoJSON;
  private agroGeoJsonLayer!: L.GeoJSON;

   activeModalMapType: string = '';

  private geoserverWfsUrl: string = 'https://figs.tripura.gov.in/geoserver/ws_figs/ows';
// Modal toggle state for Training
  showTrainingModal: boolean = false;

  // Dynamic Pie Chart Aggregates
  malePercentage: number = 0;
  femalePercentage: number = 0;
  scPercentage: number = 0;
  stPercentage: number = 0;

  openTrainingModal(): void {
    this.showTrainingModal = true;
  }

  closeTrainingModal(): void {
    this.showTrainingModal = false;
  }

  checkdamDistrictMap: { [key: string]: CheckdamDistrictRecord } = {};
agroforestryDistrictMap: { [key: string]: AgroforestryDistrictRecord } = {};

  districts: string[] = [
    'All Districts',
    'West Tripura',
    'Sepahijala',
    'Khowai',
    'Gomati',
    'South Tripura',
    'Dhalai',
    'Unakoti',
    'North Tripura'
  ];

  // INDIVIDUAL selected targets for each card dropdown
  selectedForestDistrict: string = 'All Districts';
  selectedDamDistrict: string = 'All Districts';
  selectedAgroDistrict: string = 'All Districts';

  forestCoverList: ForestCoverData[] = [];
  checkDamList: CheckDamData[] = [];
  agroForestryList: AgroForestryData[] = [];

  activeForestCover!: ForestCoverData;
  activeCheckDam!: CheckDamData;
  activeAgroForestry!: AgroForestryData;

  alerts = [
    { type: 'fire', title: 'Fire Alert', message: 'Fire detected in Khowai district', time: 'Today, 09:15 AM', class: 'alert-fire' },
    { type: 'illegal', title: 'Illegal Activity', message: 'Possible encroachment detected in Sepahijala', time: 'Today, 08:40 AM', class: 'alert-warning' },
    { type: 'plantation', title: 'Plantation Update', message: 'Monsoon plantation target is 75% achieved', time: 'Yesterday, 06:20 PM', class: 'alert-info' },
    { type: 'sync', title: 'Data Sync', message: 'Field data synced successfully', time: 'Yesterday, 04:30 PM', class: 'alert-success' }
  ];

  private fallbackForestCover: ForestCoverData[] = [
    { district: 'All Districts', veryDense: 62430, moderatelyDense: 65210, openForest: 35980, scrub: 8250, nonForest: 2750, total: 174620 },
    { district: 'West Tripura', veryDense: 10200, moderatelyDense: 12400, openForest: 6800, scrub: 1520, nonForest: 700, total: 31620 },
    { district: 'Sepahijala', veryDense: 9800, moderatelyDense: 10500, openForest: 5900, scrub: 1650, nonForest: 600, total: 28450 },
    { district: 'Khowai', veryDense: 8100, moderatelyDense: 9200, openForest: 4200, scrub: 1100, nonForest: 350, total: 22950 },
    { district: 'Gomati', veryDense: 8700, moderatelyDense: 8900, openForest: 4100, scrub: 1360, nonForest: 500, total: 23560 },
    { district: 'South Tripura', veryDense: 7400, moderatelyDense: 7800, openForest: 4300, scrub: 880, nonForest: 300, total: 20680 },
    { district: 'Dhalai', veryDense: 9100, moderatelyDense: 9300, openForest: 5120, scrub: 960, nonForest: 300, total: 24780 },
    { district: 'Unakoti', veryDense: 4530, moderatelyDense: 3610, openForest: 2860, scrub: 480, nonForest: 0, total: 11480 },
    { district: 'North Tripura', veryDense: 4600, moderatelyDense: 3500, openForest: 2700, scrub: 300, nonForest: 0, total: 11100 }
  ];

  private fallbackCheckDam: CheckDamData[] = [
    { district: 'All Districts', totalDams: 1287, operational: 1150, underMaintenance: 85, underConstruction: 52, storageCapacity: 450000 },
    { district: 'West Tripura', totalDams: 210, operational: 190, underMaintenance: 12, underConstruction: 8, storageCapacity: 73500 },
    { district: 'Sepahijala', totalDams: 185, operational: 160, underMaintenance: 15, underConstruction: 10, storageCapacity: 64750 },
    { district: 'Khowai', totalDams: 140, operational: 125, underMaintenance: 10, underConstruction: 5, storageCapacity: 49000 },
    { district: 'Gomati', totalDams: 195, operational: 175, underMaintenance: 12, underConstruction: 8, storageCapacity: 68250 },
    { district: 'South Tripura', totalDams: 220, operational: 198, underMaintenance: 14, underConstruction: 8, storageCapacity: 77000 },
    { district: 'Dhalai', totalDams: 177, operational: 157, underMaintenance: 12, underConstruction: 8, storageCapacity: 61950 },
    { district: 'Unakoti', totalDams: 80, operational: 73, underMaintenance: 5, underConstruction: 2, storageCapacity: 28000 },
    { district: 'North Tripura', totalDams: 80, operational: 72, underMaintenance: 5, underConstruction: 3, storageCapacity: 28000 }
  ];

  private fallbackAgroForestry: AgroForestryData[] = [
    { district: 'All Districts', areaCovered: 12450, saplingsDistributed: 568320, farmersBenefited: 8450, dominantSpecies: 'Teak / Bamboo' },
    { district: 'West Tripura', areaCovered: 2150, saplingsDistributed: 98000, farmersBenefited: 1450, dominantSpecies: 'Bamboo' },
    { district: 'Sepahijala', areaCovered: 1950, saplingsDistributed: 89000, farmersBenefited: 1320, dominantSpecies: 'Rubber / Bamboo' },
    { district: 'Khowai', areaCovered: 1320, saplingsDistributed: 60200, farmersBenefited: 910, dominantSpecies: 'Teak' },
    { district: 'Gomati', areaCovered: 1680, saplingsDistributed: 76600, farmersBenefited: 1140, dominantSpecies: 'Acacia' },
    { district: 'South Tripura', areaCovered: 2450, saplingsDistributed: 111800, farmersBenefited: 1660, dominantSpecies: 'Teak' },
    { district: 'Dhalai', areaCovered: 1560, saplingsDistributed: 71220, farmersBenefited: 1060, dominantSpecies: 'Horticulture' },
    { district: 'Unakoti', areaCovered: 670, saplingsDistributed: 30500, farmersBenefited: 450, dominantSpecies: 'Bamboo' },
    { district: 'North Tripura', areaCovered: 670, saplingsDistributed: 31000, farmersBenefited: 460, dominantSpecies: 'Areca Nut' }
  ];

   private getNormalizedDistrictKey(district: string): string {
    const d = district.toLowerCase().trim();
    if (d.includes('north')) return 'north';
    if (d.includes('unakoti')) return 'unakoti';
    if (d.includes('khowai')) return 'khowai';
    if (d.includes('west')) return 'west';
    if (d.includes('sepahijala')) return 'sepahijala';
    if (d.includes('gomati')) return 'gomati';
    if (d.includes('south')) return 'south';
    if (d.includes('gumti') || d.includes('gwls')) return 'gwls';
    return d;
  }

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.initializeData();
    this.loadCSVData();
    this.loadJFMCData(); 
      this.loadPlantationCSV();
       this.loadTrainingCSV();
        this.loadLoanCSV();
         this.loadCheckdamModuleCSV(); 
          this.loadAgroforestryModuleCSV(); 

  }

  ngAfterViewInit(): void {
    this.initializeAllMaps();
  }

  ngOnDestroy(): void {
    if (this.forestMap) this.forestMap.remove();
    if (this.damMap) this.damMap.remove();
    if (this.agroMap) this.agroMap.remove();
    this.destroyModalMap();
  }

  private initializeData(): void {
    this.forestCoverList = [...this.fallbackForestCover];
    this.checkDamList = [...this.fallbackCheckDam];
    this.agroForestryList = [...this.fallbackAgroForestry];
    this.activeForestCover = this.forestCoverList[0];
    this.activeCheckDam = this.checkDamList[0];
    this.activeAgroForestry = this.agroForestryList[0];
  }

   getDynamicTotalTrainingParticipants(): number {
    if (!this.trainingRecords || this.trainingRecords.length === 0) {
      return 25313; // Fallback total sum
    }
    return this.trainingRecords.reduce((acc, curr) => acc + curr.participants, 0);
  }

  getDynamicTotalForestCover(): number {
    if (!this.jfmcRecords || this.jfmcRecords.length === 0) {
    }
    const latestYear = Math.max(...this.jfmcRecords.map(r => r.year));
    const latestRecords = this.jfmcRecords.filter(r => r.year === latestYear);
    return Math.round(latestRecords.reduce((acc, curr) => acc + curr.totalForestArea, 0));
  }

  getDynamicTotalPlantation(): number {
    if (!this.plantationRecords || this.plantationRecords.length === 0) {
    }
    return Math.round(this.plantationRecords.reduce((acc, curr) => acc + curr.plantationArea, 0));
  }

 loadCheckdamModuleCSV(): void {
    this.http.get('assets/Checkdam_Districts_Wise_Module.csv', { responseType: 'text' }).subscribe({
      next: (csvText) => {
        const lines = csvText.split('\n');
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          const parts = line.split(',').map(p => p.trim());
          if (parts.length >= 5 && !isNaN(Number(parts[0])) && parts[0] !== '') {
            const district = parts[1];
            const m1 = parseInt(parts[2]) || 0;
            const m2 = parseInt(parts[3]) || 0;
            const m3 = parseInt(parts[4]) || 0;
            
            const distKey = this.getNormalizedDistrictKey(district);
            this.checkdamDistrictMap[distKey] = { district, m1, m2, m3, total: m1 + m2 + m3 };
          }
          else if (parts[1] && parts[1].toLowerCase().includes('total')) {
            this.m1Total = parseInt(parts[2]) || 826;
            this.m2Total = parseInt(parts[3]) || 529;
            this.m3Total = parseInt(parts[4]) || 10;
          }
        }
      }
    });
  }

  loadAgroforestryModuleCSV(): void {
    this.http.get('assets/Agroforestry_Districts_Wise_Module.csv', { responseType: 'text' }).subscribe({
      next: (csvText) => {
        const lines = csvText.split('\n');
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          const parts = line.split(',').map(p => p.trim());
          if (parts.length >= 2 && parts[0] !== 'Name of the DMU' && parts[0] !== '' && !parts[0].toLowerCase().includes('total')) {
            const dmu = parts[0];
            const total = parseFloat(parts[1]) || 0;
            
            const distKey = this.getNormalizedDistrictKey(dmu);
            this.agroforestryDistrictMap[distKey] = { district: dmu, total };
          }
          else if (parts[0] && parts[0].toLowerCase().includes('total')) {
            this.agroforestryTotal = parseFloat(parts[1]) || 3375.56;
          }
        }
      }
    });
  }

  getDynamicCheckdamLegend(): string {
    const key = this.getNormalizedDistrictKey(this.selectedDamDistrict);
    const record = this.checkdamDistrictMap[key];
    if (!record) {
      return `All Districts: ${this.m1Total + this.m2Total + this.m3Total} Nos. (M1: ${this.m1Total}, M2: ${this.m2Total}, M3: ${this.m3Total})`;
    }
    return `${record.district}: ${record.total} Nos. (M1: ${record.m1}, M2: ${record.m2}, M3: ${record.m3})`;
  }

  getDynamicAgroforestryLegend(): string {
    const key = this.getNormalizedDistrictKey(this.selectedAgroDistrict);
    const record = this.agroforestryDistrictMap[key];
    if (!record) {
      return `All Districts: ${this.agroforestryTotal.toFixed(2)} ha`;
    }
    return `${record.district}: ${record.total.toFixed(2)} ha`;
  }

// Retrieves the M-I Check Dam count for a given district name
  getCheckdamM1(district: string): number {
    const key = this.getNormalizedDistrictKey(district);
    return this.checkdamDistrictMap[key]?.m1 || 0;
  }

  // Retrieves the M-II Check Dam count for a given district name
  getCheckdamM2(district: string): number {
    const key = this.getNormalizedDistrictKey(district);
    return this.checkdamDistrictMap[key]?.m2 || 0;
  }

  // Retrieves the M-III Check Dam count for a given district name
  getCheckdamM3(district: string): number {
    const key = this.getNormalizedDistrictKey(district);
    return this.checkdamDistrictMap[key]?.m3 || 0;
  }

  // Retrieves the cumulative Check Dam count (M1 + M2 + M3) for a given district name
  getCheckdamTotal(district: string): number {
    const key = this.getNormalizedDistrictKey(district);
    return this.checkdamDistrictMap[key]?.total || 0;
  }

  // Retrieves the cumulative Agroforestry area total for a given district name
  getAgroforestryTotal(district: string): number {
    const key = this.getNormalizedDistrictKey(district);
    return this.agroforestryDistrictMap[key]?.total || 0;
  }


 loadLoanCSV(): void {
    this.http.get('assets/JFMC_Data.csv', { responseType: 'text' }).subscribe({
      next: (csvText) => {
        const lines = csvText.split('\n');
        const records: LoanRecord[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          const parts = line.split(',').map(p => p.trim());
          if (parts.length < 5 || parts[1] === '') continue;
          
          const district = parts[1];
          const jfmc = parseFloat(parts[2]) || 0;
          const given = parseFloat(parts[3]) || 0;
          const recovered = parseFloat(parts[4]) || 0;
          
          // Formats total aggregates dynamically into Indian Crores (₹ Cr)
          if (district.toLowerCase() === 'total') {
            this.loanTotalJFMC = jfmc;
            this.loanTotalGiven = '₹' + (given / 10000000).toFixed(2) + ' Cr';
            this.loanTotalRecovered = '₹' + (recovered / 10000000).toFixed(2) + ' Cr';
            this.loanAvgRecoveryRate = ((recovered / given) * 100).toFixed(1) + '%';
            continue;
          }
          
          const rate = given > 0 ? (recovered / given) * 100 : 0;
          records.push({
            district: district,
            jfmcFormed: jfmc,
            loanGiven: given,
            loanRecovered: recovered,
            recoveryRate: rate
          });
        }
        this.loanRecords = records;
      }
    });
  }

  // --- Map Coordinates Helpers for Loan Charts (2x2 Grid) ---
  
// Updated offset gap to 20px to support wider, bolder bars
  getLoanBarX(idx: number, type: 'given' | 'recovered'): number {
    const startX = 60;
    const step = 60; 
    const baseX = startX + idx * step;
    return type === 'given' ? baseX : baseX + 20; 
  }

  getLoanBarHeight(val: number): number {
    const maxVal = 25000000; // 250 Lakhs (2.5 Cr) Y-Axis Limit
    return (val / maxVal) * 120; // Bound within 120px chart height
  }

  getLoanValueLabelInLakhs(val: number): string {
    return (val / 100000).toFixed(1) + 'L'; // e.g. 22,546,700 -> 225.5L
  }

  // Chart 2: JFMC Units Formed Dot Plot (Updated to scale 20 to 100)
  getDotY(idx: number): number {
    return 30 + idx * 16;
  }

  getDotX(val: number): number {
    const startX = 70;
    const endX = 520;
    const minVal = 20; // Customized minimum scale tick
    const maxVal = 100; // Customized maximum scale tick
    let safeVal = val < minVal ? minVal : val;
    return startX + ((safeVal - minVal) / (maxVal - minVal)) * (endX - startX);
  }

  getDotColor(idx: number): string {
    // Cohesive colors matching standard dashboard palettes
    const colors = ['#f59e0b', '#dc2626', '#10b981', '#6366f1', '#475569', '#ea580c', '#06b6d4', '#ec4899'];
    return colors[idx % colors.length];
  }

  // Chart 3: Horizontal Bar Chart
  getRecoveryY(idx: number): number {
    return 26 + idx * 17;
  }

  getRecoveryWidth(rate: number): number {
    const maxW = 390; // Max horizontal span
    return (rate / 100) * maxW;
  }

  getRecoveryColor(rate: number): string {
    if (rate < 30) return '#ef4444'; // Red (Low)
    if (rate <= 60) return '#f59e0b'; // Orange/Yellow (Moderate)
    return '#10b981'; // Green (High)
  }

 loadTrainingCSV(): void {
    this.http.get('assets/FIGS.csv', { responseType: 'text' }).subscribe({
      next: (csvText) => {
        const lines = csvText.split('\n');
        const records: TrainingRecord[] = [];
        
        lines.forEach(line => {
          const parts = line.split(',').map(p => p.trim());
         if (parts.length >= 12 && !isNaN(Number(parts[0])) && parts[0] !== '') {
            records.push({
              year: parts[1],
              totalSessions: parseFloat(parts[2]) || 0, // Maps No of Training column
              participants: parseFloat(parts[3]) || 0,
              classroom: parseFloat(parts[4]) || 0,
              online: parseFloat(parts[5]) || 0,
              workshop: parseFloat(parts[6]) || 0,
              exposure: parseFloat(parts[7]) || 0,
              sc: parseFloat(parts[8]) || 0,
              st: parseFloat(parts[9]) || 0,
              male: parseFloat(parts[10]) || 0,
              female: parseFloat(parts[11]) || 0
            });
          
          }
        });
        
        this.trainingRecords = records;
        this.updateTrainingChart();
      }
    });
  }

  updateTrainingChart(): void {
    if (this.trainingRecords.length === 0) return;
    this.trainingYears = this.trainingRecords.map(r => r.year);
    this.lineClassroom = this.trainingRecords.map(r => r.classroom);
    this.lineOnline = this.trainingRecords.map(r => r.online);
    this.lineWorkshop = this.trainingRecords.map(r => r.workshop);
    this.lineExposure = this.trainingRecords.map(r => r.exposure);
    this.lineParticipants = this.trainingRecords.map(r => r.participants);

    // Dynamic Pie Chart Aggregations
    const totalMale = this.trainingRecords.reduce((acc, curr) => acc + curr.male, 0);
    const totalFemale = this.trainingRecords.reduce((acc, curr) => acc + curr.female, 0);
    const genderSum = totalMale + totalFemale || 1;
    this.malePercentage = parseFloat(((totalMale / genderSum) * 100).toFixed(1));
    this.femalePercentage = parseFloat(((totalFemale / genderSum) * 100).toFixed(1));

    const totalSc = this.trainingRecords.reduce((acc, curr) => acc + curr.sc, 0);
    const totalSt = this.trainingRecords.reduce((acc, curr) => acc + curr.st, 0);
    const scstSum = totalSc + totalSt || 1;
    this.scPercentage = parseFloat(((totalSc / scstSum) * 100).toFixed(1));
    this.stPercentage = parseFloat(((totalSt / scstSum) * 100).toFixed(1));
  }

    getDynamicTotalTrainingSessions(): number {
    if (!this.trainingRecords || this.trainingRecords.length === 0) {
      return 653; // Fallback sessions sum
    }
    return this.trainingRecords.reduce((acc, curr) => acc + curr.totalSessions, 0);
  }

  // --- Map Coordinates Helpers for Card 2 ---
  getTrainingX(idx: number): number {
    const startX = 55;
    const endX = 535;
    const total = this.trainingYears.length;
    if (total <= 1) return startX;
    return startX + idx * ((endX - startX) / (total - 1));
  }

  getTrainingLeftY(val: number): number {
    const maxVal = 160; // Left scale limit
    return 160 - (val / maxVal) * 120; // Bound within grid heights
  }

  getTrainingRightY(val: number): number {
    const maxVal = 6000; // Right scale limit
    return 160 - (val / maxVal) * 120; // Bound within grid heights
  }

  getTrainingPath(data: number[], axis: 'left' | 'right'): string {
    if (!data || data.length === 0) return '';
    const points = data.map((val, idx) => {
      const x = this.getTrainingX(idx);
      const y = axis === 'left' ? this.getTrainingLeftY(val) : this.getTrainingRightY(val);
      return `${x},${y}`;
    });
    return `M ${points.join(' L ')}`;
  }

  getTrainingCircles(data: number[], axis: 'left' | 'right'): { cx: number; cy: number; val: number }[] {
    if (!data || data.length === 0) return [];
    return data.map((val, idx) => ({
      cx: this.getTrainingX(idx),
      cy: axis === 'left' ? this.getTrainingLeftY(val) : this.getTrainingRightY(val),
      val: val
    }));
  }
  
  loadJFMCData(): void {
    this.http.get('assets/JFMC_Total_Forest_ALL_YEARS.csv', { responseType: 'text' }).subscribe({
      next: (csvText) => {
        const lines = csvText.split('\n');
        const records: JFMCForestRecord[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          const parts = line.split(',');
          if (parts.length < 14) continue;
          
          records.push({
            gpVc: parts[0],
            jfmcName: parts[1],
            // areaHect: parseFloat(parts[2]) || 0,
            district: parts[3].trim(),
            forestSub: parts[4],
            range: parts[5],
            beat: parts[6],
            gpVcName: parts[7],
            year: parseInt(parts[8]) || 0,
            tropicalEvergreen: parseFloat(parts[9]) || 0,
            semiEvergreen: parseFloat(parts[10]) || 0,
            moistMixedDeciduous: parseFloat(parts[11]) || 0,
            mixedDeciduous: parseFloat(parts[12]) || 0,
            totalForestArea: parseFloat(parts[13]) || 0
          });
        }
        this.jfmcRecords = records;
        
        // Initial draw
        this.updateTrendOverview();
        this.updatePlantationProgress();
        this.updateTopDistricts();
      }
    });
  }

  loadPlantationCSV(): void {
    this.http.get('assets/Resurvey_Merged_All_Years_plantation.csv', { responseType: 'text' }).subscribe({
      next: (csvText) => {
        const lines = csvText.split('\n');
        const records: PlantationRecord[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          const parts = line.split(',');
          if (parts.length < 12) continue;

          // Map financial year string '2020-21' -> 2020 (first 4 characters)
          const rawYear = parts[0].trim();
          const mappedYear = parseInt(rawYear.substring(0, 4)) || 0;
          const area = parseFloat(parts[4]) || 0;
          const district = parts[11].trim();

          records.push({
            year: mappedYear,
            plantationArea: area,
            district: district
          });
        }
        this.plantationRecords = records;
        this.updateTrendOverview(); // Redraw trend lines with new data
      }
    });
  }

  // --- Dynamic Operations for Card 1 (Yearly Trend Overview) ---
  onTrendDistrictChange(district: string): void {
    this.trendDistrict = district;
    this.updateTrendOverview();
  }

 updateTrendOverview(): void {
    if (this.jfmcRecords.length === 0) return;
    this.trendForestCoverData = [];
    this.trendPlantationData = []; // Replaces trendSemiEvergreenData
    this.trendTropicalData = [];

    this.trendYears.forEach(year => {
      // 1. Filter and sum forest records from first CSV
      const filteredJFMC = this.jfmcRecords.filter(r => 
        r.year === year && 
        (this.trendDistrict === 'All Districts' || r.district.toLowerCase() === this.trendDistrict.toLowerCase())
      );
      this.trendForestCoverData.push(filteredJFMC.reduce((acc, curr) => acc + curr.totalForestArea, 0));
      this.trendTropicalData.push(filteredJFMC.reduce((acc, curr) => acc + curr.tropicalEvergreen, 0));

      // 2. Filter and sum plantation records from second CSV
      const filteredPlantation = this.plantationRecords.filter(p => 
        p.year === year && 
        (this.trendDistrict === 'All Districts' || p.district.toLowerCase() === this.trendDistrict.toLowerCase())
      );
      this.trendPlantationData.push(filteredPlantation.reduce((acc, curr) => acc + curr.plantationArea, 0));
    });
  }

  // State properties for custom chart tooltip
 hoveredPoint: { year: number | string; val: number; unit?: string } | null = null;

  tooltipX: number = 0;
  tooltipY: number = 0;

  showTooltip(event: MouseEvent, year: number | string, val: number, unit: string = 'ha'): void {
    this.hoveredPoint = { year, val, unit };
    this.moveTooltip(event);
  }

  moveTooltip(event: MouseEvent): void {
    // Positions the floating tooltip safely offset from the cursor
    this.tooltipX = event.clientX + 15;
    this.tooltipY = event.clientY + 15;
  }

  hideTooltip(): void {
    this.hoveredPoint = null;
  }

  getXCoordinate(idx: number, totalPoints: number): number {
    const startX = 65;
    const endX = 545;
    if (totalPoints <= 1) return startX;
    return startX + idx * ((endX - startX) / (totalPoints - 1));
  }

  // 2. Updated path generator using the dynamic X coordinates
 // 1. Updated path generator to scale specifically to your Plantation Area values
  getSVGPath(data: number[]): string {
    if (!data || data.length === 0) return '';
    // Scales to the maximum of the Plantation data so the curve utilizes full chart height
    const maxVal = Math.max(...this.trendPlantationData, 1);
    const points = data.map((val, idx) => {
      const x = this.getXCoordinate(idx, data.length);
      const y = 160 - (val / maxVal) * 120; // Normalizes within our 120px grid height
      return `${x},${y}`;
    });
    return `M ${points.join(' L ')}`;
  }

  // 2. Updated circle positioner to scale specifically to your Plantation Area values
  getSVGCircles(data: number[]): { cx: number; cy: number; val: number }[] {
    if (!data || data.length === 0) return [];
    const maxVal = Math.max(...this.trendPlantationData, 1);
    return data.map((val, idx) => ({
      cx: this.getXCoordinate(idx, data.length),
      cy: 160 - (val / maxVal) * 120,
      val: Math.round(val) // <--- This 'val' property is read by the HTML template
    }));
  }

  // 3. Dynamic Y-Axis scale maximum label
  getTrendMaxLabel(): string {
    const max = Math.max(...this.trendPlantationData, 1);
    if (max > 1000) return (max / 1000).toFixed(1) + 'K';
    return Math.round(max).toString();
  }

  // 4. Dynamic Y-Axis scale midpoint label
  getTrendMidLabel(): string {
    const max = Math.max(...this.trendPlantationData, 1);
    if (max > 1000) return (max / 2000).toFixed(1) + 'K';
    return Math.round(max / 2).toString();
  }


  // --- Dynamic Operations for Card 2 (Plantation Progress) ---
  onProgressYearChange(year: string): void {
    this.selectedProgressYear = parseInt(year);
    this.updatePlantationProgress();
  }

  updatePlantationProgress(): void {
    if (this.jfmcRecords.length === 0) return;
    const filtered = this.jfmcRecords.filter(r => r.year === this.selectedProgressYear);
    
    // Scale proportional values from Area_Hect sum to show dynamic indicators
 const totalArea = filtered.reduce((acc, curr) => acc + curr.totalForestArea, 0);
    
    this.plantedValue = Math.round(totalArea * 4.6);
    this.targetValue = Math.round(650000 + (this.selectedProgressYear - 2020) * 18000);
    this.survivalValue = Math.round(this.plantedValue * 0.85); // 85% survival rate
    this.progressRate = parseFloat(((this.plantedValue / this.targetValue) * 100).toFixed(1));
    this.strokeDashOffset = 251.2 - (251.2 * (this.progressRate / 100));
  }

  // --- Dynamic Operations for Card 3 (Top 5 Districts) ---
  onTopDistrictsYearChange(year: string): void {
    this.selectedTopDistrictsYear = parseInt(year);
    this.updateTopDistricts();
  }

  updateTopDistricts(): void {
    if (this.jfmcRecords.length === 0) return;
    
    const districtMap: { [key: string]: number } = {};
    this.jfmcRecords
      .filter(r => r.year === this.selectedTopDistrictsYear)
      .forEach(r => {
        districtMap[r.district] = (districtMap[r.district] || 0) + r.totalForestArea;
      });

    const sorted = Object.keys(districtMap).map(dist => ({
      district: dist,
      area: districtMap[dist]
    })).sort((a, b) => b.area - a.area);

    const maxArea = sorted[0]?.area || 1;
    this.topDistrictsList = sorted.slice(0, 5).map(item => ({
      district: item.district,
      area: Math.round(item.area),
      percentage: Math.round((item.area / maxArea) * 100)
    }));
  }

  private loadCSVData(): void {
    this.http.get('assets/data/forest_cover.csv', { responseType: 'text' }).subscribe({
      next: (csvText) => {
        const parsed = this.parseCSV(csvText);
        if (parsed.length > 0) {
          this.forestCoverList = parsed.map(row => ({
            district: row[0],
            veryDense: Number(row[1]),
            moderatelyDense: Number(row[2]),
            openForest: Number(row[3]),
            scrub: Number(row[4]),
            nonForest: Number(row[5]),
            total: Number(row[6])
          }));
          this.onForestDistrictChange(this.selectedForestDistrict);
        }
      }
    });

    this.http.get('assets/data/check_dams.csv', { responseType: 'text' }).subscribe({
      next: (csvText) => {
        const parsed = this.parseCSV(csvText);
        if (parsed.length > 0) {
          this.checkDamList = parsed.map(row => ({
            district: row[0],
            totalDams: Number(row[1]),
            operational: Number(row[2]),
            underMaintenance: Number(row[3]),
            underConstruction: Number(row[4]),
            storageCapacity: Number(row[5])
          }));
          this.onDamDistrictChange(this.selectedDamDistrict);
        }
      }
    });

    this.http.get('assets/data/agro_forestry.csv', { responseType: 'text' }).subscribe({
      next: (csvText) => {
        const parsed = this.parseCSV(csvText);
        if (parsed.length > 0) {
          this.agroForestryList = parsed.map(row => ({
            district: row[0],
            areaCovered: Number(row[1]),
            saplingsDistributed: Number(row[2]),
            farmersBenefited: Number(row[3]),
            dominantSpecies: row[4]
          }));
          this.onAgroDistrictChange(this.selectedAgroDistrict);
        }
      }
    });
  }

// Dynamic point vector loader supporting distinct custom shapes, sticky hover tooltips, and async overlay registry
private loadWfsPointsLayer(
    layerTypeName: string, 
    color: string, 
    mapInstance: L.Map, 
    layersControl?: L.Control.Layers, 
    overlayName?: string
  ): void {
    const wfsUrl = `http://183.82.114.29:9901/geoserver/ws_figs/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=ws_figs:${layerTypeName}&outputFormat=application/json`;

    this.http.get(wfsUrl).subscribe({
      next: (geoJsonData: any) => {
        if (!geoJsonData || !geoJsonData.features) return;

        const geoJsonLayer = L.geoJSON(geoJsonData, {
          pointToLayer: (feature: any, latlng: any) => {
            // A. Check Dams: Rendered as a Teal Diamond marker
            if (layerTypeName === 'Checkdam_Phase2') {
              return L.marker(latlng, {
                icon: L.divIcon({
                  className: 'checkdam-custom-marker',
                  html: '<div class="checkdam-marker-inner"></div>',
                  iconSize: [7, 7],
                  iconAnchor: [3, 3]
                })
              });
            }
            
            // B. Agroforestry: Rendered as a Dark Green Circle marker
            return L.marker(latlng, {
              icon: L.divIcon({
                className: 'agroforestry-custom-marker',
                html: '<div class="agroforestry-marker-inner"></div>',
                iconSize: [7, 7],
                iconAnchor: [3, 3]
              })
            });
          },
          onEachFeature: (feature: any, layer: any) => {
            let popupContent = '<strong>Point Attributes</strong><br>';
            if (feature.properties) {
              Object.keys(feature.properties).forEach(key => {
                if (feature.properties[key] !== null && feature.properties[key] !== undefined) {
                  popupContent += `<b>${key}:</b> ${feature.properties[key]}<br>`;
                }
              });
            }
            
            // C. Sticky Hover Tooltip (Now works 100% reliably on both layers)
            layer.bindTooltip(popupContent, {
              sticky: true,
              direction: 'top',
              offset: [0, -5],
              className: 'leaflet-points-hover-tooltip'
            });
          }
        });

        // Add WFS point layer to map
        geoJsonLayer.addTo(mapInstance);
        
        // Force point layers to the front
        geoJsonLayer.bringToFront();

        // Dynamically append check box control to the existing basemap controller
        if (layersControl && overlayName) {
          layersControl.addOverlay(geoJsonLayer, overlayName);
        }
      }
    });
  }

  private parseCSV(text: string): string[][] {
    const lines = text.split('\n');
    return lines
      .map(line => line.split(',').map(cell => cell.trim()))
      .filter(row => row.length > 1 && row[0] !== 'District' && row[0] !== '');
  }

private initializeAllMaps(): void {
    const tripuraCentroid: L.LatLngExpression = [23.8315, 91.2868];

    // Initialize map instances
    this.forestMap = L.map('forestMapContainer', { zoomControl: false }).setView(tripuraCentroid, 8);
    this.damMap = L.map('damMapContainer', { zoomControl: false }).setView(tripuraCentroid, 8);
    this.agroMap = L.map('agroMapContainer', { zoomControl: false }).setView(tripuraCentroid, 8);

    const googleStreetsConfig = {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      attribution: 'Google Streets'
    };

    const createBaseLayers = () => {
      const googleStreets = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        attribution: 'Google Streets'
      });

      const openStreetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
      });

      const googleSatellite = L.tileLayer('http://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        attribution: 'Google Satellite'
      });

      return { googleStreets, openStreetMap, googleSatellite };
    };

    // === 1. Forest Cover Status Map Setup ===
    const forestLayers = createBaseLayers();
    forestLayers.googleStreets.addTo(this.forestMap);

    const wmsBase = "http://183.82.114.29:9901/geoserver/cite/wms";
    const canopyDensityLayer = L.tileLayer.wms(wmsBase, {
      layers: 'cite:fcd',
      format: 'image/png',
      transparent: true,
      version: '1.1.0',
      maxZoom: 20,
      className: 'remove-white-bg'
    });
    canopyDensityLayer.addTo(this.forestMap);
    canopyDensityLayer.bringToFront();

    L.control.layers({
      'Google Streets': forestLayers.googleStreets,
      'OpenStreetMap': forestLayers.openStreetMap,
      'Google Satellite': forestLayers.googleSatellite
    }, {
      'Canopy Density': canopyDensityLayer
    }, { collapsed: true, position: 'topright' }).addTo(this.forestMap);


    // === 2. Check Dam Details Map Setup ===
    const damLayers = createBaseLayers();
    damLayers.googleStreets.addTo(this.damMap);

    const damControl = L.control.layers({
      'Google Streets': damLayers.googleStreets,
      'OpenStreetMap': damLayers.openStreetMap,
      'Google Satellite': damLayers.googleSatellite
    }, undefined, { collapsed: true, position: 'topright' }).addTo(this.damMap);

    // Load Check Dam Points WFS Overlay & register dynamically to damControl
 this.loadWfsPointsLayer('Checkdam_Phase2', '#0B2275', this.damMap, damControl, 'Check Dams');

    // === 3. Agro Forestry Status Map Setup ===
    const agroLayers = createBaseLayers();
    agroLayers.googleStreets.addTo(this.agroMap);

    const agroControl = L.control.layers({
      'Google Streets': agroLayers.googleStreets,
      'OpenStreetMap': agroLayers.openStreetMap,
      'Google Satellite': agroLayers.googleSatellite
    }, undefined, { collapsed: true, position: 'topright' }).addTo(this.agroMap);

    // Load Agroforestry Points WFS Overlay & register dynamically to agroControl
    this.loadWfsPointsLayer('AgroForestry_Points', '#006400', this.agroMap, agroControl, 'Agroforestry Points');


    // Fetch Vector Boundaries
    this.queryGeoserverWfsLayer('Forest_District', '#10b981', 'forest');
    this.queryGeoserverWfsLayer('Forest_District', '#0288d1', 'dam');
    this.queryGeoserverWfsLayer('Forest_District', '#e65100', 'agro');

    this.drawStateBoundaryWfs();
  }

  private queryGeoserverWfsLayer(layerTypeName: string, boundaryColor: string, mapType: 'forest' | 'dam' | 'agro'): void {
    const wfsUrl = `${this.geoserverWfsUrl}?service=WFS&version=1.0.0&request=GetFeature&typeName=ws_figs:${layerTypeName}&maxFeatures=100&srsName=EPSG:4326&outputFormat=application/json`;

    this.http.get(wfsUrl).subscribe({
      next: (geoJsonData: any) => {
        const leafLayer = L.geoJSON(geoJsonData, {
          style: () => ({
            color: boundaryColor,
            weight: 1.5,
            fillColor: boundaryColor,
            fillOpacity: 0.12
          }),
          onEachFeature: (feature: any, layer: any) => {
            const districtName = feature.properties.District_F || feature.properties.District_Name || feature.properties.name || 'District';
            layer.bindTooltip(districtName, { sticky: true, className: 'leaflet-district-tooltip' });
            
            layer.on({
              click: () => {
                if (mapType === 'forest') this.onForestDistrictChange(districtName);
                if (mapType === 'dam') this.onDamDistrictChange(districtName);
                if (mapType === 'agro') this.onAgroDistrictChange(districtName);
              }
            });
          }
        });

        if (mapType === 'forest') {
          this.forestGeoJsonLayer = leafLayer;
          this.forestGeoJsonLayer.addTo(this.forestMap);
        } else if (mapType === 'dam') {
          this.damGeoJsonLayer = leafLayer;
          this.damGeoJsonLayer.addTo(this.damMap);
        } else if (mapType === 'agro') {
          this.agroGeoJsonLayer = leafLayer;
          this.agroGeoJsonLayer.addTo(this.agroMap);
        }
      }
    });
  }

  private drawStateBoundaryWfs(): void {
    const stateWfsUrl = `${this.geoserverWfsUrl}?service=WFS&version=1.0.0&request=GetFeature&typeName=ws_figs:State_Boundary&maxFeatures=1&srsName=EPSG:4326&outputFormat=application/json`;

    this.http.get(stateWfsUrl).subscribe({
      next: (boundaryGeoJson: any) => {
        const styleConfig = { color: '#0f172a', weight: 2.5, fill: false };
        L.geoJSON(boundaryGeoJson, { style: styleConfig }).addTo(this.forestMap);
        L.geoJSON(boundaryGeoJson, { style: styleConfig }).addTo(this.damMap);
        L.geoJSON(boundaryGeoJson, { style: styleConfig }).addTo(this.agroMap);
      }
    });
  }

  // --- Individual Change Event Handlers ---
  onForestDistrictChange(district: string): void {
    this.selectedForestDistrict = district;
    this.activeForestCover = this.forestCoverList.find(d => d.district.toLowerCase() === district.toLowerCase()) 
      || this.forestCoverList[0];
    this.applyIndividualHighlight(this.forestGeoJsonLayer, this.forestMap, district);
  }

  onDamDistrictChange(district: string): void {
    this.selectedDamDistrict = district;
    this.activeCheckDam = this.checkDamList.find(d => d.district.toLowerCase() === district.toLowerCase()) 
      || this.checkDamList[0];
    this.applyIndividualHighlight(this.damGeoJsonLayer, this.damMap, district);
  }

  onAgroDistrictChange(district: string): void {
    this.selectedAgroDistrict = district;
    this.activeAgroForestry = this.agroForestryList.find(d => d.district.toLowerCase() === district.toLowerCase()) 
      || this.agroForestryList[0];
    this.applyIndividualHighlight(this.agroGeoJsonLayer, this.agroMap, district);
  }

  private applyIndividualHighlight(geoJsonLayer: L.GeoJSON, mapInstance: L.Map, district: string): void {
    if (!geoJsonLayer) return;

    geoJsonLayer.resetStyle();

    if (district === 'All Districts') {
      mapInstance.setView([23.8315, 91.2868], 8);
      return;
    }

    geoJsonLayer.eachLayer((layer: any) => {
      const props = layer.feature.properties;
      const layerName = props.District_F || props.District_Name || props.name || '';

      if (layerName.toLowerCase() === district.toLowerCase()) {
        layer.setStyle({
          fillColor: '#7014ad',
          
          fillOpacity: 0.4,
          weight: 2.5,
          color: '#ffffff'
        });

        mapInstance.fitBounds(layer.getBounds(), { padding: [15, 15] });
        layer.bindPopup(`<strong>${layerName}</strong>`).openPopup();
      }
    });
  }


 openMapModal(mapType: string): void {
    this.showModal = true;
    this.activeModalMapType = mapType;
    
    let targetLayerName = 'Forest_District';
    let highlightDistrict = 'All Districts';
    let boundaryColor = '#10b981';

    if (mapType === 'forest') {
      this.activeModalMapTitle = 'Forest Cover Status Overlay';
      highlightDistrict = this.selectedForestDistrict;
      boundaryColor = '#10b981';
    } else if (mapType === 'dam') {
      this.activeModalMapTitle = 'Check Dam Hydrology Map';
      highlightDistrict = this.selectedDamDistrict;
      boundaryColor = '#0288d1';
    } else if (mapType === 'agro') {
      this.activeModalMapTitle = 'Agro Forestry Plantation Map';
      highlightDistrict = this.selectedAgroDistrict;
      boundaryColor = '#e65100';
    }

    // Initialize the Modal Leaflet Map
    setTimeout(() => {
      this.destroyModalMap();
      
      this.modalMap = L.map('modalMapContainer', { zoomControl: true }).setView([23.8315, 91.2868], 8);
      
      const modalGoogleStreets = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        attribution: 'Google Streets'
      });

      const modalOSM = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
      });

      const modalSatellite = L.tileLayer('http://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        attribution: 'Google Satellite'
      });

      // Default active base inside Modal is Satellite
       modalGoogleStreets.addTo(this.modalMap);

      // Setup overlays dynamically inside modal
      let modalOverlays = {};

      if (mapType === 'forest') {
        const wmsBase = "http://183.82.114.29:9901/geoserver/cite/wms";
        const canopyWms = L.tileLayer.wms(wmsBase, {
          layers: 'cite:fcd',
          format: 'image/png',
          transparent: true,
          version: '1.1.0',
          maxZoom: 20,
          className: 'remove-white-bg'
        });
        canopyWms.addTo(this.modalMap);
        canopyWms.bringToFront();
        modalOverlays = { 'Canopy Density': canopyWms };
      }

      // Add EXACTLY ONE layer controller to modal view
      const modalControl = L.control.layers({
        'Google Streets': modalGoogleStreets,
        'OpenStreetMap': modalOSM,
        'Google Satellite': modalSatellite
      }, modalOverlays, { collapsed: false, position: 'topright' }).addTo(this.modalMap);

      // Load vector point overlays inside modal and register dynamically with modalControl
      if (mapType === 'dam') {
      this.loadWfsPointsLayer('Checkdam_Phase2', '#0B2275', this.modalMap, modalControl, 'Check Dams');
    
      } else if (mapType === 'agro') {
        this.loadWfsPointsLayer('AgroForestry_Points', '#006400', this.modalMap, modalControl, 'Agroforestry Points');
      }

      // Load State Boundary on modal
      const stateWfsUrl = `${this.geoserverWfsUrl}?service=WFS&version=1.0.0&request=GetFeature&typeName=ws_figs:State_Boundary&maxFeatures=1&srsName=EPSG:4326&outputFormat=application/json`;
      this.http.get(stateWfsUrl).subscribe({
        next: (boundaryGeoJson: any) => {
          L.geoJSON(boundaryGeoJson, { style: { color: '#ffffff', weight: 3, fill: false } }).addTo(this.modalMap);
        }
      });

      // Load District layers on modal
      const wfsUrl = `${this.geoserverWfsUrl}?service=WFS&version=1.0.0&request=GetFeature&typeName=ws_figs:${targetLayerName}&maxFeatures=100&srsName=EPSG:4326&outputFormat=application/json`;
      this.http.get(wfsUrl).subscribe({
        next: (geoJsonData: any) => {
          const modalLayer = L.geoJSON(geoJsonData, {
            style: () => ({
              color: boundaryColor,
              weight: 2,
              fillColor: boundaryColor,
              fillOpacity: 0.15
            }),
            onEachFeature: (feature: any, layer: any) => {
              const districtName = feature.properties.District_F || feature.properties.District_Name || feature.properties.name || 'District';
              layer.bindTooltip(districtName, { sticky: true });
            }
          }).addTo(this.modalMap);

          // Focus and highlight specific selected district
          if (highlightDistrict !== 'All Districts') {
            modalLayer.eachLayer((layer: any) => {
              const props = layer.feature.properties;
              const layerName = props.District_F || props.District_Name || props.name || '';
              if (layerName.toLowerCase() === highlightDistrict.toLowerCase()) {
                layer.setStyle({
                  fillColor: '#7014ad',
                  fillOpacity: 0.5,
                  weight: 3,
                  color: '#ffffff'
                });
                this.modalMap.fitBounds(layer.getBounds(), { padding: [40, 40] });
                layer.bindPopup(`<strong>${layerName} Selection</strong>`).openPopup();
              }
            });
          }
        }
      });
    }, 100);
  }


  closeModal(): void {
    this.showModal = false;
    this.destroyModalMap();
  }

  private destroyModalMap(): void {
    if (this.modalMap) {
      this.modalMap.remove();
      this.modalMap = undefined as any;
    }
  }


  toggleDownloadDropdown(): void {
    this.showDownloadDropdown = !this.showDownloadDropdown;
  }

  triggerDownload(type: 'excel' | 'jpeg'): void {
    this.showDownloadDropdown = false; // Auto-close menu on click
    if (type === 'excel') {
      this.downloadReport();
    } else if (type === 'jpeg') {
      this.downloadAsJPEG();
    }
  }


downloadReport(): void {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Header Title
    csvContent += "TRIPURA FOREST MANAGEMENT - COMPREHENSIVE DASHBOARD REPORT\n";
    csvContent += `Report Generated on: ${new Date().toLocaleDateString()}\n\n`;

    // 1. Key Highlights (State Overview)
    csvContent += "=== 1. KEY HIGHLIGHTS (STATE OVERVIEW) ===\n";
    csvContent += "Metric,Value,Unit\n";
    csvContent += "Total Forest Cover,174620,ha\n";
    csvContent += "Plantation (2020-2026),2345,ha\n";
    csvContent += "Check Dam (M1/M2/M3),1287,Nos.\n";
    csvContent += "Agroforestry Beneficiary,8450,Farmers\n";
    csvContent += "Number of JFMC Formed,320,Nos.\n";
    csvContent += "Number of SHG Formed,1240,Nos.\n\n";

    // 2. Active Map Card Selections
    csvContent += "=== 2. MAP SELECTIONS & CURRENT METRICS ===\n";
    csvContent += "Map Section,Selected District,Total Value\n";
    csvContent += `Forest Cover Status,${this.selectedForestDistrict},${this.activeForestCover.total} ha\n`;
    csvContent += `Check Dam Details,${this.selectedDamDistrict},${this.activeCheckDam.totalDams} dams\n`;
    csvContent += `Agro Forestry Status,${this.selectedAgroDistrict},${this.activeAgroForestry.areaCovered} ha\n\n`;

    // 3. Yearly Trend Overview
    csvContent += `=== 3. YEARLY TREND OVERVIEW (Selected District: ${this.trendDistrict}) ===\n`;
    csvContent += "Year,Total Forest Cover (ha),Semi Evergreen (ha),Tropical Evergreen (ha)\n";
    for (let i = 0; i < this.trendYears.length; i++) {
      csvContent += `${this.trendYears[i]},${this.trendForestCoverData[i] || 0},${this.trendSemiEvergreenData[i] || 0},${this.trendTropicalData[i] || 0}\n`;
    }
    csvContent += "\n";

    // 4. Plantation Progress Card
    csvContent += `=== 4. PLANTATION PROGRESS DETAILS (Selected Year: ${this.selectedProgressYear}) ===\n`;
    csvContent += "Metric,Value\n";
    csvContent += `Target Saplings,${this.targetValue}\n`;
    csvContent += `Planted Saplings,${this.plantedValue}\n`;
    csvContent += `Survival Saplings,${this.survivalValue}\n`;
    csvContent += `Progress Rate,${this.progressRate}%\n\n`;

    // 5. Top 5 Districts
    csvContent += `=== 5. TOP 5 DISTRICTS FOR YEAR ${this.selectedTopDistrictsYear} ===\n`;
    csvContent += "Rank,District,Forest Area (ha)\n";
    this.topDistrictsList.forEach((item, index) => {
      csvContent += `${index + 1},${item.district},${item.area}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Tripura_Forest_Dashboard_Report_${this.selectedProgressYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  downloadAsJPEG(): void {
    // Selects the main body container only, excluding any outer page margins or system headers
    const dashboardBody = document.querySelector('.main-content-full') as HTMLElement;
    if (!dashboardBody) return;

    // Load html2canvas dynamically from CDN if not already available in global scope
    if ((window as any).html2canvas) {
      this.captureAndSave(dashboardBody);
    } else {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
      script.onload = () => this.captureAndSave(dashboardBody);
      document.head.appendChild(script);
    }
  }

  private captureAndSave(element: HTMLElement): void {
    (window as any).html2canvas(element, {
      useCORS: true,         // Allows map tiles to load correctly inside canvas render
      allowTaint: false,
      scale: 2,              // Doubles scale to ensure high pixel-density & crisp text
      logging: false,
      backgroundColor: '#f8fafc' // Ensures consistent soft grey background canvas filling
    }).then((canvas: HTMLCanvasElement) => {
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const link = document.createElement('a');
      link.href = imgData;
      link.download = `Tripura_Forest_Dashboard_Snapshot.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }
}