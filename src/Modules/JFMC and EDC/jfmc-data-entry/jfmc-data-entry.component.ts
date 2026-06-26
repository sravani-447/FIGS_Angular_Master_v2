import { Component, EventEmitter, OnInit, Output, HostListener, ChangeDetectorRef  } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { ServerRequests } from '../../../services/ServerRequests';
import { GridColumn } from '../../../shared/Grids/grid-column.model';

@Component({
  selector: 'app-jfmc-data-entry',
  templateUrl: './jfmc-data-entry.component.html',
  styleUrls: ['./jfmc-data-entry.component.css']
})
export class JFMCDataEntryComponent implements OnInit {
  filteredBeats: any[]=[];
  jfmcID: any;
  selectedHouseholdId: any;

  addHHMemberRow() {
    if (!this.addHHDynamicMembers) {
        this.addHHDynamicMembers = [];
    }

    // Get the max limit from the form data
    const maxLimit = Number(this.formData.total_hh_gen) || 0;

    if (maxLimit === 0) {
      this.snackBar.open("Please enter 'No. of Households in General Body' first.", 'Close', { duration: 3000 });
      return;
    }

    if (this.addHHDynamicMembers.length >= maxLimit) {
      this.snackBar.open(`You cannot add more than ${maxLimit} members.`, 'Close', { duration: 3000 });
      return;
    }

    this.addHHDynamicMembers.push({}); 
  }

  removeHHMemberRow() {
    if (this.addHHDynamicMembers && this.addHHDynamicMembers.length > 1) {
      this.addHHDynamicMembers.pop(); 
    }
  }

  // --- UI Flags & State ---
  isViewOpen: boolean = false;
  selectedJfmcDetails: any = null;
  userid: any;
  activeBankTab: string = 'committee';
  activeExecutiveTab: string = 'member';

  isFormOpen = false;
  currentStep = 0;
  isLoading = false;
  
  // --- Data Containers ---
  data: any[] = []; // Grid Data
  formData: any = {}; // Wizard Form Data
  stepFields: any[][] = []; // Form Structure
  
  // --- Dynamic Lookups & Geo ---
  lookupData: any = {};
  geoData: any[] = [];
  beatList: any[] = [];
  
  formationType: string = 'Year'; 
  villageList: any[] = []; 

  // --- Sub-Tables Data ---
  householdMembers: any[] = [];
  executiveHistory: any[] = [];
  
  // --- Modals State ---
  isEditMicroplanOpen: boolean = false;
  editMpData: any = {};
  
  isAddHHModalOpen: boolean = false;
  addHHData: any = {};
  addHHDynamicMembers: any[] = [{}];
  
  isUpdateExecModalOpen: boolean = false;
  updateExecData: any = {};

  // --- Wizard Config ---
  wizardSteps = [
    { label: 'General', icon: '1' },
    { label: 'Geographic', icon: '2' },
    { label: 'Microplan Status', icon: '3' },
    { label: 'Bank Status', icon: '4' },
    { label: 'Household Details', icon: '5' },
    { label: 'Executive Committee', icon: '6' }
  ];

  @Output() actionClicked = new EventEmitter<any>();

  // --- Grid Configuration ---
  columns: GridColumn[] = [
    { field: 'sno', header: 'SL.NO.' },
    {
      header: 'Action',
      type: 'actions',
      field: '',
      actions: [
        { icon: 'fa fa-eye', action: 'viewJFMC', tooltip: 'View JFMC' }
      ]
    },
    { field: 'jfmc_id', header: 'JFMC ID' },
    { field: 'name_of_committee', header: 'JFMC Name' },
    { field: 'commitee_name', header: 'Committee Type' },
    { field: 'project_area_hect', header: 'JFMC Area(HA)' },
    { field: 'beat_name', header: 'Beat Name' },
    { field: 'range_name', header: 'Range' },
    { field: 'subdivision_name', header: 'Sub division' },
    { field: 'district_name', header: 'District' }
  ];
  isHHMembersExpanded: any;

  constructor(
    private coreservices: ServerRequests, // Renamed to match reference style
    private snackBar: MatSnackBar,
    private http: HttpClient,
     private cdr: ChangeDetectorRef
  ) {
    var session = sessionStorage.getItem("Session");
    if (session) {
      var sessionDetails = JSON.parse(session);
      this.userid = sessionDetails.Data[0].user_id;
    }
  }

  ngOnInit() {
    this.initFormStructure();
    this.getLookups();
    this.getallgeo(); 
    this.loadVillages();
    this.loadJFMCData();
    this.formData.formation_type_toggle = 'Year'; 
  }

  loadVillages() {
    const session = sessionStorage.getItem('Session');
    if (!session) return;

    const parsedSession = JSON.parse(session);
    const jdString = parsedSession.Data?.[0]?.jurisdiction_details;
    
    if (jdString) {
      const jurisdiction = JSON.parse(jdString).Jurisdiction;
      const beat = jurisdiction.beat ? jurisdiction.beat.join(",") : "";
      const range = jurisdiction.range ? jurisdiction.range.join(",") : "";

      if (beat && range) {
        this.coreservices.getVillageByRangeBeat(range, beat).subscribe({
          next: (res: any) => {
            const data = res.Data || res;
            if (data) {
              this.villageList = data.map((item: any) => ({
                label: item.gp_vc_name,
                value: item.gp_vc_name 
              }));

              this.updateFieldOptions(1, 'village_name', this.villageList);
            }
          },
          error: (err) => console.error("Error loading villages:", err)
        });
      }
    }
  }

  // =========================================================
  // 1. DATA LOADING & LOOKUPS
  // =========================================================
  getLookups() {
    this.coreservices.getAllLookUps(1).subscribe({
      next: (res: any) => {
        try {
          const data = res.Data || res;
          this.lookupData = data;

          const mapOptions = (list: any[], labelKey: string, valueKey: string = 'id') => {
             return list ? list.map(item => ({ label: item[labelKey], value: item[valueKey] })) : [];
          };

          // Step 0: General
          this.updateFieldOptions(0, 'committee_type', mapOptions(data.commitee_master, 'name'));
          this.updateFieldOptions(0, 'formed_under', mapOptions(data.scheme_master, 'scheme_name')); 
          
          // Step 1: Geo
          this.updateFieldOptions(1, 'forest_type', mapOptions(data.forest_type_master, 'name'));

        } catch (e) { console.error("Lookup parse error:", e); }
      }
    });
  }

  getallgeo() {
    this.coreservices.getAllGeo(1).subscribe({
      next: res => {
        this.geoData = res?.Data ?? [];
        sessionStorage.setItem("jurisdictionDetails", JSON.stringify(this.geoData));
        this.filterBeatsByJurisdiction();
      }
    });
  }

  filterBeatsByJurisdiction() {
    const session = sessionStorage.getItem('Session');
    if (!session) return;

    const parsedSession = JSON.parse(session);
    const jurisdiction = parsedSession.Data?.[0]?.jurisdiction_details
      ? JSON.parse(parsedSession.Data[0].jurisdiction_details).Jurisdiction
      : null;

    if (jurisdiction && jurisdiction.beat && this.geoData.length > 0) {
      const allowedBeatNames = jurisdiction.beat;

      this.filteredBeats = this.geoData
        .filter((g: any) => allowedBeatNames.includes(g.beat_name))
        .map((b: any) => ({
          label: b.beat_name,
          value: b.beat_id
        }))
        .filter((v, i, a) => a.findIndex(t => t.label === v.label) === i);

    } else {
      this.filteredBeats = this.geoData
        .map((b: any) => ({
          label: b.beat_name,
          value: b.beat_id
        }))
        .filter((v, i, a) => a.findIndex(t => t.value === v.value) === i);
    }

    this.updateFieldOptions(0, 'beat', this.filteredBeats);
  }

  formatDate(dateVal: any): string | null {
      if (!dateVal) return null;
      const d = new Date(dateVal);
      return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  loadJFMCData() {
    this.isLoading = true;
    this.coreservices.getJFMCList(this.userid).subscribe({
      next: (res: any) => {
        let rawData = (res && res.Data) ? res.Data : (Array.isArray(res) ? res : []);
        this.data = rawData.map((item: any, index: number) => ({ ...item, sno: index + 1,jfmcdataentrymodule:true }));
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

isFieldDisabled(key: string): boolean {
  if (key === 'prep_date' || key === 'upload_plan') {
    return this.formData.is_microplan === 'No';
  }
  
  if (key === 'approval_date') {
    return this.formData.is_mp_approved === 'No';
  }

  return false;
}

  // =========================================================
  // 2. VIEW LOGIC
  // =========================================================

  onGridAction(event: any) {
    if (event.action === 'viewJFMC') {
      this.openView();
      this.showJFMCDetails(event.row);
    }
  }

  openView(): void { this.isViewOpen = true; }
  closeView(): void { this.isViewOpen = false; }

showJFMCDetails(row: any): void {
    // 1. Get the ID safely
    const jfmcid = row.id || row.jfmc_id;
    if (!jfmcid) return;

    this.coreservices.getAllJFMCRelatedDetails(jfmcid).subscribe({
        next: (res: any) => {
            // Handle different API return types (Stringified vs Object)
            let parsedData = (typeof res === 'string') ? JSON.parse(res) : res;
            const dataAll = parsedData.Data || parsedData;
            console.log("Raw API response for JFMC details:", res);

            const master = dataAll?.jfmc_master?.[0] || {};
            const geo = dataAll?.jfmc_geo?.[0] || {};
            const mp = dataAll?.jfmc_microplan?.[0] || {};
            const bank = dataAll?.jfmc_bankstatus?.[0] || {};
            const hh = dataAll?.jfmc_hh_details?.[0] || {};
            const exec = dataAll?.jfmc_exexutive_commitee?.[0] || {};

            const getLookupName = (listName: string, id: any) => {
                const list = this.lookupData[listName];
                const found = list ? list.find((x: any) => x.id == id) : null;
                return found ? (found.name || found.scheme_name) : 'N/A';
            };

            // Capture ID for updates
            this.selectedHouseholdId = hh.id || 0;

            // Map UI State
            this.selectedJfmcDetails = {
                jfmc_id: master.id,
                name_of_committee: master.name_of_committee,
               commitee_name: master.commitee_name || row.commitee_name || 'N/A',                 formed_under: getLookupName('scheme_master', master.commitee_formed_under),
                formation_year: master.formation_year,
                is_adc_village: master.commitee_in_adc_vc,
                mou_date: master.mou_signed_date,
                no_hh_village: hh.no_hh_village,

                village_name: geo.name_vill_gp,
                mauza_name: geo.name_mauza,
                no_of_hamlet: geo.no_of_hamlet,
                project_area_hect: geo.project_area_hect,
                forest_type: getLookupName('forest_type_master', geo.type_of_forest),

                mp_id: mp.id || 0,
                is_microplan_prepared: mp.is_microplan_prepared || 'No',
                mp_prep_date: mp.date_of_microplan,
                is_mp_approved: mp.is_approved_dfo || 'No',
                mp_approval_date: mp.date_approval_dfo,
                is_mp_revised: mp.is_microplan_revised || 'No',
                has_apo: mp.commitee_hav_apo || 'No',
                microplan_doc_filename: mp.microplan_doc_filename,

                com_bank_name: bank.com_bank_name,
                com_acc_number: bank.com_acc_number,
                com_bank_date: bank.com_acc_open_date,
                rev_bank_name: bank.rev_bank_name,
                rev_acc_number: bank.rev_acc_number,
                rev_bank_date: bank.rev_acc_open_date,

                sc_count: hh.no_sc || 0,
                st_count: hh.no_st || 0,
                other_count: hh.no_other || 0,
                bpl_count: hh.no_bpl || 0,
                women_headed: hh.no_women_headed_hh || 0,
                st_percent: hh.st_percentage || 0,
                total_hh: hh.no_hh_general_body || hh.no_hh_village || 0,

                exec_id: exec.id || 0,
                exec_male: exec.male || 0,
                exec_female: exec.female || 0,
                exec_ratio: exec.female_ration || '0.00',
                exec_election_date: exec.last_elec_date_exe_commitee,
                president_name: exec.president_name || 'N/A',
                president_gender: exec.president_gender || 'N/A',
                president_mobile: exec.president_mobile || 'N/A',
                vp_name: exec.vp_name || 'N/A',
                vp_gender: exec.vp_gender || 'N/A',
                vp_mobile: exec.vp_mobile || 'N/A',
                gp_name: exec.mem_rep_gp_name || 'N/A',
                gp_gender: exec.mem_rep_gp_gender || 'N/A',
                gp_mobile: exec.mem_rep_gp_mobile || 'N/A',
                secretary_name: exec.mem_sec_name || 'N/A',
                secretary_gender: exec.mem_sec_gender || 'N/A',
                secretary_mobile: exec.mem_sec_mobile || 'N/A'
            };

const rawHHMembers = dataAll?.jfmc_hh_details_members || [];

this.householdMembers = rawHHMembers.map((m: any, i: number) => ({
    sl: i + 1,
    id: m.id,
    name: m.member_name || 'N/A', 
    gender: m.gender || 'N/A',
    category: m.social_category || 'N/A',
    bpl: m.is_bpl || 'No',
    landless: m.is_landless || 'No',
    womenHeaded: m.is_women_headed || 'No'
}));


            // Map Executive History
            this.executiveHistory = (dataAll?.jfmc_exexutive_history || []).map((h: any, i: number) => ({
                sl: i + 1,
                male: h.male,
                female: h.female,
                ratio: h.female_ration != null ? parseFloat(h.female_ration).toFixed(2) : '',
                president: h.president_name,
                pmobile: h.president_mobile,
                vp: h.vp_name,
                vmobile: h.vp_mobile,
                gp: h.mem_rep_gp_name,
                gmobile: h.mem_rep_gp_mobile,
                sec: h.mem_sec_name,
                smobile: h.mem_sec_mobile,
                created: h.createdat
            }));

console.log("Final householdMembers array before UI render:", this.householdMembers);            
            this.cdr.detectChanges();
        },
        error: (err) => {
            console.error("Error loading JFMC details:", err);
            this.snackBar.open('Error loading details. Please try again.', 'Close', { duration: 3000 });
        }
    });
}

  // --- Local Custom Multiselect Logic ---
  openDropdownKey: string | null = null;

  toggleDropdown(key: string, event: Event) {
    event.stopPropagation();
    this.openDropdownKey = this.openDropdownKey === key ? null : key;
  }

  // --- Auto-Calculation Logic ---
  onInputChange(key: string) {
    if (key === 'sc_count' || key === 'st_count' || key === 'others_count' || key === 'total_hh_gen') {
        const sc = Number(this.formData.sc_count) || 0;
        const st = Number(this.formData.st_count) || 0;
        const other = Number(this.formData.others_count) || 0;
        
        this.formData.hh_village_count = sc + st + other;
        
        const generalBodyCount = Number(this.formData.total_hh_gen) || 0;
        if (generalBodyCount > 0) {
            this.formData.st_percent = ((st / generalBodyCount) * 100).toFixed(2);
        } else {
            this.formData.st_percent = 0;
        }
    }

    if (key === 'exec_male' || key === 'exec_female') {
        const male = Number(this.formData.exec_male) || 0;
        const female = Number(this.formData.exec_female) || 0;
        if (male > 0) {
            this.formData.exec_ratio = (female / male).toFixed(2);
        } else {
            this.formData.exec_ratio = 0;
        }
    }
  }

  @HostListener('document:click')
  closeDropdown() {
    this.openDropdownKey = null;
  }

  isMultiselectSelected(key: string, value: any): boolean {
    return this.formData[key] && this.formData[key].includes(value);
  }

  toggleMultiselectOption(key: string, value: any, event: Event) {
    event.stopPropagation();
    if (!this.formData[key]) {
      this.formData[key] = [];
    }
    const index = this.formData[key].indexOf(value);
    if (index > -1) {
      this.formData[key].splice(index, 1);
    } else {
      this.formData[key].push(value);
    }
  }

  removeMultiselect(key: string, index: number, event: Event) {
    event.stopPropagation();
    this.formData[key].splice(index, 1);
  }

  getMultiselectLabel(options: any[], value: any): string {
    if(!options) return value;
    const opt = options.find(o => o.value === value);
    return opt ? opt.label : value;
  }

  // =========================================================
  // 3. FORM WIZARD SETUP
  // =========================================================

  initFormStructure() {
    this.stepFields = [
      // Step 0: General
      [
        { key: 'committee_name', label: 'Name of the Committee', type: 'text', width: 'col-4' },
        { key: 'committee_type', label: 'Type of Committee', type: 'select', options: [], width: 'col-4' },
        { key: 'formed_under', label: 'Committee Formed Under', type: 'select', options: [], width: 'col-4' },
        { key: 'formation_year_composite', label: 'Year of Formation', type: 'composite_year_date', width: 'col-3' },
        { key: 'adc_village', label: 'Committee is in ADC-VC', type: 'select', options: [{label:'ADC', value:'ADC'}, {label:'Non-ADC', value:'Non-ADC'}], width: 'col-3' },
        { key: 'mou_date', label: 'Date of MoU Signed', type: 'date', width: 'col-3' },
        { key: 'beat', label: 'Select Beat', type: 'select', options: [], width: 'col-3' }
      ],
      // Step 1: Geo
      [
        { key: 'forest_type', label: 'Type of Forest', type: 'select', options: [], width: 'col-4' },
        { key: 'project_area', label: 'Project Area (HA)', type: 'number', width: 'col-4' },
        { key: 'hamlets_count', label: 'No. of Hamlets', type: 'number', width: 'col-4' },
        { key: 'village_name', label: 'Name of Villages', type: 'multiselect', options: [], width: 'col-6' },        
        { key: 'mauza_name', label: 'Name of Mauza', type: 'text', width: 'col-6' }
      ],
      // Step 2: Microplan
      [
        { key: 'is_microplan', label: 'Microplan prepared?', type: 'radio', options: ['Yes', 'No'], width: 'col-4' },
        { key: 'prep_date', label: 'Date of Preparation', type: 'date', width: 'col-4' },
        { key: 'upload_plan', label: 'Upload Microplan', type: 'file', width: 'col-4' },
        { key: 'is_mp_approved', label: 'Approved by DFO?', type: 'radio', options: ['Yes', 'No'], width: 'col-4' },
        { key: 'approval_date', label: 'Date of Approval', type: 'date', width: 'col-4' },
        { key: 'is_mp_revised', label: 'Microplan Revised?', type: 'radio', options: ['Yes', 'No'], width: 'col-4' },
        { key: 'has_apo', label: 'Has APO?', type: 'radio', options: ['Yes', 'No'], width: 'col-4' }
      ],
      // Step 3: Bank
      [
        { label: 'Committee Account', type: 'header', width: 'col-12' },
        { key: 'com_bank_name', label: 'Bank Name', type: 'text', width: 'col-3' },
        { key: 'com_acc_date', label: 'Opening Date', type: 'date', width: 'col-3' },
        { key: 'com_acc_no', label: 'Account Number', type: 'text', width: 'col-3' },
        { key: 'com_ifsc', label: 'IFSC', type: 'text', width: 'col-3' },

        { label: 'Revolving Fund Account', type: 'header', width: 'col-12' },
        { key: 'rev_bank_name', label: 'Bank Name', type: 'text', width: 'col-3' },
        { key: 'rev_acc_date', label: 'Opening Date', type: 'date', width: 'col-3' },
        { key: 'rev_acc_no', label: 'Account Number', type: 'text', width: 'col-3' },
        { key: 'rev_ifsc', label: 'IFSC', type: 'text', width: 'col-3' }
      ],
      // Step 4: Household
      [
        { key: 'hh_village_count', label: 'Village', type: 'number', width: 'col-12', disabled: true },
        
        { label: 'Social Category', type: 'header', width: 'col-12' },
        { key: 'sc_count', label: 'Scheduled Castes (SC):', type: 'number', width: 'col-4' },
        { key: 'st_count', label: 'Scheduled Tribes (ST):', type: 'number', width: 'col-4' },
        { key: 'others_count', label: 'Others:', type: 'number', width: 'col-4' },
        
        { label: 'Other Category', type: 'header', width: 'col-12' },
        { key: 'bpl_count', label: 'Below Poverty Line (BPL):', type: 'number', width: 'col-6' },
        { key: 'women_head', label: 'Women Headed HHs:', type: 'number', width: 'col-6' },
        
        { label: 'General Body', type: 'header', width: 'col-12' },
        { key: 'total_hh_gen', label: 'No. of Households in General Body of the Committee:', type: 'number', width: 'col-6' },
        { key: 'st_percent', label: 'ST percentage:', type: 'text', width: 'col-6', disabled: true },
        
        { 
          key: 'hh_members_table', 
          type: 'hh_table', 
          width: 'col-12',
          tableColumns: [
            { key: 'name', label: 'NAME:', type: 'text' },
            { key: 'gender', label: 'GENDER:', type: 'select', options: [{label:'Male',value:'Male'}, {label:'Female',value:'Female'}, {label:'Others',value:'Others'}] },
            { key: 'category', label: 'SOCIAL CATEGORY:', type: 'select', options: [{label:'SC',value:'SC'}, {label:'ST',value:'ST'}, {label:'Others',value:'Others'}] },
            { key: 'bpl', label: 'BELOW POVERTY LINE?', type: 'select', options: [{label:'Yes',value:'Yes'}, {label:'No',value:'No'}] },
            { key: 'womenHeaded', label: 'WOMEN HEADED HOUSEHOLDS?', type: 'select', options: [{label:'Yes',value:'Yes'}, {label:'No',value:'No'}] },
            { key: 'landless', label: 'LANDLESS?', type: 'select', options: [{label:'Yes',value:'Yes'}, {label:'No',value:'No'}] }
          ]
        }
      ],
      // Step 5: Executive
      [
        { label: 'MEMBERSHIP DETAILS', type: 'header', width: 'col-12' },
        { key: 'exec_male', label: 'MALE:', type: 'number', width: 'col-4' },
        { key: 'exec_female', label: 'FEMALE:', type: 'number', width: 'col-4' },
        { key: 'exec_ratio', label: 'FEMALE RATIO:', type: 'text', width: 'col-4', disabled: true },
        
        { label: 'ELECTION DETAILS', type: 'header', width: 'col-12' },
        { key: 'election_date', label: 'LAST ELECTION DATE OF EXECUTIVE COMMITTEE:', type: 'date', width: 'col-12' },
        
        { label: 'PRESIDENT', type: 'header', width: 'col-12' },
        { key: 'pres_name', label: 'NAME:', type: 'text', width: 'col-4' },
        { key: 'pres_gender', label: 'GENDER:', type: 'select', options: [{label:'Male',value:'Male'}, {label:'Female',value:'Female'}, {label:'Others',value:'Others'}], width: 'col-4' },
        { key: 'pres_mobile', label: 'MOBILE:', type: 'text', width: 'col-4' },
        
        { label: 'VICE PRESIDENT', type: 'header', width: 'col-12' },
        { key: 'vp_name', label: 'NAME:', type: 'text', width: 'col-4' },
        { key: 'vp_gender', label: 'GENDER:', type: 'select', options: [{label:'Male',value:'Male'}, {label:'Female',value:'Female'}, {label:'Others',value:'Others'}], width: 'col-4' },
        { key: 'vp_mobile', label: 'MOBILE:', type: 'text', width: 'col-4' },
        
        { label: 'MEMBER REPRESENTING GRAM PANCHAYAT', type: 'header', width: 'col-12' },
        { key: 'gp_name', label: 'NAME:', type: 'text', width: 'col-4' },
        { key: 'gp_gender', label: 'GENDER:', type: 'select', options: [{label:'Male',value:'Male'}, {label:'Female',value:'Female'}, {label:'Others',value:'Others'}], width: 'col-4' },
        { key: 'gp_mobile', label: 'MOBILE:', type: 'text', width: 'col-4' },
        
        { label: 'MEMBER SECRETARY', type: 'header', width: 'col-12' },
        { key: 'sec_name', label: 'NAME:', type: 'text', width: 'col-4' },
        { key: 'sec_gender', label: 'GENDER:', type: 'select', options: [{label:'Male',value:'Male'}, {label:'Female',value:'Female'}, {label:'Others',value:'Others'}], width: 'col-4' },
        { key: 'sec_mobile', label: 'MOBILE:', type: 'text', width: 'col-4' }
      ]
    ];
  }

  updateFieldOptions(stepIndex: number, key: string, options: any[]) {
    if (this.stepFields[stepIndex]) {
        const field = this.stepFields[stepIndex].find(f => f.key === key);
        if (field) field.options = options;
    }
  }

  save() {
    console.log("---- SAVE STARTED ----");
    
    try {
      this.isLoading = true;

      /* ===============================
         1️⃣ FORMATION YEAR / DATE
      =============================== */
      let finalFormationYear: string | null = null;
      if (this.formData.formation_type_toggle === 'Year') {
        finalFormationYear = this.formData.formation_year_val || '';
      } else {
        finalFormationYear = this.formatDate(this.formData.formation_date_val);
      }

      /* ===============================
         2️⃣ VILLAGE NAMES (ARRAY → STRING)
      =============================== */
      let villageNamesStr = Array.isArray(this.formData.village_name)
        ? this.formData.village_name.join(',')
        : (this.formData.village_name || '');

      /* ===============================
         3️⃣ GET BEAT LABEL
      =============================== */
      let selectedBeatLabel = '';
      if (this.formData.beat) {
        selectedBeatLabel = this.filteredBeats.find(b => b.value == this.formData.beat)?.label || '';
      }

      /* ===============================
         4️⃣ DEFINE PAYLOADS
      =============================== */
      const jfmc_master = {
        userId: this.userid,
        jfmc_name: this.formData.committee_name || '',
        jfmc_type_of_commitee_id: Number(this.formData.committee_type) || 0,
        jfmc_commitee_formed_under_id: Number(this.formData.formed_under) || 0,
        jfmc_year_of_formation: finalFormationYear || '',
        jfmc_commitee_is_in_adc: this.formData.adc_village || '',
        jfmc_date_mou: this.formatDate(this.formData.mou_date),
        beat_name: selectedBeatLabel,
        beat_id: String(this.formData.beat || '')
      };

      const jfmc_geo = {
        jfmc_id: 0, 
        userId: this.userid,
        type_of_forest: this.formData.forest_type,
        project_area_hectors: Number(this.formData.project_area) || 0,
        num_of_hamlets: Number(this.formData.hamlets_count) || 0,
        name_of_village: villageNamesStr,
        name_of_mouza: this.formData.mauza_name || ''
      };

      const jfmc_microplan = {
        jfmc_id: 0,
        userId: this.userid,
        is_microplanPrepared: this.formData.is_microplan,
        is_microplanApprovedDfo: this.formData.is_mp_approved,
        is_comm_having_apo: this.formData.has_apo,
        is_microplan_revised: this.formData.is_mp_revised,
        date_of_preparation: this.formatDate(this.formData.prep_date),
        date_of_approval: this.formatDate(this.formData.approval_date),
        microplan_doc: '',
        microplan_doc_filename: this.formData.upload_plan ? this.formData.upload_plan.name : ''
      };

      const jfmc_bankstatus = {
        jfmc_id: 0,
        userId: this.userid,
        com_bank_name: this.formData.com_bank_name || '',
        com_acc_open_date: this.formatDate(this.formData.com_acc_date),
        com_acc_number: this.formData.com_acc_no || '',
        com_ifsc: this.formData.com_ifsc || '',
        rev_bank_name: this.formData.rev_bank_name || '',
        rev_acc_open_date: this.formatDate(this.formData.rev_acc_date),
        rev_acc_number: this.formData.rev_acc_no || '',
        rev_ifsc: this.formData.rev_ifsc || ''
      };

      /* ===============================
         5️⃣ BASIC VALIDATION
      =============================== */
      if (!jfmc_master.beat_id || !jfmc_master.jfmc_name) {
        this.isLoading = false;
        this.snackBar.open('Please fill required fields (Beat & Name)', 'Close', { duration: 3000 });
        return;
      }

      if (jfmc_master.beat_id == "" || jfmc_geo.name_of_mouza == undefined || jfmc_bankstatus.com_acc_number == undefined || jfmc_microplan.date_of_preparation == undefined) {
         this.isLoading = false;
         this.snackBar.open('Missing critical data from wizard steps.', 'Close', { duration: 3000 });
         return;
      }

      /* ===============================
         6️⃣ NESTED INSERTS EXECUTION
      =============================== */
      this.coreservices.insertJfmcMaster(jfmc_master).subscribe({
        next: (masterRes: any) => {
          if (!masterRes || !masterRes.Data) {
            this.isLoading = false;
            this.snackBar.open('Error saving Master', 'Close', { duration: 3000 });
            return;
          }

          const newJfmcId = masterRes.Data;
          this.jfmcID = newJfmcId;

          jfmc_geo.jfmc_id = newJfmcId;
          this.coreservices.insertJfmcGeo(jfmc_geo).subscribe({
            next: () => {
              
              jfmc_microplan.jfmc_id = newJfmcId;
              this.coreservices.insertJfmcMicroPlanStatus(jfmc_microplan).subscribe({
                next: () => {
                  
                  jfmc_bankstatus.jfmc_id = newJfmcId;
                  this.coreservices.insertbankstatus(jfmc_bankstatus).subscribe({
                    next: () => {
                      
                      // Save Household Status
                   let formattedMembers: any[] = [];
  
  // Use the source of truth (addHHDynamicMembers)
  if (this.addHHDynamicMembers && this.addHHDynamicMembers.length > 0) {
      formattedMembers = this.addHHDynamicMembers
        .filter((m: any) => m.name && m.name.trim() !== "") 
        .map((m: any) => ({
          "member_name": m.name,         // DB Key: member_name
          "gender": m.gender || '',      // DB Key: gender
          "social_category": m.category || '', // DB Key: social_category
          "is_bpl": m.bpl || 'No',       // DB Key: is_bpl
          "is_women_headed": m.womenHeaded || 'No', // DB Key: is_women_headed
          "is_landless": m.landless || 'No'      // DB Key: is_landless
        }));
  }

  const totalHH = Number(this.formData.total_hh_gen || 0);
  const formDataHH = {
      "jfmc_id": newJfmcId,
      "no_hh_village": totalHH,
      "no_sc": Number(this.formData.sc_count || 0),
      "no_st": Number(this.formData.st_count || 0),
      "no_other": Number(this.formData.others_count || 0),
      "no_bpl": Number(this.formData.bpl_count || 0),
      "no_women_headed_hh": Number(this.formData.women_head || 0),
      "no_hh_general_body": totalHH,
      "st_percentage": this.formData.st_percent || '0',
      "createdby": this.userid,
      "hhMemberDetails": formattedMembers
  };

  this.coreservices.inserthouseholddetailsstatus(formDataHH).subscribe({
      next: () => {
                          // Finally, Save Executive Committee
                          const formDataExec = {
                            male: this.formData.exec_male,
                            female: this.formData.exec_female,
                            female_ration: this.formData.exec_ratio,
                            last_elec_date_exe_commitee: this.formatDate(this.formData.election_date),
                            president_name: this.formData.pres_name,
                            president_gender: this.formData.pres_gender,
                            president_mobile: this.formData.pres_mobile,
                            vp_name: this.formData.vp_name,
                            vp_gender: this.formData.vp_gender,
                            vp_mobile: this.formData.vp_mobile,
                            mem_rep_gp_name: this.formData.gp_name,
                            mem_rep_gp_gender: this.formData.gp_gender,
                            mem_rep_gp_mobile: this.formData.gp_mobile,
                            mem_sec_name: this.formData.sec_name,
                            mem_sec_gender: this.formData.sec_gender,
                            mem_sec_mobile: this.formData.sec_mobile,
                            jfmc_id: newJfmcId,
                            createdby: this.userid
                          };

                          this.coreservices.insertJfmcExecutiveCommitee(formDataExec).subscribe({
                            next: () => {
                              this.isLoading = false;
                              this.snackBar.open('JFMC Data Saved Successfully!', 'Close', { duration: 3000 });
                              this.closeForm();
                              this.loadJFMCData();
                            },
                            error: (err) => {
                              this.isLoading = false;
                              console.error("Executive Error:", err);
                              this.snackBar.open('Created JFMC but error saving Executive Committee', 'Close', { duration: 3000 });
                              this.closeForm();
                              this.loadJFMCData();
                            }
                          });

                        },
                        error: (err) => {
                          this.isLoading = false;
                          console.error("Household Error:", err);
                          this.snackBar.open('Error saving Household data', 'Close', { duration: 3000 });
                        }
                      });
                    },
                    error: (err) => {
                      this.isLoading = false;
                      console.error("Bank Error:", err);
                      this.snackBar.open('Error saving Bank data', 'Close', { duration: 3000 });
                    }
                  });
                },
                error: (err) => {
                  this.isLoading = false;
                  console.error("Microplan Error:", err);
                  this.snackBar.open('Error saving Microplan', 'Close', { duration: 3000 });
                }
              });
            },
            error: (err) => {
              this.isLoading = false;
              console.error("Geo Error:", err);
              this.snackBar.open('Error saving Geo data', 'Close', { duration: 3000 });
            }
          });
        },
        error: (err) => {
          this.isLoading = false;
          console.error("Master Error:", err);
          this.snackBar.open('Error saving Master data', 'Close', { duration: 3000 });
        }
      });

    } catch (error) {
      console.error("SAVE CRASH:", error);
      this.isLoading = false;
      this.snackBar.open('Application Error', 'Close', { duration: 5000 });
    }
  }

  // =========================================================
  // 5. HELPER FUNCTIONS (Navigation, Validation, Files)
  // =========================================================

 openNewForm() { 
  this.isFormOpen = true; 
  this.currentStep = 0; 
  this.formData = {}; 
  this.formData.formation_type_toggle = 'Year';  
  this.householdMembers = []; 
  this.addHHDynamicMembers = [{}]; 
}

  closeForm() { this.isFormOpen = false; }

  validateCurrentStep(): boolean {
    const currentFields = this.stepFields[this.currentStep];
    for (const field of currentFields) {

        if (this.isFieldDisabled(field.key)) {
      continue; 
    }
      
      if (field.type !== 'header' && field.type !== 'hh_table' && field.type !== 'file' && field.type !== 'composite_year_date') {
        const val = this.formData[field.key];
        
        if (val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0)) {
          return false; 
        }
      }

      if (field.type === 'composite_year_date') {
        if (this.formData.formation_type_toggle === 'Year') {
          if (!this.formData.formation_year_val) return false;
        } else {
          if (!this.formData.formation_date_val) return false;
        }
      }
      
    }
    return true;
  }

  nextStep() {
    console.log(" BUTTON CLICKED. Current Step is:", this.currentStep);

    let isValid = this.validateCurrentStep();
    console.log(" Is the current step valid?", isValid);

    if (!isValid) {
      console.warn(" STOPPING: Validation failed. A required field is missing on this step.");
      this.snackBar.open('Please fill all fields.', 'Close', { duration: 3000 });
      return; 
    }

    if (this.currentStep === 1) { 
      if (Array.isArray(this.formData.village_name)) {
        this.formData.hh_village = this.formData.village_name.join(', ');
      } else {
        this.formData.hh_village = this.formData.village_name || '';
      }
    }

    if (this.currentStep < this.wizardSteps.length - 1) {
      this.currentStep++;
      console.log(" MOVED TO NEXT STEP. New Step is:", this.currentStep);
    } else {
      console.log("FINAL STEP REACHED. Calling save() now...");
      this.save(); 
    }
  }

  prevStep() { if (this.currentStep > 0) this.currentStep--; }
  onFileChange(event: any, key: string) { this.formData[key] = event.target.files[0]; }

  onlyNumber(event: any) {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  onlyAlphabet(event: any) {
    const charCode = (event.which) ? event.which : event.keyCode;
    if ((charCode >= 65 && charCode <= 90) || 
        (charCode >= 97 && charCode <= 122) || 
        charCode === 32) {
      return true;
    }
    return false;
  }

  // =========================================================
  // 6. SUB-MODAL LOGIC (Microplan, HH, Exec Updates)
  // =========================================================

  // --- Household Modal ---
openAddHHModal() {
  this.isAddHHModalOpen = true;
  const data = this.selectedJfmcDetails || {};
  this.addHHData = {
    village: data.no_hh_village || '',
    sc_count: data.sc_count,
    st_count: data.st_count,
    other_count: data.other_count,
    bpl_count: data.bpl_count,
    women_headed: data.women_headed,
    total_hh: this.householdMembers.length > 0 ? this.householdMembers.length : data.total_hh || 0
  };
}
  closeAddHHModal() { this.isAddHHModalOpen = false; }

addModalHHRow() {
  // Get total household count correctly
  const maxLimit =
    Number(this.addHHData.total_hh) ||
    Number(this.selectedJfmcDetails.total_hh) ||
    0;

  if (maxLimit === 0) {
    this.snackBar.open(
      "Please enter the total number of households first.",
      "Close",
      { duration: 3000 }
    );
    return;
  }

  // Allow only up to maxLimit rows
  if (this.addHHDynamicMembers.length >= maxLimit) {
    this.snackBar.open(
      `You cannot add more than ${maxLimit} members.`,
      "Close",
      { duration: 3000 }
    );
    return;
  }

  this.addHHDynamicMembers.push({});
}

  removeModalHHRow() {
    if (this.addHHDynamicMembers.length > 1) this.addHHDynamicMembers.pop();
  }

 updateExistingHousehold() {
    const payload = {
      "jfmc_id": this.selectedJfmcDetails.jfmc_id,
      "hhE_id": this.selectedHouseholdId, 
      "no_hh_village": this.selectedJfmcDetails.total_hh || 0,
      "no_sc": this.selectedJfmcDetails.sc_count || 0,
      "no_st": this.selectedJfmcDetails.st_count || 0,
      "no_other": this.selectedJfmcDetails.other_count || 0,
      "no_bpl": this.selectedJfmcDetails.bpl_count || 0,
      "no_women_headed_hh": this.selectedJfmcDetails.women_headed || 0,
      "no_hh_general_body": this.selectedJfmcDetails.total_hh || 0,
      "st_percentage": this.selectedJfmcDetails.st_percent || 0,
      "createdby": this.userid,
      "hhMemberDetails": this.householdMembers // Uses the array mapped in showJFMCDetails
    };

    // Assuming you have an Update method in your service
    this.coreservices.updateHHandMemberDetails(payload).subscribe({
      next: (res: any) => {
        this.snackBar.open('Household Updated Successfully!', 'Close', { duration: 3000 });
        this.loadJFMCData(); // Refresh Grid
      },
      error: (err) => console.error("HH Update Error:", err)
    });
  }

deleteHHMember(memberId: any, index: number) {
    if (confirm("Confirm for delete record!!")) {
      
      // Keep your local delete logic
      if (String(memberId).startsWith('TEMP_')) {
        this.householdMembers.splice(index, 1);
        this.snackBar.open('Member deleted locally!', 'Close', { duration: 2000 });
        this.cdr.detectChanges();
        return;
      }

      const jfmc_id = this.selectedJfmcDetails.jfmc_id;

      this.coreservices.DeletehhMemberJfmc(memberId, jfmc_id).subscribe({
        next: (res: any) => {
          this.snackBar.open('Household member deleted successfully!', 'Close', { duration: 3000 });
          this.householdMembers.splice(index, 1);
          this.cdr.detectChanges(); 
        },
        error: (err: any) => {
          // FIX: Angular sees Status 200 but fails to parse the plain-text response,
          // so it triggers this error block. We check if status is 200 (Success).
          if (err.status === 200) {
            this.snackBar.open('Household member deleted successfully!', 'Close', { duration: 3000 });
            this.householdMembers.splice(index, 1);
            this.cdr.detectChanges();
          } else {
            console.error("Delete HH Member Error:", err);
            this.snackBar.open('Error!! Failed to delete member.', 'Close', { duration: 3000 });
          }
        }
      });

    } else {
      this.snackBar.open('Why did you press cancel? You should have confirmed', 'Close', { duration: 3000 });
    }
}


submitAddHHModal() {
    if (!this.selectedJfmcDetails || !this.selectedJfmcDetails.jfmc_id) return;

    this.isLoading = true;

    let totalHH = Number(this.addHHData.total_hh) || 0;
    let stCount = Number(this.addHHData.st_count) || 0;
    let st_percentage = totalHH > 0 ? ((stCount / totalHH) * 100).toFixed(2) : '0';

    let formattedMembers = this.addHHDynamicMembers
        .filter(m => m.name && m.name.trim() !== "")
        .map(m => ({
            "member_name": m.name,         // Matches DB column
            "gender": m.gender || '',
            "social_category": m.category || '',
            "is_bpl": m.bpl || 'No',
            "is_women_headed": m.womenHeaded || 'No',
            "is_landless": m.landless || 'No'
        }));

    const formData = {
        "jfmc_id": this.selectedJfmcDetails.jfmc_id,
        "no_hh_village": totalHH,
        "no_sc": Number(this.addHHData.sc_count || 0),
        "no_st": stCount,
        "no_other": Number(this.addHHData.other_count || 0),
        "no_bpl": Number(this.addHHData.bpl_count || 0),
        "no_women_headed_hh": Number(this.addHHData.women_headed || 0),
        "no_hh_general_body": totalHH,
        "st_percentage": st_percentage,
        "createdby": this.userid,
        "hhMemberDetails": formattedMembers
    };

    this.coreservices.inserthouseholddetailsstatus(formData).subscribe({
        next: () => {
            this.snackBar.open('Saved!', 'Close', { duration: 3000 });
            this.showJFMCDetails(this.selectedJfmcDetails); // Refreshes UI with correct data
            this.closeAddHHModal();
            this.isLoading = false;
        },
        error: (err) => {
            this.isLoading = false;
            console.error("Save Error:", err);
        }
    });
}
 

  // --- Executive Committee Update ---
  saveExecutiveCommittee() {
    const payload = {
      male: this.formData.no_male,
      female: this.formData.no_female,
      female_ration: this.formData.female_ration,
      last_elec_date_exe_commitee: this.formatDate(this.formData.last_elec_date),
      president_name: this.formData.president_name,
      president_gender: this.formData.president_gender,
      president_mobile: this.formData.president_mobile,
      vp_name: this.formData.vp_name,
      vp_gender: this.formData.vp_gender,
      vp_mobile: this.formData.vp_mobile,
      mem_rep_gp_name: this.formData.mem_rep_gp_name,
      mem_rep_gp_gender: this.formData.mem_rep_gp_gender,
      mem_rep_gp_mobile: this.formData.mem_rep_gp_mobile,
      mem_sec_name: this.formData.mem_sec_name,
      mem_sec_gender: this.formData.mem_sec_gender,
      mem_sec_mobile: this.formData.mem_sec_mobile,
      jfmc_id: this.selectedJfmcDetails.jfmc_id,
      createdby: this.userid
    };

    this.coreservices.insertJfmcExecutiveCommitee(payload).subscribe({
      next: (res: any) => {
        this.snackBar.open('Executive Committee Saved!', 'Close', { duration: 3000 });
        this.loadJFMCData(); 
      },
      error: (err) => console.error(err)
    });
  }

 deleteExecMembers() {
    if(confirm("Confirm for delete record!!")) {
        const jfmcId = this.selectedJfmcDetails.jfmc_id;
        
        this.coreservices.DeleteMemberDetails(jfmcId).subscribe({
          next: (res: any) => {
            this.snackBar.open('Executive Committee deleted successfully!', 'Close', { duration: 3000 });
            
            // Clear out the view data locally so the UI updates immediately
            this.selectedJfmcDetails.exec_election_date = null;
            this.selectedJfmcDetails.exec_male = 0;
            this.selectedJfmcDetails.exec_female = 0;
            this.executiveHistory = []; // Clear the history table
            
            this.cdr.detectChanges(); // Force UI update
            this.loadJFMCData(); // Refresh main grid
          },
          error: (err: any) => {
            this.snackBar.open('Error deleting Executive Committee.', 'Close', { duration: 3000 });
            console.error("Delete Exec Error:", err);
          }
        });
    }
  }

  openUpdateExecModal() {
    this.isUpdateExecModalOpen = true;
    this.updateExecData = { ...this.selectedJfmcDetails };
  }
  closeUpdateExecModal() { this.isUpdateExecModalOpen = false; }
  
 submitUpdateExecModal() {
    this.isLoading = true;
    
    // Format payload exactly like your working jQuery code
    const payload = {
      jfmc_id: this.selectedJfmcDetails.jfmc_id,
      male: this.updateExecData.exec_male,
      female: this.updateExecData.exec_female,
      female_ration: this.updateExecData.exec_ratio,
      last_elec_date_exe_commitee: this.formatDate(this.updateExecData.exec_election_date),
      president_name: this.updateExecData.president_name,
      president_gender: this.updateExecData.president_gender,
      president_mobile: this.updateExecData.president_mobile,
      vp_name: this.updateExecData.vp_name,
      vp_gender: this.updateExecData.vp_gender,
      vp_mobile: this.updateExecData.vp_mobile,
      mem_rep_gp_name: this.updateExecData.gp_name,
      mem_rep_gp_gender: this.updateExecData.gp_gender,
      mem_rep_gp_mobile: this.updateExecData.gp_mobile,
      mem_sec_name: this.updateExecData.secretary_name,
      mem_sec_gender: this.updateExecData.secretary_gender,
      mem_sec_mobile: this.updateExecData.secretary_mobile,
      createdby: this.userid
    };

    // Insert new history / update exec
    this.coreservices.insertJfmcExecutiveCommitee(payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.snackBar.open('Executive Committee updated successfully!', 'Close', { duration: 3000 });
        
        // Update local view so you don't have to refresh the whole page
        this.selectedJfmcDetails = { ...this.selectedJfmcDetails, ...this.updateExecData };
        this.closeUpdateExecModal();
        this.showJFMCDetails(this.selectedJfmcDetails); // Re-fetch to update history table
      },
      error: (err) => {
        this.isLoading = false;
        console.error(err);
        this.snackBar.open('Failed to update Executive Committee.', 'Close', { duration: 3000 });
      }
    });
  }
  // --- Microplan Edit ---
  downloadMicroplan() {
    const filename = this.selectedJfmcDetails?.microplan_doc_filename;
    if (filename) {
        this.snackBar.open('Downloading: ' + filename, 'Close', { duration: 3000 });
    }
  }

  openEditMicroplan() {
    this.isEditMicroplanOpen = true;
    const formatDateForInput = (dateStr: string) => {
        return dateStr ? new Date(dateStr).toISOString().split('T')[0] : '';
    };
   this.editMpData = {
        mp_id: this.selectedJfmcDetails?.mp_id || 0,
        is_microplan_prepared: this.selectedJfmcDetails?.is_microplan_prepared || 'No',
        mp_prep_date: formatDateForInput(this.selectedJfmcDetails?.mp_prep_date),
        is_mp_approved: this.selectedJfmcDetails?.is_mp_approved || 'No',
        mp_approval_date: formatDateForInput(this.selectedJfmcDetails?.mp_approval_date),
        is_mp_revised: this.selectedJfmcDetails?.is_mp_revised || 'No',
        has_apo: this.selectedJfmcDetails?.has_apo || 'No',
        file: null
    };
  }
  closeEditMicroplan() { this.isEditMicroplanOpen = false; }
  
  onEditFileChange(event: any) {
    if (event.target.files.length > 0) this.editMpData.file = event.target.files[0];
  }
  
saveEditMicroplan() {
    this.isLoading = true;

    // Build the request object matching your backend requirements
    const payload = {
      id: this.editMpData.mp_id,
      jfmc_id: this.selectedJfmcDetails.jfmc_id,
      userId: this.userid,
      is_microplanPrepared: this.editMpData.is_microplan_prepared,
      date_of_preparation: this.formatDate(this.editMpData.mp_prep_date),
      is_microplanApprovedDfo: this.editMpData.is_mp_approved,
      date_of_approval: this.formatDate(this.editMpData.mp_approval_date),
      is_microplan_revised: this.editMpData.is_microplan_revised,
      is_comm_having_apo: this.editMpData.has_apo,
      microplan_doc_filename: this.editMpData.file ? this.editMpData.file.name : (this.selectedJfmcDetails.microplan_doc_filename || '')
    };

    // If your backend accepts multipart/form-data for updates containing files:
    // const formData = new FormData();
    // if (this.editMpData.file) formData.append('file', this.editMpData.file);
    // formData.append('data', JSON.stringify(payload));

    this.coreservices.updatejfmcmicroplanstatus(payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.snackBar.open('Microplan Updated Successfully!', 'Close', { duration: 3000 });
        
        // Sync local view model changes cleanly back into the main active selection instance
        this.selectedJfmcDetails.is_microplan_prepared = this.editMpData.is_microplan_prepared;
        this.selectedJfmcDetails.mp_prep_date = this.editMpData.mp_prep_date;
        this.selectedJfmcDetails.is_mp_approved = this.editMpData.is_mp_approved;
        this.selectedJfmcDetails.mp_approval_date = this.editMpData.mp_approval_date;
        this.selectedJfmcDetails.is_mp_revised = this.editMpData.is_mp_revised;
        this.selectedJfmcDetails.has_apo = this.editMpData.has_apo;
        if (this.editMpData.file) {
          this.selectedJfmcDetails.microplan_doc_filename = this.editMpData.file.name;
        }

        this.closeEditMicroplan();
        this.cdr.detectChanges();
        
        // Refresh master grid definitions
        this.loadJFMCData();
      },
      error: (err) => {
        this.isLoading = false;
        console.error("Microplan Update Error:", err);
        this.snackBar.open('Failed to update Microplan Details.', 'Close', { duration: 3000 });
      }
    });
  }

  // --- Excel Download ---
  downloadHHExcel() {
    if (!this.householdMembers || this.householdMembers.length === 0) {
        this.snackBar.open('No data to export', 'Close', { duration: 2000 });
        return;
    }
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Sl.No,Name,Gender,Social Category,BPL,Landless,Women Headed\n";
    this.householdMembers.forEach(row => {
        let rowStr = `${row.sl},${row.name},${row.gender},${row.category},${row.bpl},${row.landless},${row.womenHeaded}`;
        csvContent += rowStr + "\n";
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "household_members.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}