import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from '../Modules/LoginPage/login.component';
import { DashboardComponent } from '../Modules/Header_sidenav/dashboard.component';
import { ProposedCapacityComponent } from '../Modules/Capacity development/proposed capacity development/proposed-capacity.component';
import { CapacityDashboardComponent } from '../Modules/Capacity development/capacity dashboard/capacitydashboard.component';
import { MapComponent } from '../Modules/map/map.component';
import { ApprovedCapacityComponent } from '../Modules/Capacity development/Approved capacity development/approved-capacity.component';
import { viewtrainingfeedback } from '../Modules/Capacity development/View Training and feedback/viewtrainingfeedback.component';
import { DepartmentComponent } from '../Modules/Capacity development/Training/Department/department.component';
import { TrainingFeedbackComponent } from '../Modules/Capacity development/Approved capacity development/training-feedback.component';
import { CommunityComponent } from '../Modules/Capacity development/Training/Community/community.component';
import { StallsComponent } from '../Modules/Capacity development/Market & Outreach/Stalls/stalls.component';

// JFMC AND EDC MODULE IMPORTS
import { JfmcDashboardComponent } from '../Modules/JFMC and EDC/jfmc-dashboard/jfmc-dashboard.component';
import { JFMCSelectionComponent } from '../Modules/JFMC and EDC/Planning/jfmc-selection/jfmc-selection.component'; // Added /Planning/
import { MicroPlanningComponent } from '../Modules/JFMC and EDC/Planning/micro-planning/micro-planning.component'; // Added /Planning/
import { JFMCDataEntryComponent } from '../Modules/JFMC and EDC/jfmc-data-entry/jfmc-data-entry.component';

import { ChecklistJfmcBookComponent } from '../Modules/JFMC and EDC/check-list-of-jfmc-bookrecord/check-list-of-jfmc-bookrecord.component';


// OTHER MODULES
import { SHGDashboardComponent } from '../Modules/SHG and JLG/shg-dashboard/shg-dashboard.component';
import { FMDashboardComponent } from '../Modules/Forest Management/fm-dashboard/fm-dashboard.component';
import { LivelihoodDashboardComponent } from '../Modules/Livelihood/livelihood-dashboard/livelihood-dashboard.component';
import { NTFPDashboardComponent } from '../Modules/NTFP(NCE)/ntfp-dashboard/ntfp-dashboard.component';
import { PmDashboardComponent } from '../Modules/Project Management/pm-dashboard/pm-dashboard.component';
import { HomeComponent } from '../Modules/home/home.component';
import { EcoDevDashboardComponent } from '../Modules/Forest Management/eco-development/eco-dev-dashboard/eco-dev-dashboard.component';
import { CAMDashboardComponent } from '../Modules/Catchment Area Management/cam-dashboard/cam-dashboard.component';
import { ShgDataEntryComponent } from '../Modules/SHG and JLG/SHG and JLG Data Entry/shg-dataentry.component';

import { panchasutraComponent } from '../Modules/SHG and JLG/Panchasutra/panchasutra.component';

import { BusinessPlanComponent } from '../Modules/SHG and JLG/BusinessPlan/Businessplan.component';
import { creditlinkageComponent } from '../Modules/SHG and JLG/Credit Linkage/creditlinkage.component';
import { LoanRecoveryComponent } from '../Modules/SHG and JLG/Loan Recovery/loanrecovery.component';




import { presurveyComponent } from '../Modules/Forest Management/Plantation/Presurvey/Presurvey.component';
import { sitemasterComponent } from '../Modules/Forest Management/Plantation/SiteMaster/sitemaster.component';
import { advanceworkComponent } from '../Modules/Forest Management/Plantation/Advance Work/advancework.component';
import { plantationComponent } from '../Modules/Forest Management/Plantation/Plantation/plantation.component';
import { resurveyComponent } from '../Modules/Forest Management/Plantation/Resurvey/resurvey.component';
import { maintenceComponent } from '../Modules/Forest Management/Plantation/Maintence/maintence.component';

import { ecodevelopmentpresurveyComponent } from '../Modules/Forest Management/eco-development/Eco presurvey/ecodevelopmentpresurvey.component';

import { NurseryComponent } from '../Modules/Forest Management/Nursery/Nursery/Nursery Details/Nurserydetails.component';
import { ecodevelopmentsitemasterComponent } from '../Modules/Forest Management/eco-development/Site Master/Sitemaster.component';
import { ecodevelopmentAdvanceworkComponent } from '../Modules/Forest Management/eco-development/AdvanceWork/Advancework.component';
import { ecoplantationComponent } from '../Modules/Forest Management/eco-development/plantation/plantation.component';

import { infrastructureComponent } from '../Modules/Forest Management/Nursery/Nursery/Infrastructure/infrastructure.component';
import { infrastructureCostComponent } from '../Modules/Forest Management/Nursery/Nursery/Infrastructure cost/infrastructurecost.component';
import { seedingandsaplingComponent } from '../Modules/Forest Management/Nursery/Nursery/Seeding and Sapling/seedingandsapling.component';
import { stockpositionComponent } from '../Modules/Forest Management/Nursery/Nursery/StockPosition/stockposition.component';

import { WeatherDataComponent } from '../Modules/Catchment Area Management/Water table and Rainfall Data/weather-data/weather-data.component';
import { TubeWellsComponent } from '../Modules/Catchment Area Management/Water table and Rainfall Data/tube-wells/tube-wells.component';
import { TreatmentAreaComponent } from '../Modules/Catchment Area Management/Water table and Rainfall Data/treatment-area/treatment-area.component';
import { SmcSiteSuitabilityComponent } from '../Modules/Catchment Area Management/Water Shed Management/smc-site-suitability/smc-site-suitability.component';
import { AssetUpdationComponent } from '../Modules/Catchment Area Management/SMC/asset-updation/asset-updation.component';
import { ImplementationComponent } from '../Modules/Catchment Area Management/SMC/implementation/implementation.component';
import { TechnicalDetailsComponent } from '../Modules/Catchment Area Management/SMC/technical-details/technical-details.component';
import { CatchmentBasicDetailsComponent } from '../Modules/Catchment Area Management/SMC/basic-details/catchmentbasic-details.component';
import { catchementPlanningComponent } from '../Modules/Catchment Area Management/SMC/planning/catchementplanning.component';
import { ecoresurveyComponent } from '../Modules/Forest Management/eco-development/Resurvey/ecoresurvey.component';


import { ecomaintenenceComponent } from '../Modules/Forest Management/eco-development/Maintenence/maintenence.component';
import { smcbasicdetailsComponent } from '../Modules/Forest Management/SMC/Basic Details/Basic Details/basicdetails.component';
import { smctechniacaldetailsComponent } from '../Modules/Forest Management/SMC/Basic Details/Technical Implentation/smctechniacaldetails.component';
import { smcImplementationdetailsComponent } from '../Modules/Forest Management/SMC/Basic Details/Implementation/Implementation.component';
import { smcMontoringComponent } from '../Modules/Forest Management/SMC/Basic Details/Montoring/Montoring.component';
import { smcAssetUpdationComponent } from '../Modules/Forest Management/SMC/Basic Details/Asset Updation/AssetUpdation.component';
import { protectionCreationComponent } from '../Modules/Forest Management/protection/Creation/creation.component';
import { protectionMontroingComponent } from '../Modules/Forest Management/protection/Montoring/Montroing.component';
import { protectionliveimmunizationComponent } from '../Modules/Forest Management/protection/Live Immunization/Live Immunization.component';

import { AdminmanagmentComponent } from '../Modules/Admin Module/User Management/usermangement.component';

import { CatchmentmonitoringComponent } from '../Modules/Catchment Area Management/SMC/monitoring/catchmentmonitoring/catchmentmonitoring.component';
import { MeetingComponent } from '../Modules/JFMC and EDC/meeting/meeting.component';
import { MonitoringComponent } from '../Modules/JFMC and EDC/monitoring/Monitoring.Component';
import { SurveyComponent } from '../Modules/Livelihood/Agro Forestry/survey/survey.component';
import { FieldDetailsComponent } from '../Modules/Livelihood/Agro Forestry/field-details/field-details.component';
import { PlantationCreationComponent } from '../Modules/Livelihood/Agro Forestry/plantation-creation/plantation-creation.component';
import { ProductionComponent } from '../Modules/Livelihood/Agro Forestry/production/production.component';
import { MaintenanceComponent } from '../Modules/Livelihood/Agro Forestry/maintenance/maintenance.component';
import { ResurveyComponent } from '../Modules/Livelihood/Agro Forestry/resurvey/resurvey.component';
import { EcoTourismSiteselectionComponent } from '../Modules/Livelihood/Eco_tourism/eco-tourism-siteselection/eco-tourism-siteselection.component';
import { HomestaySiteselectionComponent } from '../Modules/Livelihood/Eco_tourism/homestay-siteselection/homestay-siteselection.component';
import { FacilitiesComponent } from '../Modules/Livelihood/Eco_tourism/facilities/facilities.component';
import { CreationComponent } from '../Modules/Livelihood/Eco_tourism/creation/creation.component';
import { InstitutionalFrameworkComponent } from '../Modules/Livelihood/Eco_tourism/institutional-framework/institutional-framework.component';
import { LivelihoodMarketOutreachComponent } from '../Modules/Livelihood/Eco_tourism/livelihood-market-outreach/livelihood-market-outreach.component';
import { LivelihoodMonitoringComponent } from '../Modules/Livelihood/Eco_tourism/livelihood-monitoring/livelihood-monitoring.component';
import { FisheriesPlanningComponent } from '../Modules/Livelihood/Fisheries/fisheries-planning/fisheries-planning.component';
import { CheckDamdetailsComponent } from '../Modules/Livelihood/Fisheries/check-damdetails/check-damdetails.component';
import { SpeciesdetailsComponent } from '../Modules/Livelihood/Fisheries/speciesdetails/speciesdetails.component';
import { TargetDetailsComponent } from '../Modules/Livelihood/Fisheries/target-details/target-details.component';
import { ProductionDetailsComponent } from '../Modules/Livelihood/Fisheries/production-details/production-details.component';
import { LivestockPlanningComponent } from '../Modules/Livelihood/Livestock/livestock-planning/livestock-planning.component';
import { LivestockComponent } from '../Modules/Livelihood/Livestock/livestock/livestock.component';
import { StockPositionComponent } from '../Modules/Livelihood/Livestock/stock-position/stock-position.component';
import { LivestockMonitoringComponent } from '../Modules/Livelihood/Livestock/livestock-monitoring/livestock-monitoring.component';
import { NtfpPlanningComponent } from '../Modules/Livelihood/NTFP Based/ntfp-planning/ntfp-planning.component';
import { HarvastingComponent } from '../Modules/Livelihood/NTFP Based/harvasting/harvasting.component';
import { NtfpCreationComponent } from '../Modules/Livelihood/NTFP Based/ntfp-creation/ntfp-creation.component';
import { NtfpProductionComponent } from '../Modules/Livelihood/NTFP Based/ntfp-production/ntfp-production.component';
import { CreationCCFCCenterComponent } from '../Modules/NTFP(NCE)/creation-ccfc-center/creation-ccfc-center.component';
import { CreationCraftMoreoutletsComponent } from '../Modules/NTFP(NCE)/creation-craft-moreoutlets/creation-craft-moreoutlets.component';
import { ProcessingQualitycontrolComponent } from '../Modules/NTFP(NCE)/Collection_ProcessingCenter/processing-qualitycontrol/processing-qualitycontrol.component';
import { ResourceHarvestingComponent } from '../Modules/NTFP(NCE)/Resource_Assesment&Inventory/resource-harvesting/resource-harvesting.component';
import { ResourceGenerationGrowthComponent } from '../Modules/NTFP(NCE)/Resource_Assesment&Inventory/resource-generation-growth/resource-generation-growth.component';
import { CraftMoreOutletsMonitorComponent } from '../Modules/NTFP(NCE)/craft-more-outlets-monitor/craft-more-outlets-monitor.component';
import { ExibitionFairComponent } from '../Modules/NTFP(NCE)/exibition-fair/exibition-fair.component';
import { DetailsNTFPCollectionComponent } from '../Modules/NTFP(NCE)/Collection_ProcessingCenter/details-ntfp-collection/details-ntfp-collection.component';
import { NTFPMarketingStallsComponent } from '../Modules/NTFP(NCE)/Collection_ProcessingCenter/ntfp-marketing-stalls/ntfp-marketing-stalls.component';
import { NTFPSurveyComponent } from '../Modules/NTFP(NCE)/Resource_Assesment&Inventory/ntfp-survey/ntfp-survey.component';
import { AssetCreationComponent } from '../Modules/Project Management/asset-creation/asset-creation.component';
import { AssetMaintenenceComponent } from '../Modules/Project Management/asset-maintenence/asset-maintenence.component';
import { AttendenceReportComponent } from '../Modules/Project Management/attendence-report/attendence-report.component';
import { AuditComponent } from '../Modules/Project Management/audit/audit.component';
import { APOComponent } from '../Modules/Project Management/apo/apo.component';
import { ImpactAssessmentComponent } from '../Modules/impact-assessment/impact-assessment.component';
import { DataDumpComponent } from '../Modules/Catchment Area Management/data-dump/data-dump.component';
import { MonitoringDashboardComponent } from '../Modules/monitoring-dashboard/monitoring-dashboard.component'; 
import { MaindashboardComponent } from '../Modules/maindashboard/maindashboard.component';
import { RoleAccessComponent } from '../Modules/Security Role/role-access.component';






const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: DashboardComponent,
    children: [
      { path: '', redirectTo: 'capacity/Approvedfeedback', pathMatch: 'full' },
      {path:'maindashboard', component:MaindashboardComponent},
      { path: 'home', component: HomeComponent },
      { path: 'map', component: MapComponent },
      { path: 'usermanagement', component:AdminmanagmentComponent},
      { path: 'role-access', component: RoleAccessComponent },
      { path: 'data-dump', component:DataDumpComponent},
      { path: 'monitoring-dashboard', component:MonitoringDashboardComponent},
      // Capacity Development
      { path: 'capacity/dashboard', component: CapacityDashboardComponent },
      { path: 'capacity/proposed', component: ProposedCapacityComponent },
      { path: 'capacity/approved', component: ApprovedCapacityComponent },
      { path: 'capacity/Approvedfeedback', component: TrainingFeedbackComponent,data: { skipAuth: true } },
      { path: 'capacity/viewtraingFeedback', component: viewtrainingfeedback },
      { path: 'capacity/training/department', component: DepartmentComponent },
      { path: 'capacity/training/community', component: CommunityComponent },
      { path: 'capacity/market/stalls', component: StallsComponent },
      {path:'Impactassessment',component:ImpactAssessmentComponent},

      // JFMC and EDC routes
      { path: 'jfmc/dashboard', component: JfmcDashboardComponent },
      { path: 'jfmc/planning/selection', component: JFMCSelectionComponent },
      { path: 'jfmc/planning/micro-planning', component: MicroPlanningComponent },
      { path: 'jfmc/data-entry', component: JFMCDataEntryComponent },
      { path: 'jfmc/meeting', component: MeetingComponent },
      { path: 'jfmc/book-record', component: ChecklistJfmcBookComponent },
      { path: 'jfmc/monitoring', component: MonitoringComponent },

      // Other Dashboards
      { path: 'shg/dashboard', component: SHGDashboardComponent },
      { path: "shg/shg-dataEntry", component: ShgDataEntryComponent },
      { path: "shg/panchasutra", component: panchasutraComponent },
      { path: "shg/panchasutra", component: panchasutraComponent },
      { path: "shg/Businessplan", component: BusinessPlanComponent },
      { path: "shg/Creditlinkage", component: creditlinkageComponent },
      { path: "shg/LoanRecovery", component: LoanRecoveryComponent },


      { path: "forest-management/nurserydetails", component: NurseryComponent },
      { path: "forest-management/infrastructure", component: infrastructureComponent },
      { path: "forest-management/infrastructurecost", component: infrastructureCostComponent },
      { path: "forest-management/seedingandsapling", component: seedingandsaplingComponent },
      { path: "forest-management/stockposition", component: stockpositionComponent },
      { path: "forest-management/presurvey", component: presurveyComponent },
      { path: "forest-management/sitemaster", component: sitemasterComponent },
      { path: "forest-management/advancework", component: advanceworkComponent },
      { path: "forest-management/plantation", component: plantationComponent },
      { path: "forest-management/resurvey", component: resurveyComponent },
      { path: "forest-management/maintence", component: maintenceComponent },
      { path: "forest-management/smcbasicdetails", component: smcbasicdetailsComponent },
      { path: "forest-management/smctechnicaldetails", component: smctechniacaldetailsComponent },
      { path: "forest-management/smcMontoring", component: smcMontoringComponent },
      { path: "forest-management/smcAssetUpdation", component: smcAssetUpdationComponent },
       { path: "forest-management/smcImplementationdetails", component: smcImplementationdetailsComponent },
      
      { path: "forest-management/protectionCreation", component: protectionCreationComponent },
      {path: "forest-management/protectionMontroing", component: protectionMontroingComponent},
      {path: "forest-management/protectionLiveImunization", component:protectionliveimmunizationComponent
},

      { path: "forest-management/ecodevelopmentpresurvey", component: ecodevelopmentpresurveyComponent },
      { path: "forest-management/ecodevelopmentsitemaster", component: ecodevelopmentsitemasterComponent },
      { path: "forest-management/ecodevelopmentAdvanceworkComponent", component: ecodevelopmentAdvanceworkComponent },
      { path: "forest-management/ecoplantationComponent", component: ecoplantationComponent },
      { path: "forest-management/ecoresurveyComponent", component: ecoresurveyComponent },
      { path: "forest-management/ecomaintenenceComponent", component: ecomaintenenceComponent },
      { path: 'forest-management/dashboard', component: FMDashboardComponent },
      { path: 'forest-management/eco-development/dashboard', component: EcoDevDashboardComponent },
     
     
      { path: 'catchment-dashboard', component: CAMDashboardComponent },
      // SMC Sub-menu
      { path: 'catchment/smc/planning', component: catchementPlanningComponent },
      { path: 'catchment/smc/technical-details', component: TechnicalDetailsComponent },
      { path: 'catchment/smc/implementation', component: ImplementationComponent },
      { path: 'catchment/smc/asset-updation', component: AssetUpdationComponent },
      { path: 'catchment/smc/catchmentbasicdetails', component: CatchmentBasicDetailsComponent },
     { path: 'catchment/smc/catchmentmonitoring', component: CatchmentmonitoringComponent },
      // Water Shed Management Sub-menu
      { path: 'catchment/watershed/site-suitability', component: SmcSiteSuitabilityComponent },
      // Water Table and Rainfall Data Sub-menu
      { path: 'catchment/watertable/treatment-area', component: TreatmentAreaComponent },
      { path: 'catchment/watertable/tube-wells', component: TubeWellsComponent },
      { path: 'catchment/watertable/weather-data', component: WeatherDataComponent },

      
      { path: 'livelihood/dashboard', component: LivelihoodDashboardComponent },

{ path: 'livelihood/agro/survey', component: SurveyComponent },
{ path: 'livelihood/agro/field-details', component: FieldDetailsComponent },
{ path: 'livelihood/agro/plantation-creation', component: PlantationCreationComponent },
{ path: 'livelihood/agro/production', component: ProductionComponent },
{ path: 'livelihood/agro/maintenance', component: MaintenanceComponent },
{ path: 'livelihood/agro/resurvey', component: ResurveyComponent },

{ path: 'livelihood/eco/site-selection', component: EcoTourismSiteselectionComponent },
{ path: 'livelihood/eco/homestay', component: HomestaySiteselectionComponent },
{ path: 'livelihood/eco/facilities', component: FacilitiesComponent },
{ path: 'livelihood/eco/creation', component: CreationComponent },
{ path: 'livelihood/eco/institution', component: InstitutionalFrameworkComponent },
{ path: 'livelihood/eco/market', component: LivelihoodMarketOutreachComponent },
{ path: 'livelihood/eco/monitoring', component: LivelihoodMonitoringComponent },

{ path: 'livelihood/fisheries/planning', component: FisheriesPlanningComponent },
{ path: 'livelihood/fisheries/checkdam', component: CheckDamdetailsComponent },
{ path: 'livelihood/fisheries/species', component: SpeciesdetailsComponent },
{ path: 'livelihood/fisheries/target', component: TargetDetailsComponent },
{ path: 'livelihood/fisheries/production', component: ProductionDetailsComponent },

{ path: 'livelihood/livestock/planning', component: LivestockPlanningComponent },
{ path: 'livelihood/livestock/main', component: LivestockComponent },
{ path: 'livelihood/livestock/stock', component: StockPositionComponent },
{ path: 'livelihood/livestock/monitoring', component: LivestockMonitoringComponent },

{ path: 'livelihood/ntfp/planning', component: NtfpPlanningComponent },
{ path: 'livelihood/ntfp/creation', component: NtfpCreationComponent },
{ path: 'livelihood/ntfp/harvesting', component: HarvastingComponent },
{ path: 'livelihood/ntfp/production', component: NtfpProductionComponent },


// NTFP(NCE) routes
{ path: 'ntfp/dashboard', component: NTFPDashboardComponent },
{ path: 'ntfp/ccfc-center', component: CreationCCFCCenterComponent },
{ path: 'ntfp/craft-outlets', component: CreationCraftMoreoutletsComponent },

// Collection / Processing sub-routes
{ path: 'ntfp/collection/details', component: DetailsNTFPCollectionComponent },
{ path: 'ntfp/collection/processing', component: ProcessingQualitycontrolComponent },
{ path: 'ntfp/collection/stalls', component: NTFPMarketingStallsComponent },

// Resource Assessment sub-routes
{ path: 'ntfp/resource/survey', component: NTFPSurveyComponent },
{ path: 'ntfp/resource/harvesting', component: ResourceHarvestingComponent },
{ path: 'ntfp/resource/growth', component: ResourceGenerationGrowthComponent },

{ path: 'ntfp/outlets-monitor', component: CraftMoreOutletsMonitorComponent },
{ path: 'ntfp/exhibition-fair', component: ExibitionFairComponent },

     // Project Management Routes
{ path: 'project-management/dashboard', component: PmDashboardComponent },
{ path: 'project-management/asset-creation', component: AssetCreationComponent },
{ path: 'project-management/asset-maintenance', component: AssetMaintenenceComponent },
{ path: 'project-management/attendance-report', component: AttendenceReportComponent },
{ path: 'project-management/audit', component: AuditComponent },
{ path: 'project-management/apo', component: APOComponent },
    ]
  },
  { path: '**', redirectTo: '' }
];
// RouterModule.forRoot(routes, { useHash: true })
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
