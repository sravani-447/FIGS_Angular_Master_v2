import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TrainingMaster } from '../models/training-master.model';

@Injectable({
  providedIn: 'root'   // ✅ correct placement
})
export class ServerRequests {
  // rejectBasicDetails(id: any, rejectComment: string) {
  //   throw new Error('Method not implemented.');
  // }
  // updateCatchmentMaster(payload: any) {
  //   throw new Error('Method not implemented.');
  // }

  constructor(private http: HttpClient) { }


  public BASE_URL = 'http://localhost:60669/api/figs';
  public WebApiUrl = 'https://figs.neogeoinfo.in:9094/';
  public Geoserver_URl = 'http://183.82.114.29:9901';






  //  public BASE_URL = 'https://figs.tripura.gov.in/figsapi3/api/figs'; /*Production Server*/
  //   public WebApiUrl = 'https://figs.tripura.gov.in/figsweb3/';
  //   public Geoserver_URl = 'https://figs.tripura.gov.in';

  // public BASE_URL = 'https://figs.tripura.gov.in/apidemo/api/figs'; /*UAT Server*/
  // public WebApiUrl = 'https://figs.tripura.gov.in/webdemo/';
  // public Geoserver_URl = 'http://183.82.114.29:9901';



  private get ROOT_DOMAIN() {
    return this.BASE_URL.split('/api')[0];
  }

  getStateBoundaryUrl(): string {
    return `${this.WebApiUrl}ProjectMgmt/Get_state_boundary`;
  }

  InsertDepartmentParticipants(data: any[]): Observable<any> {
    return this.http.post(
      `${this.BASE_URL}/InsertDepartmentParticipants`,
      data
    );
  }

  UserLogin(username: string, password: string): Observable<string> {

    const headers = new HttpHeaders({
      'Accept': 'text/plain'
    });

    const params = new HttpParams()
      .set('username', username)
      .set('password', password);

    return this.http.get(
      `${this.BASE_URL}/UserLogin`,
      {
        headers,
        params,
        responseType: 'text'
      }
    );
  }
  sessionlogout(username: any): Observable<string> {

    const headers = new HttpHeaders({
      'Accept': 'text/plain'
    });

    const params = new HttpParams()
      .set('username', username)

    return this.http.get(
      `${this.BASE_URL}/sessionlogout`,
      {
        headers,
        params,
        responseType: 'text'
      }
    );
  }
  GetPendingReport(district: any, sub_district: any, range: any, schemeName: any, beat: any, startDate: any, endDate: any): Observable<any> {
    return this.http.get(`${this.WebApiUrl}Management/GetPendingReport?district=${district}&sub_district=${sub_district}&range=${range}&schemeName=${schemeName}&beat=${beat}&startDate=${startDate}&endDate=${endDate}`);
  }
  getAllTrainingDetails(statusId: number = 0): Observable<any> {
    const params = new HttpParams()
      .set('statusId', statusId.toString());

    return this.http.get<any>(
      `${this.BASE_URL}/GetAllTrainingDetails`,
      { params }
    );
  }
  GetAllDirectorsHierachyDetails(hierarchy: string): Observable<any> {
    const params = new HttpParams()
      .set('hierarchy', hierarchy.toString());

    return this.http.get<any>(
      `${this.BASE_URL}/GetAllDirectorsHierachyDetails`,
      { params }
    );
  }
  getDFOTrainingDetails(string: true): Observable<any> {
    const params = new HttpParams()
      .set('status', true);

    return this.http.get<any>(
      `${this.BASE_URL}/GetDFOTrainingDetails`,
      { params }
    );
  }
  insertProposedCapacityApproveorRejectDetails(payload: any): Observable<any> {

    return this.http.post<any>(
      `${this.BASE_URL}/UpdateTrainingStatus`,
      payload
    );

  }
  updateapprovaltrainingdetails(payload: any): Observable<any> {
    return this.http.post<any>(
      `${this.BASE_URL}/UpdateTrainingInApproval`,
      payload
    );
  }

  getAllLookUps(statusId: number = -1, device?: string, id?: number): Observable<any> {
    let params = new HttpParams().set('statusId', statusId.toString());

    // Append optional parameters if provided
    let url = `${this.BASE_URL}/GetAllLookUp`;
    if (device) {
      url += `/${device}`;
      if (id !== undefined) {
        url += `/${id}`;
      }
    }

    return this.http.get<any>(url, { params });
  }
  getviewtrainingfeedback(trainingId: string): Observable<any> {
    const params = new HttpParams()
      .set('status', true);

    return this.http.get<any>(
      `${this.BASE_URL}/GetTrainingFeedback?typeOfTraining=Na&trainingId=${trainingId}&participantId=NA`,
      { params }
    );
  }
  getAllGeo(statusId: number = -1): Observable<any> {

    const params = new HttpParams()
      .set('statusId', statusId.toString());

    return this.http.get<any>(
      `${this.BASE_URL}/GetAllGeo`,
    );
  }
  getjuridictiondetails(_id: any): Observable<any> {
    return this.http.get<any>(
      `${this.BASE_URL}/GetJurisdictionByUser?userid=${_id}`
    );
  }


  getcapacitydashboarddata(dist: any, subdis: any, range: any, schemeID: any) {
    // Helper to convert null/undefined to empty string
    const safeStr = (val: any) => (val === undefined || val === null || val === 'null') ? '' : val;

    const d = safeStr(dist);
    const s = safeStr(subdis);
    const r = safeStr(range);
    const sch = safeStr(schemeID);

    // Construct URL cleanly
    return this.http.get<any>(
      `${this.BASE_URL}/GetTrainingDashboardData?dist=${d}&subdivision=${s}&range=${r}&schemeID=${sch}`
    );
  }


  insertproposedtrainingdetails(training: any) {
    return this.http.post<any>(
      `${this.BASE_URL}/InsertTrainingMaster`,
      training
    );
  }
  getTrainingFeedback(
    idTypeOfActivity: any,
    idLevelParticipants: any,
    idCategoryOfActivity: any
  ) {
    const url = this.BASE_URL + `/GetTrainingFeedback` + `?typeOfTraining=${idTypeOfActivity}` + `&trainingId=${idLevelParticipants}` + `&participantId=${idCategoryOfActivity}`;

    // ✅ RETURN observable (do NOT subscribe here)
    return this.http.get<any>(url);
  }
  getTrainingfilterFeedback(
    idTypeOfActivity: any,
    idCategoryOfActivity: any
  ) {
    const url = this.BASE_URL + `/GetTrainingByFilter` + `?activityId=${idTypeOfActivity}` + `&activityCategoryId=${idCategoryOfActivity}&participant_type=D&lvlOfParticipantId=NA`;

    // ✅ RETURN observable (do NOT subscribe here)
    return this.http.get<any>(url);
  }
  getapprovedtrainiglist(): Observable<any> {
    return this.http.get<any>(
      `${this.BASE_URL}/GetAllApprovedTrainingWithSessPart`,
    );
  }
  getNotificationlist(userId: string, rolename: string): Observable<any> {
    return this.http.get<any>(
      `${this.BASE_URL}/GetAllNotificationDetails?userId=${userId}&rolename=${rolename}`,
    );
  }

  /**
   * Get modules allowed for a designation
   */
  GetModulesByDesignation(designation_id: number): Observable<any> {
    const params = new HttpParams().set('designation_id', designation_id.toString());
    return this.http.get<any>(`${this.BASE_URL}/GetModulesByDesignation`, { params });
  }
  getShgdatalist(userId: string): Observable<any> {
    return this.http.get<any>(
      this.BASE_URL + `/GetAllShg?userId=${userId}`
    );
  }
  getShgRelDetails(shg_id: string): Observable<any> {
    return this.http.get<any>(
      this.WebApiUrl + `/SHGJLG/GetAllShgRelDetails?shg_id=${shg_id}`
    );
  }
  insertShgAll(payload: any) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post(this.WebApiUrl + `SHGJLG/InsertShgAll`, payload, { headers });
  }


  insertShgAddMemberDetails(payload: any) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post(this.WebApiUrl + `SHGJLG/AddNewHHmemberDetails`, payload, { headers });
  }


  getapprovedPartispantslist(
    trainingId: any,
    participantTypeId: any,
  ) {
    const url = this.BASE_URL + `/GetParticipantByTrainingID` + `?trainingId=${trainingId}` + `&participantTypeId=${participantTypeId}`;
    return this.http.get<any>(url);
  }

  getapprovedsessionlist(
    trainingId: any,
  ) {
    const url = this.BASE_URL + `/GestSessionByTrainingID` + `?trainingId=${trainingId}`;
    return this.http.get<any>(url);
  }

  getApprovedresourcefile(
    fileId: any,
  ) {
    const url = this.BASE_URL + `/GestSessionResourceFile` + `?fileId=${fileId}`;
    return this.http.get<any>(url);
  }
  savesessionRecord(
    sessiondata: any,
  ) {
    return this.http.post<any>(
      `${this.BASE_URL}/InsertSession`,
      sessiondata
    );
  }

  // Add this method to your ServerRequests service
  getTrainingParticipants(trainingId: any): Observable<any> {
    return this.http.get<any>(`${this.BASE_URL}/GetTrainingParticipantDepartment?trainingId=${trainingId}`);
  }

  saveTrainingFeedback(payload: any): Observable<any> {
    return this.http.post<any>(`${this.BASE_URL}/SaveFeedback`, payload);
  }

  saveFeedback(payload: any) {
    return this.http.post(`${this.BASE_URL}/SaveFeedback`, payload);
  }

  // Add these to your ServerRequests class
  getTrainingParticipantsCommunity(trainingId: any): Observable<any> {
    const url = `${this.BASE_URL}/GetTrainingParticipantCommunity?trainingId=${trainingId}&ptype=community`;
    return this.http.get<any>(url);
  }

  insertFeedbackDepartment(payload: any): Observable<any> {
    return this.http.post<any>(`${this.BASE_URL}/InsertFeedbackDepartment`, payload);
  }

  insertFeedbackCommunity(payload: any): Observable<any> {
    return this.http.post<any>(`${this.BASE_URL}/InsertFeedbackCommunity`, payload);
  }
  getAllStallDetails(): Observable<any> {
    return this.http.get<any>(`${this.BASE_URL}/GetAllStallDetails`);
  }

  /**
   * Insert security permissions for designation. Expects an array of objects with
   * { ParentModule, Submodule, ChildModule, designation_id }
   */
  InsertSecurityusers(ParentModule: string, Submodule: string, ChildModule: string, designation_id: number, landingpage: string): Observable<any> {
    const params = new HttpParams()
      .set('ParentModule', ParentModule || '')
      .set('Submodule', Submodule || '')
      .set('ChildModule', ChildModule || '')
      .set('designation_id', designation_id != null ? designation_id.toString() : '')
      .set('landingpage', landingpage || '');

    const url = `${this.BASE_URL}/InsertSecurityusers`;
    // POST with empty body and query params (Web API binds simple types from URI)
    return this.http.post<any>(url, {}, { params });
  }

  getStallImages(stallId: number): Observable<any> {
    const url = `${this.WebApiUrl}Training/GetStallImages?stallId=${stallId}`;
    return this.http.get<any>(url);
  }

  getPanchasutraImages(Id: string, imageName: string): Observable<any> {
    const url = `${this.WebApiUrl}Nursery/GetNurseryImage?id=${Id}&imageName=${imageName}&tableName=shg_panchsutra`;
    return this.http.get<any>(url);
  }
  getNurseryImages(Id: string, imageName: string): Observable<any> {
    const url = `${this.WebApiUrl}Nursery/GetNurseryImage?id=${Id}&imageName=${imageName}&tableName=nurserydetails`;
    return this.http.get<any>(url);
  }
  getinfraImages(Id: string, imageName: string): Observable<any> {
    const url = `${this.WebApiUrl}Nursery/GetNurseryImage?id=${Id}&imageName=${imageName}&tableName=nursery_infra`;
    return this.http.get<any>(url);
  }
  getseedingandsaplingImages(Id: string, imageName: string): Observable<any> {
    const url = `${this.WebApiUrl}Nursery/GetNurseryImage?id=${Id}&imageName=${imageName}&tableName=nursery_seedling`;
    return this.http.get<any>(url);
  }
  getstockPostioningImages(Id: string, imageName: string): Observable<any> {
    const url = `${this.WebApiUrl}Nursery/GetNurseryImage?id=${Id}&imageName=${imageName}&tableName=nursery_stock`;
    return this.http.get<any>(url);
  }
  getpresurveyImages(Id: string, imageName: string): Observable<any> {
    const url = `${this.WebApiUrl}Nursery/GetNurseryImage?id=${Id}&imageName=${imageName}&tableName=plantation_presurvey`;
    return this.http.get<any>(url);
  }
  getresurveyImages(Id: string, imageName: string): Observable<any> {
    const url = `${this.WebApiUrl}Nursery/GetNurseryImage?id=${Id}&imageName=${imageName}&tableName=plantation_resurvey`;
    return this.http.get<any>(url);
  }


  getplantationmaintenceImages(id: number, imageName: string, tableName: string): Observable<any> {
    const url = `${this.WebApiUrl}Plantation/GetPlantationImage?id=${id}&imageName=${imageName}&tableName=${tableName}`;
    return this.http.get<any>(url);
  }

  getsitemasterImages(Id: string, imageName: string): Observable<any> {
    const url = `${this.WebApiUrl}Nursery/GetNurseryImage?id=${Id}&imageName=${imageName}&tableName=plantation_site_master`;
    return this.http.get<any>(url);
  }
  getadvanceworkImages(Id: string, imageName: string): Observable<any> {
    const url = `${this.WebApiUrl}Nursery/GetNurseryImage?id=${Id}&imageName=${imageName}&tableName=plantation_advance`;
    return this.http.get<any>(url);
  }
  getEcoSiteMasterImages(Id: string, imageName: string): Observable<any> {
    const url = `${this.WebApiUrl}Nursery/GetNurseryImage?id=${Id}&imageName=${imageName}&tableName=ecod_plan_site_master`;
    return this.http.get<any>(url);
  }
  geteceoplantationpresurveyImages(Id: string, imageName: string): Observable<any> {
    const url = `${this.WebApiUrl}Nursery/GetNurseryImage?id=${Id}&imageName=${imageName}&tableName=ecod_plan_presurvey`;
    return this.http.get<any>(url);
  }

  geteceoplantationadvanceImages(id: string, imageName: string, tableName: string = 'ecod_plan_advance_work'): Observable<any> {
    const url = `${this.WebApiUrl}Nursery/GetNurseryImage?id=${id}&imageName=${imageName}&tableName=${tableName}`;
    return this.http.get<any>(url);
  }

  geteceoplantationaImages(id: string, imageName: string, tableName: string = 'ecod_plan_plantation'): Observable<any> {
    const url = `${this.WebApiUrl}Nursery/GetNurseryImage?id=${id}&imageName=${imageName}&tableName=${tableName}`;
    return this.http.get<any>(url);
  }
  geteceoresurveyImages(Id: string, imageName: string): Observable<any> {
    const url = `${this.WebApiUrl}Nursery/GetNurseryImage?id=${Id}&imageName=${imageName}&tableName=ecod_plan_resurvey`;
    return this.http.get<any>(url);
  }


  geteceomaintenenceImages(Id: string, imageName: string): Observable<any> {
    const url = `${this.WebApiUrl}Nursery/GetNurseryImage?id=${Id}&imageName=${imageName}&tableName=ecod_plan_maintenence`;
    return this.http.get<any>(url);
  }
  getsmcbasicdetailsImages(Id: string, imageName: string): Observable<any> {
    const url = `${this.WebApiUrl}Nursery/GetNurseryImage?id=${Id}&imageName=${imageName}&tableName=ecod_smc_basic`;
    return this.http.get<any>(url);
  }
  getsmcetechnicaldetailsImages(Id: string, imageName: string): Observable<any> {
    const url = `${this.WebApiUrl}Nursery/GetNurseryImage?id=${Id}&imageName=${imageName}&tableName=ecod_smc_technical`;
    return this.http.get<any>(url);
  }
  getsmceImplementationImages(Id: string, imageName: string): Observable<any> {
    const url = `${this.WebApiUrl}Nursery/GetNurseryImage?id=${Id}&imageName=${imageName}&tableName=ecod_smc_implementation`;
    return this.http.get<any>(url);
  }
  getsmcmontoringImages(Id: string, imageName: string): Observable<any> {
    const url = `${this.WebApiUrl}Nursery/GetNurseryImage?id=${Id}&imageName=${imageName}&tableName=ecod_smc_monitor`;
    return this.http.get<any>(url);
  }
  getsmcassetupdationImages(Id: string, imageName: string): Observable<any> {
    const url = `${this.WebApiUrl}Nursery/GetNurseryImage?id=${Id}&imageName=${imageName}&tableName=ecod_smc_asset_updation`;
    return this.http.get<any>(url);
  }
  getprotectioncreationImages(Id: string, imageName: string): Observable<any> {
    const url = `${this.WebApiUrl}Nursery/GetNurseryImage?id=${Id}&imageName=${imageName}&tableName=ecod_prot_create`;
    return this.http.get<any>(url);
  }
  getprotectionmontoringImages(Id: string, imageName: string): Observable<any> {
    const url = `${this.WebApiUrl}Nursery/GetNurseryImage?id=${Id}&imageName=${imageName}&tableName=eco_pro_monitoring`;
    return this.http.get<any>(url);
  }
  getprotectionliveimmunizationImages(Id: string, imageName: string): Observable<any> {
    const url = `${this.WebApiUrl}Nursery/GetNurseryImage?id=${Id}&imageName=${imageName}&tableName=ecod_prot_lives_immu`;
    return this.http.get<any>(url);
  }
  getplantationImages(id: number, imageName: string, tableName: string): Observable<any> {
    const url = `${this.WebApiUrl}Plantation/GetPlantationImage?id=${id}&imageName=${imageName}&tableName=${tableName}`;
    return this.http.get<any>(url);
  }


  getinfracostImages(Id: string, imageName: string): Observable<any> {
    const url = `${this.WebApiUrl}Nursery/GetNurseryImage?id=${Id}&imageName=${imageName}&tableName=nursery_infra_cost`;
    return this.http.get<any>(url);
  }
  getCreditlinkageImages(Id: string, imageName: string): Observable<any> {
    const url = `${this.WebApiUrl}Nursery/GetNurseryImage?id=${Id}&imageName=${imageName}&tableName=shg_credit_linkage`;
    return this.http.get<any>(url);
  }
  getBusinessplanImages(Id: string, imageName: string): Observable<any> {
    const url = `${this.WebApiUrl}Nursery/GetNurseryImage?id=${Id}&imageName=${imageName}&tableName=shg_business_plan`;
    return this.http.get<any>(url);
  }
  getloanrecoveryImages(Id: string, imageName: string): Observable<any> {
    const url = `${this.WebApiUrl}Nursery/GetNurseryImage?id=${Id}&imageName=${imageName}&tableName=shg_loan_recovery`;
    return this.http.get<any>(url);
  }


  getJfmcChecklistImage(id: string, imageName: string): Observable<any> {
    const url = `${this.WebApiUrl}Nursery/GetNurseryImage?id=${id}&imageName=${imageName}&tableName=jfmc_book_checklist`;
    return this.http.get<any>(url);
  }

  getAllJfmclistByJurisdiction(beats: string): Observable<any> {
    return this.http.get<any>(`${this.BASE_URL}/GetAllJfmclistByJurisdiction?beats=${beats}`);
  }

  getjfmcdashboarddata(beat: string, jfmc_no: string, fromDate: string = '', toDate: string = ''): Observable<any> {
    const url = `${this.BASE_URL}/GetJfmcDashboardData?beat=${beat}&jfmc_no=${jfmc_no}&from_date=${fromDate}&to_date=${toDate}`;
    return this.http.get<any>(url);
  }

  getshgdashboarddata(
    shgName: string,
    jfmcName: string,
    beatName: string,
    subdivision: string,
    rangeName: string,
    scheme_name: string
  ): Observable<any> {

    let params = new HttpParams()
      .set('shgName', shgName || '')
      .set('jfmcName', jfmcName || '')
      .set('beatName', beatName || '')
      .set('subdivision', subdivision || '')
      .set('rangeName', rangeName || '')
      .set('scheme_name', scheme_name || '');

    return this.http.get<any>(`${this.BASE_URL}/GetShgDashboardDataNew`, { params });
  }

  getSHGListByJfmc(jfmcName: string): Observable<any> {
    const url = `${this.BASE_URL}/GetAllShgByJfmcNameAndType?jfmcName=${jfmcName}&shgType=SHG`;
    return this.http.get<any>(url);
  }

  updateLoanRecoveryDetails(payload: any) {
    return this.http.post(`${this.WebApiUrl}SHGJLG/UpdateLoanRecoveryDetails`, payload);
  }

  GetForestDashboardData(payload: any): Observable<any> {
    return this.http.post<any>(`${this.BASE_URL}/GetForestDashboardData`, payload);
  }

  getSmcDashboardData(beat?: string, jfmc_no?: string): Observable<any> {
    let params = new HttpParams();
    if (beat && beat.trim()) { params = params.set('beat', beat); }
    if (jfmc_no && jfmc_no.trim()) { params = params.set('jfmc_no', jfmc_no); }

    return this.http.get<any>(`${this.WebApiUrl}/CAM/GetSmcDashboardData`, { params });
  }

  getJFMCList(userId: string): Observable<any> {
    return this.http.get<any>(`${this.BASE_URL}/GetAllJFMC?userid=${userId}`);
  }

  getAllJFMCRelatedDetails(jfmcid: number): Observable<any> {
    return this.http.get<any>(`${this.WebApiUrl}Jfmc/GetAllJfmcRelatedDetails?jfmc_id=${jfmcid}`);
  }




  insertJfmcAll(payload: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(`${this.WebApiUrl}Jfmc/InsertJfmcAll`, payload, { headers });
  }
  insertbankstatus(payload: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(`${this.WebApiUrl}Jfmc/InsertJfmcBankStatus`, payload, { headers });
  }
  inserthouseholddetailsstatus(payload: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(`${this.WebApiUrl}Jfmc/InsertHHandMemberDetails`, payload, { headers });
  }
  insertJfmcMicroPlanStatus(payload: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(`${this.WebApiUrl}Jfmc/InsertJfmcMicroPlanStatus`, payload, { headers });
  }

  DeletehhMemberJfmc(id: number, jfmc_id: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(`${this.WebApiUrl}Jfmc/DeletehhMemberJfmc?id=${id}&jfmc_id=${jfmc_id}`, {}, { headers });
  }

  DeleteMemberDetails(jfmcId: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(`${this.WebApiUrl}jfmc/DeleteMemberDetails?jfmc_id=${jfmcId}`, {}, { headers });
  }

  insertJfmcExecutiveCommitee(data: any) {
    return this.http.post(`${this.WebApiUrl}Jfmc/InsertJfmcExecutiveCommitee`, data);
  }
  updateHHandMemberDetails(data: any) {
    return this.http.post(`${this.WebApiUrl}/Jfmc/UpdateHHandMemberDetails`, data);
  }

  insertJfmcGeo(payload: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(`${this.WebApiUrl}Jfmc/InsertJfmcGeo`, payload, { headers });
  }
  insertJfmcMaster(payload: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(`${this.WebApiUrl}Jfmc/InsertJfmcMaster`, payload, { headers });
  }


  getVillageByRangeBeat(range: string, beat: string): Observable<any> {
    return this.http.get<any>(
      `${this.BASE_URL}/GetVillageByRangeBeat?range=${range}&beat=${beat}`
    );
  }

  getMeetingList(): Observable<any> {
    return this.http.get<any>(
      `${this.BASE_URL}/GetAllJfmcMeeting`
    );
  }
  updateMeetingDetails(data: any): Observable<any> {
    return this.http.post<any>(
      `${this.WebApiUrl}jfmc/UpdatemeetingDetails`,
      data
    );
  }

  getMeetingImageById(id: string, imageName: string): Observable<any> {
    return this.http.get<any>(
      `${this.WebApiUrl}jfmc/GetMeetingImage?id=${id}`
    );
  }

  sendMeetingForApproval(frm: string, to: string, id: string): Observable<any> {
    const url = `${this.WebApiUrl}Jfmc/MeetingSendForApproval?frm=${frm}&to=${to}&id=${id}`;
    return this.http.post<any>(url, {});
  }
  approveMeetingByRO(id: string): Observable<any> {
    const url = `${this.WebApiUrl}Jfmc/ApprovedByRangeoMeeting?id=${id}`;
    return this.http.post<any>(url, {});
  }

  rejectMeeting(frm: string, comment: string, id: string): Observable<any> {
    const encodedComment = encodeURIComponent(comment);
    const url = `${this.WebApiUrl}Jfmc/MeetingReject?frm=${frm}&rejectComments=${encodedComment}&id=${id}`;
    return this.http.post<any>(url, {});
  }

  getPanchasutradatalist(userId: string): Observable<any> {
    return this.http.get<any>(`${this.BASE_URL}/GetAllShgPanchsutra?user_id=${userId}`);
  }
  getBusinessplandatalist(userId: string): Observable<any> {
    return this.http.get<any>(`${this.BASE_URL}/GetAllShgBusinessPlan?user_id=${userId}`);
  }
  getCredditlinkagedatalist(userId: string): Observable<any> {
    return this.http.get<any>(`${this.BASE_URL}/GetAllShgCreditLinkage?user_id=${userId}`);
  }
  getloanrecocerydatalist(userId: string): Observable<any> {
    return this.http.get<any>(`${this.BASE_URL}/GetAllShgLoanRecovery?user_id=${userId}`);
  }

  getAllJfmcBookChecklist(userId: string): Observable<any> {
    return this.http.get<any>(
      `${this.BASE_URL}/GetAllJfmcBooksOfRecords?user_id=${userId}`
    );
  }
  getNurserydatalist(userId: string): Observable<any> {
    return this.http.get<any>(`${this.WebApiUrl}/Nursery/GetNurseyMasterDetails?userid=${userId}`);
  }
  getinfradatalist(userId: string): Observable<any> {
    return this.http.get<any>(`${this.WebApiUrl}Nursery/GetNurseyInfraDetails?userid=${userId}`);
  }
  getinfracostdatalist(userId: string): Observable<any> {
    return this.http.get<any>(`${this.WebApiUrl}Nursery/GetNurseryInfraCosting?userid=${userId}`);
  }
  getseedingsaplingdatalist(userId: string): Observable<any> {
    return this.http.get<any>(`${this.WebApiUrl}/Nursery/GetNurserySeedingSaplingMain?userid=${userId}`);
  }
  getstockdatalist(userId: string): Observable<any> {
    return this.http.get<any>(`${this.WebApiUrl}/Nursery/GetNurseryStockPosition?userid=${userId}`);
  }
  getpresurveydatalist(userId: string): Observable<any> {
    return this.http.get<any>(`${this.WebApiUrl}/Plantation/GetPlantationPreSurvey?userid=${userId}`);
  }

  getResurveydatalist(userId: string): Observable<any> {
    return this.http.get<any>(`${this.WebApiUrl}/Plantation/GetPlantationReSurvey?userid=${userId}`);
  }
  getmaintencedatalist(userId: string): Observable<any> {
    return this.http.get<any>(`${this.WebApiUrl}/Plantation/GetPlantationMaintenence?userid=${userId}`);
  }
  getSitemasterdatalist(userId: string): Observable<any> {
    return this.http.get<any>(`${this.WebApiUrl}/Plantation/GetPlantationSiteMaster?userid=${userId}`);
  }
  getplantationdatalist(userId: string): Observable<any> {
    return this.http.get<any>(`${this.WebApiUrl}/Plantation/GetPlantationDetails?userid=${userId}`);
  }

  getsmcbasicdetailsdatalist(userId: string): Observable<any> {
    return this.http.get<any>(`${this.WebApiUrl}/SMC/GetEcoSmcBasicDetails?userid=${userId}`);
  }
  getsmcTechnicaldetailsdatalist(userId: string): Observable<any> {
    return this.http.get<any>(`${this.WebApiUrl}/SMC/GetEcoSmcTechnicalDetails?userid=${userId}`);
  }
  getsmcimplementationdetailsdatalist(userId: string): Observable<any> {
    return this.http.get<any>(`${this.BASE_URL}/GetEcoCatchmentImplementation?userid=${userId}`);
  }
  getsmcMontoringdetailsdatalist(userId: string): Observable<any> {
    return this.http.get<any>(`${this.WebApiUrl}/SMC/GetEcoCatchmentMonitoring?userid=${userId}`);
  }
  getsmcassetupdationdetailsdatalist(userId: string): Observable<any> {
    return this.http.get<any>(`${this.WebApiUrl}/SMC/GetEcoCatchmentAssets?userid=${userId}`);
  }
  getprotectioncreationdetailsdatalist(userId: string): Observable<any> {
    return this.http.get<any>(`${this.WebApiUrl}/Protection/GetEcoProCreate?userid=${userId}`);
  }
  getprotectionMontroingdetailsdatalist(userId: string): Observable<any> {
    return this.http.get<any>(`${this.WebApiUrl}/Protection/GetEcoProMonitoring?userid=${userId}`);
  }
  getliveimmunizationdetailsdatalist(userId: string): Observable<any> {
    return this.http.get<any>(`${this.WebApiUrl}/Protection/GetEcoProLivestockImmunization?userid=${userId}`);
  }
  getadvancedatalist(userId: string): Observable<any> {
    return this.http.get<any>(`${this.WebApiUrl}/Plantation/GetPlantationAdvanceWork?userid=${userId}`);
  }

  getecodevelopmentplantationpresurveydatalist(userId: string): Observable<any> {
    return this.http.get<any>(`${this.WebApiUrl}EcoPlantation/GetEcoPlantationPreSurvey?userid=${userId}`);
  }
  getecodevelopmentAdvanceworkdatalist(userId: string): Observable<any> {
    return this.http.get<any>(`${this.WebApiUrl}EcoPlantation/GetEcoPlantationAdvanceWork?userid=${userId}`);
  }
  getecoplantationdatalist(userId: string): Observable<any> {
    return this.http.get<any>(`${this.WebApiUrl}EcoPlantation/GetEcoPlantationDetails?userid=${userId}`);
  }
  getecoresurveydatalist(userId: string): Observable<any> {
    return this.http.get<any>(`${this.WebApiUrl}EcoPlantation/GetEcoPlantationReSurvey?userid=${userId}`);
  }
  getecomaintenencedatalist(userId: string): Observable<any> {
    return this.http.get<any>(`${this.WebApiUrl}EcoPlantation/GetEcoPlantationMaintenence?userid=${userId}`);
  }
  getEcodevelopmentSiteMasterDatalist(userId: string): Observable<any> {
    return this.http.get<any>(`${this.WebApiUrl}EcoPlantation/GetEcoPlantationSiteMaster?userid=${userId}`);
  }
  sendChecklistForApproval(frm: string, to: string, id: number): Observable<any> {
    const url = `${this.BASE_URL}/ChecklistSendForApproval?frm=${frm}&to=${to}&id=${id}`;
    return this.http.post<any>(url, {});
  }

  rejectChecklist(frm: string, comments: string, id: number): Observable<any> {
    const encodedComment = encodeURIComponent(comments);
    const url = `${this.BASE_URL}/ChecklistReject?frm=${frm}&rejectComments=${encodedComment}&id=${id}`;
    return this.http.post<any>(url, {});
  }

  approveChecklistByRO(id: number): Observable<any> {
    const url = `${this.BASE_URL}/ApprovedByRangeoChecklist?id=${id}`;
    return this.http.post<any>(url, {});
  }

  updateChecklistComments(data: { Id: number; comments: string }) {
    const body = new HttpParams()
      .set('Id', data.Id.toString())
      .set('comments', data.comments);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    return this.http.post(
      `${this.WebApiUrl}/jfmc/UpdateChecklistofJFMCbookRecord`,
      body.toString(),
      { headers }
    );
  }

  getChecklistImage(id: string, imageName: string): Observable<any> {
    return this.http.get<any>(
      `${this.WebApiUrl}/jfmc/GetCheckListImage?id=${id}`
    );
  }

  // ================= MONITORING (JFMC) ENDPOINTS =================

  getAllMonitoringData(userId: string): Observable<any> {
    return this.http.get<any>(
      `${this.BASE_URL}/GetAllJfmcMonitoring?user_id=${userId}`
    );
  }


  updateMonitoringDetails(payload: any) {
    const body = new URLSearchParams();
    body.set('Id', payload.Id);
    body.set('grading_rating_iga', payload.grading_rating_iga || '');
    body.set('revolving_fund', payload.revolving_fund || '');
    body.set('registration_num', payload.registration_num || '');
    body.set('no_jhumia_family', payload.no_jhumia_family || '');
    body.set('n_man_animal_conflict', payload.n_man_animal_conflict || '');
    body.set('comments', payload.comments || '');

    // --------------- FIX BELOW ---------------
    // Add 'this.WebApiUrl' before the path
    return this.http.post(
      this.WebApiUrl + 'jfmc/UpdateMonitoringDetails',
      body.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
  }


  getMonitoringImage(id: string): Observable<any> {
    const url = `${this.WebApiUrl}jfmc/GetMonitoringImage?id=${id}`;
    return this.http.get<any>(url);

  }

  // 4. Send For Approval
  // URL: /MonitoringForApproval
  sendMonitoringForApproval(frm: string, to: string, id: number): Observable<any> {
    const url = `${this.BASE_URL}/MonitoringForApproval?frm=${frm}&to=${to}&id=${id}`;
    return this.http.post<any>(url, {});
  }

  // 5. Reject Monitoring
  // URL: /MonitoringReject
  rejectMonitoring(frm: string, comments: string, id: number): Observable<any> {
    const encodedComment = encodeURIComponent(comments);
    const url = `${this.BASE_URL}/MonitoringReject?frm=${frm}&rejectComments=${encodedComment}&id=${id}`;
    return this.http.post<any>(url, {});
  }

  // 6. Approve By RO
  // URL: /ApprovedByRangeoMonitoring
  approveMonitoringByRO(id: number): Observable<any> {
    const url = `${this.BASE_URL}/ApprovedByRangeoMonitoring?id=${id}`;
    return this.http.post<any>(url, {});
  }



  InsertNurserydetails(
    sessiondata: any,
  ) {
    return this.http.post<any>(
      `${this.WebApiUrl}/Nursery/UpdateNurseryDetails`,
      sessiondata
    );
  }
  Insertplantationpresurveydetails(
    sessiondata: any,
  ) {
    return this.http.post<any>(
      `${this.WebApiUrl}Plantation/UpdatePlantaionPreSurvey`,
      sessiondata
    );
  }

  InsertEcoplantationpresurveydetails(
    sessiondata: any,
  ) {
    return this.http.post<any>(
      `${this.WebApiUrl}EcoPlantation/UpdateEcotourism_Presurvey`,
      sessiondata
    );
  }
  InsertEcoplantationmaintencedetails(
    sessiondata: any,
  ) {
    return this.http.post<any>(
      `${this.WebApiUrl}EcoPlantation/UpdateEcoMaintenanceDetails`,
      sessiondata
    );
  }
  InsertEcoplantationresurveydetails(
    sessiondata: any,
  ) {
    return this.http.post<any>(
      `${this.WebApiUrl}EcoPlantation/UpdateEcoResurveyDetails`,
      sessiondata
    );
  }

  InsertEcoplantationplantationdetails(
    sessiondata: any,
  ) {
    return this.http.post<any>(
      `${this.WebApiUrl}EcoPlantation/UpdateEcoPlantationDetails`,
      sessiondata
    );
  }

  InsertEcoplantationsitemasterdetails(
    sessiondata: any,
  ) {
    return this.http.post<any>(
      `${this.WebApiUrl}EcoPlantation/UpdateEcotourism_SiteMaster`,
      sessiondata
    );
  }

  InsertEcoplantationadvworkmasterdetails(
    sessiondata: any,
  ) {
    return this.http.post<any>(
      `${this.WebApiUrl}EcoPlantation/UpdateEcotourism_AdvWork`,
      sessiondata
    );
  }
  Insertplantationresurveydetails(
    sessiondata: any,
  ) {
    return this.http.post<any>(
      `${this.WebApiUrl}Plantation/UpdatePlantaionResurvey`,
      sessiondata
    );
  }
  InsertSitemasterdetails(
    sessiondata: any,
  ) {
    return this.http.post<any>(
      `${this.WebApiUrl}Plantation/UpdatePlantaionSiteMaster`,
      sessiondata
    );
  }
  Insertplantationdetails(
    sessiondata: any,
  ) {
    return this.http.post<any>(
      `${this.WebApiUrl}Plantation/UpdatePlantaion`,
      sessiondata
    );
  }
  Insertplantationmaintencedetails(
    sessiondata: any,
  ) {
    return this.http.post<any>(
      `${this.WebApiUrl}Plantation/UpdatePlantaionMaintenence`,
      sessiondata
    );
  }
  Insertplantationadvanceworkedetails(
    sessiondata: any,
  ) {
    return this.http.post<any>(
      `${this.WebApiUrl}Plantation/UpdatePlantaionAdvWork`,
      sessiondata
    );
  }
  InsertProtectioncreationdetails(
    sessiondata: any,
  ) {
    return this.http.post<any>(
      `${this.WebApiUrl}Protection/UpdateCreationDetails`,
      sessiondata
    );
  }
  updatejfmcmicroplanstatus(
    sessiondata: any,
  ) {
    return this.http.post<any>(
      `${this.WebApiUrl}/Jfmc/UpdateJfmcMicroPlanStatus`,
      sessiondata
    );
  }
  InsertForestsmctechnicaldetails(
    sessiondata: any,
  ) {
    return this.http.post<any>(
      `${this.WebApiUrl}SMC/UpdateSMCTechnicalDetails`,
      sessiondata
    );
  }
  InsertForestsmcImplmentationdetails(
    sessiondata: any,
  ) {
    return this.http.post<any>(
      `${this.WebApiUrl}SMC/UpdateImplementationDetails`,
      sessiondata
    );
  }
  InsertForestSmcassetupdationdetails(
    sessiondata: any,
  ) {
    return this.http.post<any>(
      `${this.WebApiUrl}SMC/AssetUpdationDetails`,
      sessiondata
    );
  }
  InsertSmcMontoringdetails(
    sessiondata: any,
  ) {
    return this.http.post<any>(
      `${this.WebApiUrl}SMC/UpdateSMCMonitoringDetails`,
      sessiondata
    );
  }
  InsertForestSmcbasicupdationdetails(
    sessiondata: any,
  ) {
    return this.http.post<any>(
      `${this.WebApiUrl}SMC/UpdateSMCBasicDetails`,
      sessiondata
    );
  }
  InsertProtectionliveimmunizatondetails(
    sessiondata: any,
  ) {
    return this.http.post<any>(
      `${this.WebApiUrl}Protection/UpdateLivestockImmunizationDetails`,
      sessiondata
    );
  }
  InsertProtectionMontoringdetails(
    sessiondata: any,
  ) {
    return this.http.post<any>(
      `${this.WebApiUrl}Protection/UpdateProtectionMonitoringDetails`,
      sessiondata
    );
  }
  InsertBusinessplandetails(
    sessiondata: any,
  ) {
    return this.http.post<any>(
      `${this.WebApiUrl}SHGJLG/UpdateBusinessPlanDetails`,
      sessiondata
    );
  }
  InsertCreditLinkagedetails(
    sessiondata: any,
  ) {
    return this.http.post<any>(
      `${this.WebApiUrl}SHGJLG/UpdateCreditLinkageDetails`,
      sessiondata
    );
  }
  InsertLoanRecoverydetails(
    sessiondata: any,
  ) {
    return this.http.post<any>(
      `${this.WebApiUrl}SHGJLG/UpdateLoanRecoveryDetails`,
      sessiondata
    );
  }
  InsertNurseryseddingdetails(
    sessiondata: any,
  ) {
    return this.http.post<any>(
      `${this.WebApiUrl}Nursery/UpdateNurserySeedlings`,
      sessiondata
    );
  }
  InsertNurserystockdetails(
    sessiondata: any,
  ) {
    return this.http.post<any>(
      `${this.WebApiUrl}/Nursery/UpdateNurseryStockPosition`,
      sessiondata
    );
  }
  InsertNurseryrejectdetails(frm: any, rejectComments: string, id: any) {
    const url = `${this.WebApiUrl}/Nursery/CommonReject?frm=${frm}&rejectComments=${rejectComments}&id=${id}&module=nurserydetails`;
    return this.http.post<any>(url, {});
  }
  Insertcommonrejectdetails(frm: any, rejectComments: string, id: any, modulename: any) {
    const url = `${this.WebApiUrl}/Nursery/CommonReject?frm=${frm}&rejectComments=${rejectComments}&id=${id}&module=${modulename}`;
    return this.http.post<any>(url, {});
  }
  InsertNurseryapprovedrangedetails(id: any) {
    const url = `${this.WebApiUrl}Nursery/CommonApprovedByRangeo?id=${id}&module=nurserydetails`;
    return this.http.post<any>(url, {});
  }
  commonforallrolesapprovedrangedetails(id: any, modulename: any) {
    const url = `${this.BASE_URL}/CommonApprovedByRangeo?id=${id}&module=${modulename}`;
    return this.http.post<any>(url, {});
  }
  InsertNurseryseddingapprovedrangedetails(id: any) {
    const url = `${this.WebApiUrl}/Nursery/CommonApprovedByRangeo?id=${id}&module=nursery_seedling`;
    return this.http.post<any>(url, {});
  }


  Insertinfradetails(
    sessiondata: any,
  ) {
    return this.http.post<any>(
      `${this.WebApiUrl}Nursery/UpdateNurseryInfra`,
      sessiondata
    );
  }
  Insertinfracostdetails(
    sessiondata: any,
  ) {
    return this.http.post<any>(
      `${this.WebApiUrl}Nursery/UpdateNurseryInfraCost`,
      sessiondata
    );
  }
  Insertinfrarejectdetails(frm: any, rejectComments: string, id: any) {
    const url = `${this.WebApiUrl}/Nursery/CommonReject?frm=${frm}&rejectComments=${rejectComments}&id=${id}&module=nursery_infra`;
    return this.http.post<any>(url, {});
  }
  Insertinfracostrejectdetails(frm: any, rejectComments: string, id: any) {
    const url = `${this.WebApiUrl}/Nursery/CommonReject?frm=${frm}&rejectComments=${rejectComments}&id=${id}&module=nursery_infra_cost`;
    return this.http.post<any>(url, {});
  }

  Insertinfraapprovedrangedetails(id: any) {
    const url = `${this.WebApiUrl}/Nursery/CommonApprovedByRangeo?id=${id}&module=nursery_infra`;
    return this.http.post<any>(url, {});
  }

  Insertinfracostapprovedrangedetails(id: any) {
    const url = `${this.WebApiUrl}/Nursery/CommonApprovedByRangeo?id=${id}&module=nursery_infra_cost`;
    return this.http.post<any>(url, {});
  }
  CommonApprovalforallroles(frm: any, to: any, id: any, module: any) {
    const url = `${this.BASE_URL}/CommonSendForApproval?frm=${frm}&to=${to}&id=${id}&module=${module}`;
    return this.http.post<any>(url, {});
  }
  updatePancahsutradetails(
    sessiondata: any,
  ) {
    return this.http.post<any>(
      `${this.WebApiUrl}SHGJLG/UpdatePanchsutraDetails`,
      sessiondata
    );
  }
  InsertPanchasutrarejectdetails(frm: any, rejectComments: string, id: any) {
    const url = `${this.WebApiUrl}/Nursery/CommonReject?frm=${frm}&rejectComments=${rejectComments}&id=${id}&module=shgpanchsutra`;
    return this.http.post<any>(url, {});
  }
  InsertPanchasutraapprovetdetails(id: any) {
    const url = `${this.WebApiUrl}/Nursery/CommonApprovedByRangeo?id=${id}&module=shgpanchsutra`;
    return this.http.post<any>(url, {});
  }

  getAllCatchmentMaster(userId: string): Observable<any> {
    return this.http.get<any>(
      `${this.WebApiUrl}/CAM/GetAllCatchmentMaster?userid=${userId}`
    );
  }
  updateCatchmentComments(data: any) {
    const body = new HttpParams()
      .set('Id', data.Id)
      .set('structure_id', data.structure_id)
      .set('type_of_structure', data.type_of_structure)
      .set('comments', data.comments);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    return this.http.post(`${this.WebApiUrl}CAM/UpdateBasicDetails`, body.toString(), { headers });
  }


  commonSendForApproval(frm: string, to: string, id: number, module: string) {
    return this.http.post(`${this.WebApiUrl}/Nursery/CommonSendForApproval?frm=${frm}&to=${to}&id=${id}&module=${module}`, {});
  }

  commonReject(frm: string, rejComments: string, id: number, module: string) {
    return this.http.post(`${this.WebApiUrl}/Nursery/CommonReject?frm=${frm}&rejectComments=${rejComments}&id=${id}&module=${module}`, {});
  }

  commonApprovedByRangeo(id: number, module: string) {
    return this.http.post(`${this.BASE_URL}/CommonApprovedByRangeo?id=${id}&module=${module}`, {});
  }

  getCatchmentImage(id: number, imageName: string) {
    const url = `${this.WebApiUrl}Nursery/GetNurseryImage?id=${id}&imageName=${imageName}&tableName=catchment_smc_basicdetails`;
    return this.http.get(url);
  }
  GetUserLookup(): Observable<any> {
    let apiUrl = this.WebApiUrl + '/Management/GetallLookUp';
    return this.http.get<any>(
      apiUrl
    );
  }
  GetAllJurisdictionList(): Observable<any> {
    let apiUrl = this.BASE_URL + '/GetAllGeo';
    return this.http.get<any>(
      apiUrl
    );
  }
  insertUsermanagementdetails(User: any) {
    return this.http.post<any>(
      this.BASE_URL + `/AddUser`,
      User
    );
  }
  AssignJuridiction(userJuri: any) {
    return this.http.post<any>(
      this.BASE_URL + `/AssignJurisdiction`,
      userJuri
    );
  }

  getuserdetails(username: any) {
    return this.http.get<any>(
      this.BASE_URL + `/Getuserdetails?username=${username}`
    );
  }
  getaUserManagmentlist(): Observable<any> {
    let apiUrl = this.WebApiUrl + 'Management/GetallUserList';
    return this.http.get<any>(
      apiUrl
    );
  }


  getAllCatchmentTechnicalDetails(userId: string): Observable<any> {
    return this.http.get(`${this.BASE_URL}/GetAllCatchmentTechnicalDetails?userid=${userId}`);
  }

  updateTechnicalDetails(data: any): Observable<any> {
    const body = new HttpParams()
      .set('Id', data.Id)
      .set('dim_top_length', data.dim_top_length || '')
      .set('dim_top_width', data.dim_top_width || '')
      .set('dim_bot_length', data.dim_bot_length || '')
      .set('dim_bot_width', data.dim_bot_width || '')
      .set('dim_slant_height', data.dim_slant_height || '')
      .set('spli_length', data.spli_length || '')
      .set('spli_top_width', data.spli_top_width || '')
      .set('spli_bot_width', data.spli_bot_width || '')
      .set('spli_bot_height', data.spli_bot_height || '')
      .set('estimated_cost', data.estimated_cost || '')
      .set('comments', data.comments || '');

    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    return this.http.post(`${this.WebApiUrl}/CAM/UpdateTechnicalDetails`, body.toString(), { headers });
  }

  getTechnicalImage(id: number, imageName: string) {
    const url = `${this.WebApiUrl}Nursery/GetNurseryImage?id=${id}&imageName=${imageName}&tableName=catchment_smc_technical_details`;
    return this.http.get<any>(url);
  }


  getCatchmentTechnicalPdf(id: number): Observable<any> {
    const url = `${this.WebApiUrl}/CAM/GetCatchmentTechnicalPdf?id=${id}`;
    return this.http.get(url);
  }

  getAllCatchmentImplementation(userid: string) {
    return this.http.get(`${this.BASE_URL}/GetAllCatchmentImplementation?userid=${userid}`);
  }

  getNurseryImage(id: number, imageName: string, tableName: string) {
    const url = `${this.WebApiUrl}Nursery/GetNurseryImage?id=${id}&imageName=${imageName}&tableName=${tableName}`;
    return this.http.get<any>(url);
  }

  updateImplementationDetails(data: any) {
    return this.http.post(`${this.WebApiUrl}CAM/UpdateImplementationDetails`, data);
  }

  getCatchmentImplementationPdf(id: number): Observable<Blob> {
    const url = `${this.WebApiUrl}/CAM/GetCatchmentImplementationPdf?id=${id}`;
    return this.http.get(url, { responseType: 'blob' });
  }

  getAllCatchmentMonitoring(userid: string) {
    return this.http.get(`${this.WebApiUrl}/CAM/GetAllCatchmentMonitoring?userid=${userid}`);
  }

  gettMonitoringImage(id: number, imageName: string, tableName: string) {
    const url = `${this.WebApiUrl}Nursery/GetNurseryImage?id=${id}&imageName=${imageName}&tableName=${tableName}`;
    return this.http.get<any>(url);
  }

  updateCatchmentMonitoringDetails(data: any) {
    return this.http.post(`${this.WebApiUrl}CAM/UpdateMonitoringDetails`, data);
  }

  getAllCatchmentAssets(userid: string) {
    return this.http.get(`${this.WebApiUrl}/CAM/GetAllCatchmentAssets?userid=${userid}`);
  }

  getAssetImage(id: number, imageName: string, tableName: string) {
    const url = `${this.WebApiUrl}Nursery/GetNurseryImage?id=${id}&imageName=${imageName}&tableName=${tableName}`;
    return this.http.get<any>(url);
  }

  updateAssetUpdationDetails(data: any) {
    return this.http.post(`${this.WebApiUrl}CAM/UpdateAssetUpdationDetails`, data);
  }

  getCatchmentSmcSiteSuitability(userid: string) {
    return this.http.get(`${this.BASE_URL}/GetCatchmentSmcSiteSuitability?userid=${userid}`);
  }

  getSiteSuitabilityImage(id: number, imageName: string, tableName: string) {
    const url = `${this.WebApiUrl}Nursery/GetNurseryImage?id=${id}&imageName=${imageName}&tableName=${tableName}`;
    return this.http.get<any>(url);
  }
  updateSmcSiteSuitabilityDetails(data: any) {
    const url = `${this.BASE_URL}/CommonUpdates`;
    return this.http.post(url, data);
  }
  commonUpdates(module: string, payload: any) {
    const url = `${this.BASE_URL}/CommonUpdates`;
    return this.http.post(url, { module, payload });
  }

  getCatchmentReadingControlTreatment(userid: string) {
    const url = `${this.BASE_URL}/GetAllCatchmentReadingControlTreatment?userid=${userid}`;
    return this.http.get(url);
  }

  getTreatmentImage(id: number, imageName: string, tableName: string) {
    const url = `${this.WebApiUrl}Nursery/GetNurseryImage?id=${id}&imageName=${imageName}&tableName=${tableName}`;
    return this.http.get<any>(url);
  }

  getCatchmentMeasurPiezo(userid: string) {
    const url = `${this.WebApiUrl}CAM/GetAllCatchmentCatchmentMeasurPiezo?userid=${userid}`;
    return this.http.get(url);
  }

  getPiezoImage(id: number, imageName: string, tableName: string) {
    const url = `${this.WebApiUrl}Nursery/GetNurseryImage?id=${id}&imageName=${imageName}&tableName=${tableName}`;
    return this.http.get<any>(url);
  }

  getAllCatchmentWeatherData(userid: string) {
    return this.http.get(`${this.WebApiUrl}/CAM/GetAllCatchmentWeatherData?userid=${userid}`);
  }

  getWeatherImage(id: number, imageName: string, tableName: string) {
    const url = `${this.WebApiUrl}Nursery/GetNurseryImage?id=${id}&imageName=${imageName}&tableName=${tableName}`;
    return this.http.get<any>(url);
  }

  getLivelihoodDashboardData(beat?: string, jfmc_no?: string, fromDate?: string, toDate?: string): Observable<any> {
    let params = new HttpParams();
    if (beat) params = params.set('beat', beat);
    if (jfmc_no) params = params.set('jfmc_no', jfmc_no);
    if (fromDate) params = params.set('fromDate', fromDate);
    if (toDate) params = params.set('toDate', toDate);

    return this.http.get<any>(`${this.WebApiUrl}/Livelihood/GetLivelihoodDashboardData`, { params });
  }

  getEcotourismSiteSelection(userid: string) {
    return this.http.get(`${this.WebApiUrl}EcoTourism/GetEcotourismSiteSelection?userid=${userid}`);
  }

  // Hardcoded the tableName to "eco_tourism_site_selection" based on your URL
  getEcoTourismImage(id: number, imageName: string, tableName: string) {
    const url = `${this.WebApiUrl}Nursery/GetNurseryImage?id=${id}&imageName=${imageName}&tableName=${tableName}`;
    return this.http.get<any>(url);
  }

  updateEcoTourismDetails(data: any) {
    return this.http.post(`${this.WebApiUrl}EcoTourism/UpdateEcoTourismDetails`, data);
  }

  getEcotourismHomestaySite(userid: string) {
    return this.http.get(`${this.WebApiUrl}EcoTourism/GetEcotourismHomestaySite?userid=${userid}`);
  }

  getEcoTourismHomestayImage(id: number, imageName: string, tableName: string) {
    const url = `${this.WebApiUrl}Nursery/GetNurseryImage?id=${id}&imageName=${imageName}&tableName=${tableName}`;
    return this.http.get<any>(url);
  }

  updateEcoHomestayData(data: any) {
    return this.http.post(`${this.WebApiUrl}EcoTourism/UpdateEcoHomestayData`, data);
  }

  getEcotourismFacilities(userid: string) {
    return this.http.get(`${this.WebApiUrl}EcoTourism/GetEcotourismFacilities?userid=${userid}`);
  }

  getEcoTourismFacilityImage(id: number, imageName: string, tableName: string) {
    const url = `${this.WebApiUrl}Nursery/GetNurseryImage?id=${id}&imageName=${imageName}&tableName=${tableName}`;
    return this.http.get<any>(url);
  }

  updateFacilityData(data: any) {
    return this.http.post(`${this.WebApiUrl}EcoTourism/UpdateFacilityData`, data);
  }

  getEcotourismCreation(userid: string) {
    return this.http.get(`${this.WebApiUrl}EcoTourism/GetEcotourismCreation?userid=${userid}`);
  }

  getEcoTourismCreationImage(id: number, imageName: string, tableName: string) {
    const url = `${this.WebApiUrl}Nursery/GetNurseryImage?id=${id}&imageName=${imageName}&tableName=${tableName}`;
    return this.http.get<any>(url);
  }

  updateEcoCreationData(data: any) {
    return this.http.post(`${this.WebApiUrl}EcoTourism/UpdateEcoCreationData`, data);
  }

  getEcotourismMonitoring(userid: string) {
    return this.http.get(`${this.WebApiUrl}EcoTourism/GetEcotourismMonitoring?userid=${userid}`);
  }

  getEcoTourismMonitoringImage(id: number, imageName: string, tableName: string) {
    const url = `${this.WebApiUrl}Nursery/GetNurseryImage?id=${id}&imageName=${imageName}&tableName=${tableName}`;
    return this.http.get<any>(url);
  }

  updateMonitorData(data: any) {
    return this.http.post(`${this.WebApiUrl}EcoTourism/UpdateMonitorData`, data);
  }
  //double check
  insertEcotourismMarketOutreach(data: any) {
    return this.http.post(`${this.WebApiUrl}EcoTourism/InsertEcotourismMarketOutreach`, data);
  }

  getImageEcotourismMarketOutreach(id: number, imageName: string) {
    const url = `${this.WebApiUrl}EcoTourism/GetImageEcotourismMarketOutreach?id=${id}&image_name=${imageName}`;
    return this.http.get<any>(url);
  }

  getEcotourismMarketOutreach() {
    return this.http.get(`${this.WebApiUrl}EcoTourism/GetEcotourismMarketOutreach`);
  }

  getLivestockAfFieldDetails(userid: string) {
    return this.http.get(`${this.WebApiUrl}AgroForestry/GetLivestockAfFieldDetails?userid=${userid}`);
  }

  getLivestockAfFieldImage(id: number, imageName: string, tableName: string) {
    const url = `${this.WebApiUrl}Nursery/GetNurseryImage?id=${id}&imageName=${imageName}&tableName=${tableName}`;
    return this.http.get<any>(url);
  }

  updateAgroFieldDetails(data: any) {
    return this.http.post(`${this.WebApiUrl}AgroForestry/UpdateAgroFieldDetails`, data);
  }

  getLivestockAfSurvey(userid: string) {
    return this.http.get(`${this.WebApiUrl}AgroForestry/GetLivestockAfSurvey?userid=${userid}`);
  }

  getLivestockAfSurveyImage(id: number, imageName: string, tableName: string) {
    const url = `${this.WebApiUrl}Nursery/GetNurseryImage?id=${id}&imageName=${imageName}&tableName=${tableName}`;
    return this.http.get<any>(url);
  }

  updateAgroSurveyDetails(data: any) {
    return this.http.post(`${this.WebApiUrl}AgroForestry/UpdateAgroSurveyDetails`, data);
  }

  getLivestockPlantCreation(userid: string) {
    return this.http.get(`${this.WebApiUrl}AgroForestry/GetLivestockPlantCreation?userid=${userid}`);
  }

  getLivestockAgroPlantationImage(id: number, imageName: string, tableName: string) {
    const url = `${this.WebApiUrl}Nursery/GetNurseryImage?id=${id}&imageName=${imageName}&tableName=${tableName}`;
    return this.http.get<any>(url);
  }

  updateAgroPlantationDetails(data: any) {
    return this.http.post(`${this.WebApiUrl}AgroForestry/UpdateAgroPlantationDetails`, data);
  }
  getLivestockAfResurvey(userid: string) {
    return this.http.get(`${this.WebApiUrl}AgroForestry/GetLivestockAfResurvey?userid=${userid}`);
  }

  getLivestockAfResurveyImage(id: number, imageName: string, tableName: string) {
    const url = `${this.WebApiUrl}Nursery/GetNurseryImage?id=${id}&imageName=${imageName}&tableName=${tableName}`;
    return this.http.get<any>(url);
  }

  updateReSurveyDetails(data: any) {
    return this.http.post(`${this.WebApiUrl}AgroForestry/UpdateReSurveyDetails`, data);
  }
  getLivestockAfProduction(userid: string) {
    return this.http.get(`${this.WebApiUrl}AgroForestry/GetLivestockAfProduction?userid=${userid}`);
  }

  getLivestockAfProductionImage(id: number, imageName: string, tableName: string) {
    const url = `${this.WebApiUrl}Nursery/GetNurseryImage?id=${id}&imageName=${imageName}&tableName=${tableName}`;
    return this.http.get<any>(url);
  }

  updateProductionDetails(data: any) {
    return this.http.post(`${this.WebApiUrl}AgroForestry/UpdateProductionDetails`, data);
  }

  getLivestockAfMaintenence(userid: string) {
    return this.http.get(`${this.WebApiUrl}AgroForestry/GetLivestockAfMaintenence?userid=${userid}`);
  }

  getLivestockAfMaintenenceImage(id: number, imageName: string, tableName: string) {
    const url = `${this.WebApiUrl}Nursery/GetNurseryImage?id=${id}&imageName=${imageName}&tableName=${tableName}`;
    return this.http.get<any>(url);
  }

  updateMaintanaceDetails(data: any) {
    return this.http.post(`${this.WebApiUrl}AgroForestry/UpdateMaintanaceDetails`, data);
  }


  getEcotourismInstitutionalFramework() {
    return this.http.get(`${this.WebApiUrl}/EcoTourism/GetEcotourismInstitutionalFramework`);
  }

  insertEcotourismInstitutionalFramework(data: any) {
    return this.http.post(`${this.WebApiUrl}EcoTourism/InsertEcotourismInstitutionalFramework`, data);
  }

  getImagesEcotourismInstitutionalFramework(id: number, colName: string) {
    const url = `${this.WebApiUrl}EcoTourism/GetImagesEcotourismInstitutionalFramework?id=${id}&image_name=${colName}`;
    return this.http.get<any>(url);
  }

  getLiveStockMaster(userid: string) {
    return this.http.get(`${this.WebApiUrl}Livestock/GetLiveStockMaster?userid=${userid}`);
  }

  GetUserJurisdictions(userId: number): Observable<any> {
    return this.http.get<any>(
      this.BASE_URL + `/GetUserJurisdictions?userId=${userId}`
    );
  }

  getLiveStockImage(id: number, imageName: string, tableName: string) {
    const url = `${this.WebApiUrl}Nursery/GetNurseryImage?id=${id}&imageName=${imageName}&tableName=${tableName}`;
    return this.http.get<any>(url);
  }

  updateLivestockDetails(data: any) {
    return this.http.post(`${this.WebApiUrl}Livestock/UpdateLivestockDetails`, data);
  }

  getLiveStockMonitor(userid: string) {
    return this.http.get(`${this.WebApiUrl}Livestock/GetLiveStockMonitor?userid=${userid}`);
  }

  getLiveStockMonitorImage(id: number, imageName: string, tableName: string) {
    const url = `${this.WebApiUrl}Nursery/GetNurseryImage?id=${id}&imageName=${imageName}&tableName=${tableName}`;
    return this.http.get<any>(url);
  }

  updateLivestockMonitoringDetails(data: any) {
    return this.http.post(`${this.WebApiUrl}Livestock/UpdateLivestockMonitoringDetails`, data);
  }

  getLiveStockStockPosition(userid: string) {
    return this.http.get(`${this.WebApiUrl}Livestock/GetLiveStockStockPosition?userid=${userid}`);
  }

  getLiveStockStockPositionImage(id: number, imageName: string, tableName: string) {
    const url = `${this.WebApiUrl}Nursery/GetNurseryImage?id=${id}&imageName=${imageName}&tableName=${tableName}`;
    return this.http.get<any>(url);
  }

  updateStockPositionDetails(data: any) {
    return this.http.post(`${this.WebApiUrl}Livestock/UpdateStockPositionDetails`, data);
  }

  getFiCheckdamDetails(userid: string) {
    return this.http.get(`${this.WebApiUrl}LivestockFisheries/GetFiCheckdamDetails?userid=${userid}`);
  }

  getFiCheckdamImage(id: number, imageName: string, tableName: string) {
    const url = `${this.WebApiUrl}Nursery/GetNurseryImage?id=${id}&imageName=${imageName}&tableName=${tableName}`;
    return this.http.get<any>(url);
  }
  updateFiCheckdamDetails(data: any) {
    return this.http.post(`${this.WebApiUrl}LivestockFisheries/UpdateFiCheckdamDetails`, data);
  }

  getFiSpeciesDetails(userid: string) {
    return this.http.get(`${this.WebApiUrl}LivestockFisheries/GetFiSpeciesDetails?userid=${userid}`);
  }

  getFiSpeciesImage(id: number, imageName: string, tableName: string) {
    const url = `${this.WebApiUrl}Nursery/GetNurseryImage?id=${id}&imageName=${imageName}&tableName=${tableName}`;
    return this.http.get<any>(url);
  }

  updateFiSpeciesDetails(data: any) {
    return this.http.post(`${this.WebApiUrl}LivestockFisheries/UpdateFiSpeciesDetails`, data);
  }

  getFiProductionDetails(userid: string) {
    return this.http.get(`${this.WebApiUrl}LivestockFisheries/GetFiProductionDetails?userid=${userid}`);
  }

  getFiProductionImage(id: number, imageName: string, tableName: string) {
    const url = `${this.WebApiUrl}Nursery/GetNurseryImage?id=${id}&imageName=${imageName}&tableName=${tableName}`;
    return this.http.get<any>(url);
  }

  updateFiProductionDetails(data: any) {
    return this.http.post(`${this.WebApiUrl}LivestockFisheries/UpdateFiProductionDetails`, data);
  }
  getFiTargetDetails(userid: string) {
    return this.http.get(`${this.WebApiUrl}LivestockFisheries/GetFiTargetDetails?userid=${userid}`);
  }

  getFiTargetImage(id: number, imageName: string, tableName: string) {
    const url = `${this.WebApiUrl}Nursery/GetNurseryImage?id=${id}&imageName=${imageName}&tableName=${tableName}`;
    return this.http.get<any>(url);
  }

  updateFiTargetDetails(data: any) {
    return this.http.post(`${this.WebApiUrl}LivestockFisheries/UpdateFiTargetDetails`, data);
  }

  getNtfpBasedCreation(userid: string) {
    return this.http.get(`${this.WebApiUrl}Livelihood/GetNtfpBasedCreation?userid=${userid}`);
  }

  getNtfpImage(id: number, imageName: string, tableName: string) {
    const url = `${this.WebApiUrl}Nursery/GetNurseryImage?id=${id}&imageName=${imageName}&tableName=${tableName}`;
    return this.http.get<any>(url);
  }

  updateNtfpBasedCreation(data: any) {
    return this.http.post(`${this.WebApiUrl}Livelihood/UpdateNtfpBasedCreation`, data);
  }
  getNtfpBasedHarvesting(userid: string) {
    return this.http.get(`${this.WebApiUrl}Livelihood/GetNtfpBasedHarvesting?userid=${userid}`);
  }

  getNtfpHarvestingImage(id: number, imageName: string, tableName: string) {
    const url = `${this.WebApiUrl}Nursery/GetNurseryImage?id=${id}&imageName=${imageName}&tableName=${tableName}`;
    return this.http.get<any>(url);
  }

  updateNtfpBasedHarvesting(data: any) {
    return this.http.post(`${this.WebApiUrl}Livelihood/UpdateNtfpBasedHarvesting`, data);
  }
  getNtfpBasedProduction(userid: string) {
    return this.http.get(`${this.WebApiUrl}Livelihood/GetNtfpBasedProduction?userid=${userid}`);
  }

  getNtfpProductionImage(id: number, imageName: string, tableName: string) {
    const url = `${this.WebApiUrl}Nursery/GetNurseryImage?id=${id}&imageName=${imageName}&tableName=${tableName}`;
    return this.http.get<any>(url);
  }

  updateNtfpBasedProduction(data: any) {
    return this.http.post(`${this.WebApiUrl}Livelihood/UpdateNtfpBasedProduction`, data);
  }

  getNtfpLivelihoodDashboardData(beat?: string, jfmc_no?: string): Observable<any> {
    let params = new HttpParams();
    if (beat && beat.trim()) { params = params.set('beat', beat); }
    if (jfmc_no && jfmc_no.trim()) { params = params.set('jfmc_no', jfmc_no); }

    return this.http.get<any>(`${this.WebApiUrl}/Livelihood/GetLivelihoodDashboardData`, { params });
  }

  getAssetCreation(userid: string) {
    return this.http.get(`${this.BASE_URL}/GetAllAssetdetails?userid=${userid}`);
  }

  getAssetCreationImage(id: number, imageName: string, tableName: string) {
    const url = `${this.WebApiUrl}Nursery/GetNurseryImage?id=${id}&imageName=${imageName}&tableName=${tableName}`;
    return this.http.get<any>(url);
  }

  getAssetVehCreationImage(id: number, imgName: string) {
    return this.http.get(`${this.WebApiUrl}ProjectMgmt/GetAssetVehCreationImage?id=${id}&imgName=${imgName}`);
  }
  getAssetMaintenance(userid: string) {
    return this.http.get(`${this.BASE_URL}/GetAssetMaintenence?userid=${userid}`);
  }

  getAssetMaintenanceImage(id: number, imageName: string, tableName: string) {
    const url = `${this.WebApiUrl}Nursery/GetNurseryImage?id=${id}&imageName=${imageName}&tableName=${tableName}`;
    return this.http.get<any>(url);
  }

  getAssetVehMaintenanceImage(id: number) {
    return this.http.get(`${this.WebApiUrl}ProjectMgmt/GetAssetVehMaintenence?id=${id}`);
  }

  getNtfpResourceRegenerate(userid: string) {
    return this.http.get(`${this.WebApiUrl}CatchmentNtfp/GetNtfpResourceRegenerate?userid=${userid}`);
  }

  getNtfpResourceRegenerateImage(id: number, imageName: string, tableName: string) {
    const url = `${this.WebApiUrl}Nursery/GetNurseryImage?id=${id}&imageName=${imageName}&tableName=${tableName}`;
    return this.http.get<any>(url);
  }
  getNtfpResourceHarvesting(userid: string) {
    return this.http.get(`${this.WebApiUrl}CatchmentNtfp/GetNtfpResourceHarvesting?userid=${userid}`);
  }

  getNtfpResourceHarvestingImage(id: number, imageName: string, tableName: string) {
    const url = `${this.WebApiUrl}Nursery/GetNurseryImage?id=${id}&imageName=${imageName}&tableName=${tableName}`;
    return this.http.get<any>(url);
  }
  getNtfpResourceMap(userid: string) {
    return this.http.get(`${this.WebApiUrl}CatchmentNtfp/GetNtfpResourceMap?userid=${userid}`);
  }

  getNtfpResourceMapImage(id: number, imageName: string, tableName: string) {
    const url = `${this.WebApiUrl}Nursery/GetNurseryImage?id=${id}&imageName=${imageName}&tableName=${tableName}`;
    return this.http.get<any>(url);
  }
  getNtfpMarketingSales(userid: string) {
    return this.http.get(`${this.WebApiUrl}CatchmentNtfp/GetNtfpMarketingSales?userid=${userid}`);
  }

  getNtfpMarketingSalesImage(id: number, imageName: string, tableName: string) {
    const url = `${this.WebApiUrl}Nursery/GetNurseryImage?id=${id}&imageName=${imageName}&tableName=${tableName}`;
    return this.http.get<any>(url);
  }
  getNtfpProcessQualityControl(userid: string) {
    return this.http.get(`${this.WebApiUrl}CatchmentNtfp/GettNtfpProcessQualityControl?userid=${userid}`);
  }

  getNtfpProcessQualityControlImage(id: number, imageName: string, tableName: string) {
    const url = `${this.WebApiUrl}Nursery/GetNurseryImage?id=${id}&imageName=${imageName}&tableName=${tableName}`;
    return this.http.get<any>(url);
  }
  getNtfpDetailedCollection(userid: string) {
    return this.http.get(`${this.WebApiUrl}CatchmentNtfp/GetNtfpDetailedNtfpCollection?userid=${userid}`);
  }

  getNtfpDetailedCollectionImage(id: number, imageName: string, tableName: string) {
    const url = `${this.WebApiUrl}Nursery/GetNurseryImage?id=${id}&imageName=${imageName}&tableName=${tableName}`;
    return this.http.get<any>(url);
  }
  getNtfpExhibitionFair(userid: string) {
    return this.http.get(`${this.WebApiUrl}CatchmentNtfp/GetNtfpExibitionFair?userid=${userid}`);
  }

  getNtfpExhibitionFairImage(id: number, imageName: string, tableName: string) {
    const url = `${this.WebApiUrl}Nursery/GetNurseryImage?id=${id}&imageName=${imageName}&tableName=${tableName}`;
    return this.http.get<any>(url);
  }
  // ==========================================
  // CATCHMENT NTFP - CCFC CENTER
  // ==========================================

  getJurisdictionByUser(userid: any) {
    return this.http.get(`${this.WebApiUrl}Management/GetJurisdictionByUser?userid=${userid}`);
  }

  getJfmclistByJurisdiction(beats: string) {
    // Ensure the slash is handled correctly
    return this.http.get(`${this.WebApiUrl}Jfmc/GetAllJfmclistByJurisdiction?beats=${beats}`);
  }




  // ==========================================
  // SHG & JLG - RELATION DETAILS
  // ==========================================

  getAllShgRelDetails(shgId: any) {
    return this.http.get(`${this.WebApiUrl}SHGJLG/GetAllShgRelDetails?shg_id=${shgId}`);
  }

  // 🟢 Management Services in ServerRequests.ts

  // 1. Register New User
  registerUserAsync(payload: any) {
    return this.http.post(`${this.WebApiUrl}Management/RegisterUserAsync`, payload);
  }

  // 2. Get All User List
  getallUserList() {
    return this.http.get(`${this.WebApiUrl}Management/GetallUserList`);
  }


  // 4. Update User Profile Info
  updateUserAsync(payload: any) {
    return this.http.post(`${this.BASE_URL}/UpdateUser`, payload);
  }

  // 5. Assign Jurisdiction
  assignJurisdiction(payload: any) {
    return this.http.post(`${this.BASE_URL}/AssignJurisdiction`, payload);
  }

  // 6. Block or Delete User (Update Status)
  updateUserStatusAsync(payload: any) {
    return this.http.post(`${this.BASE_URL}/UpdateUserStatus`, payload);
  }

  // 7. Reset Password
  resetUser(payload: any) {
    return this.http.post(`${this.WebApiUrl}Management/resetuser`, payload);
  }
  DeletehhChildShg(id: number, shg_id: any, hh_parent_id: any): Observable<any> {
    return this.http.post(`${this.WebApiUrl}SHGJLG/DeletehhChildShg?id=${id}&shg_id=${shg_id}&hh_parent_id=${hh_parent_id}`, {}, {
      responseType: 'text'
    });
  }

  // 2. Get Lookups
  getLookups() {
    return this.http.get(`${this.WebApiUrl}GetAllLookUp`);
  }

  // 3. Get Dashboard Stats
  getDashboardStats(districtId: number, years: number[]) {
    let params = new HttpParams().set('districtId', districtId.toString());
    years.forEach(y => {
      params = params.append('fyear', y.toString());
    });

    return this.http.get(
      `${this.WebApiUrl}/ProjectMgmt/GetAllDashboardData`,
      { params }
    );
  }

  // 4. Plantation by Beat
  getPlantationByBeat(beatId: any) {
    return this.http.get(
      `${this.WebApiUrl}ProjectMgmt/GetPlantationDetailsByBeatID?beatID=${beatId}`
    );
  }

  // 5. JFMC by Beat
  getJFMCByBeat(beats: string) {
    return this.http.get(
      `${this.BASE_URL}/GetAllJfmclistByJurisdiction?beats=${beats}`
    );
  }

  // 6. SHG by Beat
  getSHGByBeat(params: any) {
    return this.http.get(
      `${this.WebApiUrl}SHGJLG/ShGlISTbyBeat`,
      { params }
    );
  }

  // 7. Plantation Report Data (Updated)
  getPlantationReportData(pid: any, startDate: string = '', endDate: string = '') {
    let url = `${this.WebApiUrl}ProjectMgmt/GetPlantationDetailsByPlantationID?plantationid=${pid}`;

    if (startDate) {
      url += `&startDate=${startDate}`;
    }
    if (endDate) {
      url += `&endDate=${endDate}`;
    }

    return this.http.get(url);
  }


  // 8. JFMC Details
  getJFMCDetails(id: any) {
    return this.http.get(
      `${this.WebApiUrl}Jfmc/GetAllJFMCRelatedDetails?jfmc_id=${id}`
    );
  }

  // 9. SHG Details
  getSHGDetails(id: any) {
    return this.http.get(
      `${this.WebApiUrl}SHGJLG/GetAllShgRelDetails?shg_id=${id}`
    );
  }

  // 10. SMC Details
  getSMCDetails(beat: string, jfmcName: string) {
    return this.http.get(`${this.WebApiUrl}CAM/GetSmcDashboardData?beat=${beat}&jfmc_no=${jfmcName}`);
  }

  //  getJfmcSummaryStats(beat: string, jfmcNo: any) {
  //   return this.http.get(`${this.WebApiUrl}api/figs/GetJfmcDashboardData?beat=${beat}&jfmc_no=${jfmcNo}`);
  // }

  // getForestDashboardData(beat: string, jfmcNo: any, jfmcName: string) {
  //   return this.http.get(`${this.WebApiUrl}Plantation/GetForestDashboardData?beat=${beat}&jfmc_no=${jfmcNo}&jfmc_name=${jfmcName}`);
  // }

  // Add this to your services.ts
  getSpecialJfmcDashboardData(beat: string, jfmcNo: any) {
    const url = `${this.BASE_URL}/GetJfmcDashboardData?beat=${beat}&jfmc_no=${jfmcNo}`;
    return this.http.get(url);
  }
  getJFMCProfile(id: any) {
    return this.http.get(`${this.WebApiUrl}/Jfmc/GetAllJFMCRelatedDetails?jfmc_id=${id}`);
  }

  getSMCDashboardData(beat: string, jfmcName: string) {
    return this.http.get(`${this.WebApiUrl}/CAM/GetSmcDashboardData?beat=${beat}&jfmc_no=${jfmcName}`);
  }

  getSMCDimensions(id: any) {
    return this.http.get(`${this.WebApiUrl}/SMC/GetStructureDimentionById?id=${id}`);
  }

  getSMCMonitoring(id: any, start: string, end: string) {
    return this.http.get(`${this.WebApiUrl}/SMC/GetMonitorbystructId?id=${id}&startDate=${start}&endDate=${end}`);
  }
  getNurseryAllDetails(beatId: any, start: string, end: string) {
    return this.http.get(`${this.WebApiUrl}/Nursery/GetNurseyAllDetailsByBeat?beat=${beatId}&startDate=${start}&endDate=${end}`);
  }


  insertNtfpCcfcCenter(data: any) {
    return this.http.post(`${this.BASE_URL}/InsertNtfpCreateCenter`, data);
  }

  // For fetching created center details
  getNtfpCreateCenter() {
    return this.http.get(`${this.BASE_URL}/GetNtfpCreateCenter`);
  }

  // Inside your ServerRequests service
  getNtfpOutletCraft() {
    return this.http.get(`${this.BASE_URL}/GetNtfpOutletCraft`);
  }
  insertNtfpOutletCraft(payload: any) {
    return this.http.post(`${this.WebApiUrl}/CatchmentNtfp/InsertNtfpOutletCraft`, payload);
  }

  // 1. Service to Fetch (GET) Table Data
  getNtfpOutletCraftMonitor() {
    return this.http.get(`${this.BASE_URL}/GetNtfpOutletCraftMonitor`);
  }

  // 2. Service to Save (POST) New Records
  insertNtfpOutletCraftMonitor(payload: any) {
    return this.http.post(`${this.BASE_URL}/InsertNtfpOutletCraftMonitor`, payload);
  }

  /**
   * Upload Excel data to the DataDump endpoint
   * @param fileData Object containing file name and base64 content
   * @returns Observable with the server response
   */
  uploadDataDump(fileData: { fileName: string; fileContent: string }): Observable<any> {
    const payload = {
      fileName: fileData.fileName,
      fileContent: fileData.fileContent
    };

    return this.http.post<any>(
      `${this.BASE_URL}/DataDump`,
      payload
    );
  }



  GetmontoringReport(beat: string, range: string, sub_district: string, district: string, date: any) {
    const url = `${this.WebApiUrl}/MonitoringDashboard/GetmontoringReport?beat=${beat}&range=${range}&sub_district=${sub_district}&district=${district}&Date=${date}`;

    return this.http.get<any>(url);
  }

  Getsubmoduleforms(submodule: string) {
    return this.http.get<any>(
      `${this.WebApiUrl}/MonitoringDashboard/Getsubmoduleforms?submodulename=${submodule}`
    );
  }

  GetFormsData(submoduleName: string, date: string, scheme: string, forms: string) {

    const params = {
      submodulename: submoduleName,
      date: date,
      scheme: scheme,
      forms: forms
    };

    return this.http.get<any>(
      `${this.WebApiUrl}MonitoringDashboard/GetFormsData`,
      { params }
    );
  }

  InsertRecords(status: string, remarks: string, subModuleName: string, moduleName: string, formName: string, date: string, id: any) {
    return this.http.get<any>(
      `${this.WebApiUrl}/MonitoringDashboard/InsertRecords?Status=${status}&Remarks=${remarks}&SubModuleName=${subModuleName}&ModuleName=${moduleName}&FormName=${formName}&Date=${date}&module_id=${id}`
    );
  }


  getTechnicalPdfUrl(id: string): string {
    return `${this.WebApiUrl}SMC/GetTechnicalDestailsPdf?id=${id}`;
  }
  getModulesByDesignation(designationId: number) {
    return this.http.get<any[]>(
      `${this.BASE_URL}/GetModulesByDesignation/${designationId}`
    );
  }
  insertSecurityUsers(payload: { ParentModule: string, Submodule: string, ChildModule: string, designation_id: number, landingpage: string }) {
    return this.http.post(this.BASE_URL + '/InsertSecurityUsers', payload);
  }


  Getjuridictiondetails(payload: any) {
    return this.http.post(
      `${this.BASE_URL}/JuridictionAssigned`,
      payload
    );
  }

  getAttendenceDetails(): Observable<any> {
    return this.http.get<any>(`${this.WebApiUrl}ProjectMgmt/GetAllAttendenceDetails`);
  }
  getmontoringdata(payload: any): Observable<any> {
    return this.http.post(
      `${this.BASE_URL}/getmontoringremarkdata`,
      payload
    );
  }
  commonuploadPdf(payload: any): Observable<any> {
    return this.http.post<any>(
      `${this.BASE_URL}/uploadmodulewisepdf`,
      payload
    );

  }
  downloadpdf(payload: any): Observable<any> {
  return this.http.post<any>(
    `${this.BASE_URL}/Download_pdf`,
    payload
  );
}
 
 
uploadRegulationPdf(payload: any): Observable<any> {
  return this.http.post<any>(
    `${this.WebApiUrl}SHGJLG/UploadRegulationPdf`,
    payload
  );
}
checkGradationPdfExists(id: number): Observable<any> {
  return this.http.get<any>(
    `${this.WebApiUrl}SHGJLG/CheckGradationPdfExists?id=${id}`
  );
}
 
checkRegulationPdfExists(id: number): Observable<any> {
  return this.http.get<any>(
    `${this.WebApiUrl}SHGJLG/CheckRegulationPdfExists?id=${id}`
  );
}
uploadBusinessPlanPdf(formData: FormData): Observable<any> {
  return this.http.post<any>(
    `${this.WebApiUrl}SHGJLG/UploadBusinessPlanPdf`,
    formData
  );
}
 
uploadSmcImplementationPdf(formData: FormData): Observable<any> {
  return this.http.post<any>(
    `${this.WebApiUrl}SMC/UploadSmcImplementationPdf`,
    formData
  );
}
 
getSmcImplementationPdf(id: number): Observable<Blob> {
  return this.http.get(
    `${this.WebApiUrl}SMC/GetSmcImplementationPdf?id=${id}`,
    { responseType: 'blob' }
  );
}
 
uploadCatchmentTechnicalPdf(formData: FormData): Observable<any> {
  return this.http.post<any>(
    `${this.WebApiUrl}CAM/UploadCatchmentTechnicalPdf`,
    formData
  );
}
uploadSmcTechnicalPdf(formData: FormData): Observable<any> {
  return this.http.post<any>(
    `${this.WebApiUrl}SMC/UploadSmcTechnicalPdf`,
    formData
  );
}
 
uploadMasterRollPdf(formData: FormData): Observable<any> {
  return this.http.post<any>(
    `${this.WebApiUrl}CAM/UploadMasterRollPdf`,
    formData
  );
}
}














