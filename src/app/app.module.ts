import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from '../Modules/LoginPage/login.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { DashboardComponent } from '../Modules/Header_sidenav/dashboard.component';
import { CustomGridComponent } from '../shared/Grids/custom-grid.component';
import { CustomDropdownComponent } from '../shared/dropdowns/custom-dropdown.component';
import { CapacityDashboardComponent } from '../Modules/Capacity development/capacity dashboard/capacitydashboard.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MapComponent } from '../Modules/map/map.component';
import { ApprovedCapacityComponent } from '../Modules/Capacity development/Approved capacity development/approved-capacity.component';
import { TrainingFeedbackComponent } from '../Modules/Capacity development/Approved capacity development/training-feedback.component';
import { ProposedCapacityComponent } from '../Modules/Capacity development/proposed capacity development/proposed-capacity.component';
import { viewtrainingfeedback } from '../Modules/Capacity development/View Training and feedback/viewtrainingfeedback.component';
import { ViewDialogComponent } from '../shared/dialog-box/view-dialog.component';
import { DepartmentComponent } from '../Modules/Capacity development/Training/Department/department.component'
import { CommunityComponent } from '../Modules/Capacity development/Training/Community/community.component';
import { ShgDataEntryComponent } from '../Modules/SHG and JLG/SHG and JLG Data Entry/shg-dataentry.component';
import { MatCheckboxModule } from '@angular/material/checkbox';



/* Material */
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { StallsComponent } from '../Modules/Capacity development/Market & Outreach/Stalls/stalls.component';
import { HomeComponent } from '../Modules/home/home.component';
import { JfmcDashboardComponent } from '../Modules/JFMC and EDC/jfmc-dashboard/jfmc-dashboard.component';
import { InspectionComponent } from '../Modules/inspection/inspection.component';
import { SHGDashboardComponent } from '../Modules/SHG and JLG/shg-dashboard/shg-dashboard.component';
import { FMDashboardComponent } from '../Modules/Forest Management/fm-dashboard/fm-dashboard.component';
import { LivelihoodDashboardComponent } from '../Modules/Livelihood/livelihood-dashboard/livelihood-dashboard.component';
import { CAMDashboardComponent } from '../Modules/Catchment Area Management/cam-dashboard/cam-dashboard.component';
import { NTFPDashboardComponent } from '../Modules/NTFP(NCE)/ntfp-dashboard/ntfp-dashboard.component';
import { PmDashboardComponent } from '../Modules/Project Management/pm-dashboard/pm-dashboard.component';
import { CustomDashboardComponent } from '../shared/custom-dashboard/custom-dashboard.component';
import { CommonChartComponent } from '../shared/common-chart/common-chart.component';
import { MapViewComponent } from '../shared/map-view/map-view.component';
import { EcoDevDashboardComponent } from '../Modules/Forest Management/eco-development/eco-dev-dashboard/eco-dev-dashboard.component';
import { JFMCSelectionComponent } from '../Modules/JFMC and EDC/Planning/jfmc-selection/jfmc-selection.component';
import { MicroPlanningComponent } from '../Modules/JFMC and EDC/Planning/micro-planning/micro-planning.component';
import { MatSnackBarModule } from '@angular/material/snack-bar'; // Required for the snackbar in your TS file
import { JFMCDataEntryComponent } from '../Modules/JFMC and EDC/jfmc-data-entry/jfmc-data-entry.component';

import { ChecklistJfmcBookComponent } from '../Modules/JFMC and EDC/check-list-of-jfmc-bookrecord/check-list-of-jfmc-bookrecord.component';

import { panchasutraComponent } from '../Modules/SHG and JLG/Panchasutra/panchasutra.component';
import { BusinessPlanComponent } from '../Modules/SHG and JLG/BusinessPlan/Businessplan.component';
import { creditlinkageComponent } from '../Modules/SHG and JLG/Credit Linkage/creditlinkage.component';
import { LoanRecoveryComponent } from '../Modules/SHG and JLG/Loan Recovery/loanrecovery.component';

import { infrastructureComponent } from '../Modules/Forest Management/Nursery/Nursery/Infrastructure/infrastructure.component';
import { infrastructureCostComponent } from '../Modules/Forest Management/Nursery/Nursery/Infrastructure cost/infrastructurecost.component';
import { seedingandsaplingComponent } from '../Modules/Forest Management/Nursery/Nursery/Seeding and Sapling/seedingandsapling.component';
import { stockpositionComponent } from '../Modules/Forest Management/Nursery/Nursery/StockPosition/stockposition.component';
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


import { TechnicalDetailsComponent } from '../Modules/Catchment Area Management/SMC/technical-details/technical-details.component';
import { ImplementationComponent } from '../Modules/Catchment Area Management/SMC/implementation/implementation.component';
import { AssetUpdationComponent } from '../Modules/Catchment Area Management/SMC/asset-updation/asset-updation.component';
import { SmcSiteSuitabilityComponent } from '../Modules/Catchment Area Management/Water Shed Management/smc-site-suitability/smc-site-suitability.component';
import { TreatmentAreaComponent } from '../Modules/Catchment Area Management/Water table and Rainfall Data/treatment-area/treatment-area.component';
import { TubeWellsComponent } from '../Modules/Catchment Area Management/Water table and Rainfall Data/tube-wells/tube-wells.component';
import { WeatherDataComponent } from '../Modules/Catchment Area Management/Water table and Rainfall Data/weather-data/weather-data.component';
import { CatchmentBasicDetailsComponent } from '../Modules/Catchment Area Management/SMC/basic-details/catchmentbasic-details.component';
import { catchementPlanningComponent } from '../Modules/Catchment Area Management/SMC/planning/catchementplanning.component';
import { ecoresurveyComponent } from '../Modules/Forest Management/eco-development/Resurvey/ecoresurvey.component';


import { ecomaintenenceComponent } from '../Modules/Forest Management/eco-development/Maintenence/maintenence.component';

import { smctechniacaldetailsComponent } from '../Modules/Forest Management/SMC/Basic Details/Technical Implentation/smctechniacaldetails.component';
import {smcbasicdetailsComponent } from '../Modules/Forest Management/SMC/Basic Details/Basic Details/basicdetails.component';
import { smcImplementationdetailsComponent } from '../Modules/Forest Management/SMC/Basic Details/Implementation/Implementation.component';
import { smcMontoringComponent } from '../Modules/Forest Management/SMC/Basic Details/Montoring/Montoring.component';
import { smcAssetUpdationComponent } from '../Modules/Forest Management/SMC/Basic Details/Asset Updation/AssetUpdation.component';
import { protectionCreationComponent } from '../Modules/Forest Management/protection/Creation/creation.component';
import { protectionMontroingComponent } from '../Modules/Forest Management/protection/Montoring/Montroing.component';
import { protectionliveimmunizationComponent } from '../Modules/Forest Management/protection/Live Immunization/Live Immunization.component';

import { AdminmanagmentComponent } from '../Modules/Admin Module/User Management/usermangement.component';
import { CatchmentmonitoringComponent } from '../Modules/Catchment Area Management/SMC/monitoring/catchmentmonitoring/catchmentmonitoring.component';
import { DataDumpComponent } from '../Modules/Catchment Area Management/data-dump/data-dump.component';
import { EcoTourismSiteselectionComponent } from '../Modules/Livelihood/Eco_tourism/eco-tourism-siteselection/eco-tourism-siteselection.component';
import { HomestaySiteselectionComponent } from '../Modules/Livelihood/Eco_tourism/homestay-siteselection/homestay-siteselection.component';
import { FacilitiesComponent } from '../Modules/Livelihood/Eco_tourism/facilities/facilities.component';
import { CreationComponent } from '../Modules/Livelihood/Eco_tourism/creation/creation.component';
import { LivelihoodMonitoringComponent } from '../Modules/Livelihood/Eco_tourism/livelihood-monitoring/livelihood-monitoring.component';
import { LivelihoodMarketOutreachComponent } from '../Modules/Livelihood/Eco_tourism/livelihood-market-outreach/livelihood-market-outreach.component';
import { InstitutionalFrameworkComponent } from '../Modules/Livelihood/Eco_tourism/institutional-framework/institutional-framework.component';
import { FieldDetailsComponent } from '../Modules/Livelihood/Agro Forestry/field-details/field-details.component';
import { PlantationCreationComponent } from '../Modules/Livelihood/Agro Forestry/plantation-creation/plantation-creation.component';
import { ResurveyComponent } from '../Modules/Livelihood/Agro Forestry/resurvey/resurvey.component';
import { ProductionComponent } from '../Modules/Livelihood/Agro Forestry/production/production.component';
import { MaintenanceComponent } from '../Modules/Livelihood/Agro Forestry/maintenance/maintenance.component';
import { SurveyComponent } from '../Modules/Livelihood/Agro Forestry/survey/survey.component';
import { FisheriesPlanningComponent } from '../Modules/Livelihood/Fisheries/fisheries-planning/fisheries-planning.component';
import { CheckDamdetailsComponent } from '../Modules/Livelihood/Fisheries/check-damdetails/check-damdetails.component';
import { SpeciesdetailsComponent } from '../Modules/Livelihood/Fisheries/speciesdetails/speciesdetails.component';
import { TargetDetailsComponent } from '../Modules/Livelihood/Fisheries/target-details/target-details.component';
import { ProductionDetailsComponent } from '../Modules/Livelihood/Fisheries/production-details/production-details.component';
import { LivestockComponent } from '../Modules/Livelihood/Livestock/livestock/livestock.component';
import { LivestockPlanningComponent } from '../Modules/Livelihood/Livestock/livestock-planning/livestock-planning.component';
import { LivestockMonitoringComponent } from '../Modules/Livelihood/Livestock/livestock-monitoring/livestock-monitoring.component';
import { StockPositionComponent } from '../Modules/Livelihood/Livestock/stock-position/stock-position.component';
import { NtfpPlanningComponent } from '../Modules/Livelihood/NTFP Based/ntfp-planning/ntfp-planning.component';
import { NtfpCreationComponent } from '../Modules/Livelihood/NTFP Based/ntfp-creation/ntfp-creation.component';
import { HarvastingComponent } from '../Modules/Livelihood/NTFP Based/harvasting/harvasting.component';
import { NtfpProductionComponent } from '../Modules/Livelihood/NTFP Based/ntfp-production/ntfp-production.component';
import { MeetingComponent } from '../Modules/JFMC and EDC/meeting/meeting.component';
import { MonitoringComponent } from '../Modules/JFMC and EDC/monitoring/Monitoring.Component';
import { CreationCCFCCenterComponent } from '../Modules/NTFP(NCE)/creation-ccfc-center/creation-ccfc-center.component';
import { DetailsNTFPCollectionComponent } from '../Modules/NTFP(NCE)/Collection_ProcessingCenter/details-ntfp-collection/details-ntfp-collection.component';
import { NTFPMarketingStallsComponent } from '../Modules/NTFP(NCE)/Collection_ProcessingCenter/ntfp-marketing-stalls/ntfp-marketing-stalls.component';
import { ProcessingQualitycontrolComponent } from '../Modules/NTFP(NCE)/Collection_ProcessingCenter/processing-qualitycontrol/processing-qualitycontrol.component';
import { CraftMoreOutletsMonitorComponent } from '../Modules/NTFP(NCE)/craft-more-outlets-monitor/craft-more-outlets-monitor.component';
import { CreationCraftMoreoutletsComponent } from '../Modules/NTFP(NCE)/creation-craft-moreoutlets/creation-craft-moreoutlets.component';
import { ExibitionFairComponent } from '../Modules/NTFP(NCE)/exibition-fair/exibition-fair.component';
import { NTFPSurveyComponent } from '../Modules/NTFP(NCE)/Resource_Assesment&Inventory/ntfp-survey/ntfp-survey.component';
import { ResourceGenerationGrowthComponent } from '../Modules/NTFP(NCE)/Resource_Assesment&Inventory/resource-generation-growth/resource-generation-growth.component';
import { ResourceHarvestingComponent } from '../Modules/NTFP(NCE)/Resource_Assesment&Inventory/resource-harvesting/resource-harvesting.component';
import { AssetCreationComponent } from '../Modules/Project Management/asset-creation/asset-creation.component';
import { AssetMaintenenceComponent } from '../Modules/Project Management/asset-maintenence/asset-maintenence.component';
import { AttendenceReportComponent } from '../Modules/Project Management/attendence-report/attendence-report.component';
import { AuditComponent } from '../Modules/Project Management/audit/audit.component';
import { APOComponent } from '../Modules/Project Management/apo/apo.component';
import { ImpactAssessmentComponent } from '../Modules/impact-assessment/impact-assessment.component';
import { MonitoringDashboardComponent } from '../Modules/monitoring-dashboard/monitoring-dashboard.component';
import { MaindashboardComponent } from '../Modules/maindashboard/maindashboard.component'; 
import { RoleAccessComponent } from '../Modules/Security Role/role-access.component';











@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    ProposedCapacityComponent,
    CustomGridComponent,
    CapacityDashboardComponent,
    CustomDropdownComponent,
    MapComponent,
    ApprovedCapacityComponent,
    TrainingFeedbackComponent,
    viewtrainingfeedback,
    ViewDialogComponent,
    DepartmentComponent,
    CommunityComponent,
    StallsComponent,
    HomeComponent,
    JfmcDashboardComponent,
    InspectionComponent,
    SHGDashboardComponent,
    FMDashboardComponent,
    LivelihoodDashboardComponent,
    CAMDashboardComponent,
    NTFPDashboardComponent,
    PmDashboardComponent,
    CustomDashboardComponent,
    CommonChartComponent,
    MapViewComponent,
    EcoDevDashboardComponent,
    JFMCSelectionComponent,
    MicroPlanningComponent,
    JFMCDataEntryComponent,
    MeetingComponent,
    ChecklistJfmcBookComponent,
    MonitoringComponent,
    ShgDataEntryComponent,
    panchasutraComponent,
    BusinessPlanComponent,
    creditlinkageComponent,
    LoanRecoveryComponent,
    NurseryComponent,
    infrastructureComponent,
    infrastructureCostComponent,
    seedingandsaplingComponent,
    stockpositionComponent,
    presurveyComponent,
    sitemasterComponent,
    advanceworkComponent,
    plantationComponent,
    resurveyComponent,
    maintenceComponent,
    smcbasicdetailsComponent,
    ecodevelopmentpresurveyComponent,

    ecodevelopmentsitemasterComponent,
    ecodevelopmentAdvanceworkComponent,
    ecoplantationComponent,
  
    TechnicalDetailsComponent,
    ImplementationComponent,
    AssetUpdationComponent,
    SmcSiteSuitabilityComponent,
    TreatmentAreaComponent,
    TubeWellsComponent,
    WeatherDataComponent,
    CatchmentBasicDetailsComponent,
    catchementPlanningComponent,

    ecoresurveyComponent,
    ecomaintenenceComponent,
    smctechniacaldetailsComponent,
    smcImplementationdetailsComponent,
    smcMontoringComponent,
    smcAssetUpdationComponent,
    protectionCreationComponent,
    protectionMontroingComponent,
    protectionliveimmunizationComponent,
    AdminmanagmentComponent,
    CatchmentmonitoringComponent,
    EcoTourismSiteselectionComponent,
    HomestaySiteselectionComponent,
    FacilitiesComponent,
    CreationComponent,
    LivelihoodMonitoringComponent,
    LivelihoodMarketOutreachComponent,
    InstitutionalFrameworkComponent,
    FieldDetailsComponent,
    PlantationCreationComponent,
    ResurveyComponent,
    ProductionComponent,
    MaintenanceComponent,
    SurveyComponent,
    FisheriesPlanningComponent,
    CheckDamdetailsComponent,
  TargetDetailsComponent,
    ProductionDetailsComponent,
    SpeciesdetailsComponent,
    LivestockComponent, 
    LivestockPlanningComponent,
    LivestockMonitoringComponent,
    StockPositionComponent,
    NtfpPlanningComponent,
    NtfpCreationComponent,
    HarvastingComponent,
    NtfpProductionComponent,
    CreationCCFCCenterComponent,
    DetailsNTFPCollectionComponent,
    NTFPMarketingStallsComponent,
    ProcessingQualitycontrolComponent,
    CraftMoreOutletsMonitorComponent,
    CreationCraftMoreoutletsComponent,
    ExibitionFairComponent,
    NTFPSurveyComponent,
    ResourceGenerationGrowthComponent,
    ResourceHarvestingComponent,
    AssetCreationComponent,
    AssetMaintenenceComponent,
    AttendenceReportComponent,
    AuditComponent,
    APOComponent,
    ImpactAssessmentComponent,
    DataDumpComponent,
    MonitoringDashboardComponent,
    MaindashboardComponent,
    RoleAccessComponent,
   
    
    
    

    
    

  ],




  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    MatTableModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatSelectModule, MatMenuModule,
    MatMenuModule,
    MatSnackBarModule,MatCheckboxModule
    
  ],
  providers: [
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
