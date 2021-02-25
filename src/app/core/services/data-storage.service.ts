import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';

import * as appConstants from '../../app.constants';
import { AppConfigService } from '../../app-config.service';
import { Applicant } from '../../shared/models/dashboard-model/dashboard.modal';
import { ConfigService } from './config.service';
import { RequestModel} from 'src/app/shared/models/request-model/RequestModel';
import { RequestModelSendOtp} from 'src/app/shared/models/request-model/RequestModelSendOtp';
import { RequestModelServices } from 'src/app/shared/models/request-model/RequestModelServices';
import { RequestModelForAuth } from 'src/app/shared/models/request-model/request-modelForAuth'
import Utils from 'src/app/app.util';

/**
 * @description This class is responsible for sending or receiving data to the service.
 *
 * @author Shashank Agrawal
 * @export
 * @class DataStorageService
 */
@Injectable({
  providedIn: 'root'
})
export class DataStorageService {
  /**
   * @description Creates an instance of DataStorageService.
   * @see HttpClient
   * @param {HttpClient} httpClient
   * @param {AppConfigService} appConfigService
   * @param {ConfigService} configService
   * @memberof DataStorageService
   */
  constructor(
    private httpClient: HttpClient,
    private appConfigService: AppConfigService,
    private configService: ConfigService
  ) {}

  BASE_URL = this.appConfigService.getConfig()['BASE_URL'];
  PRE_REG_URL = this.appConfigService.getConfig()['PRE_REG_URL'];
  MISP_LicenseKey = this.appConfigService.getConfig()['MISP-LicenseKey']
  Partner_ID = this.appConfigService.getConfig()['Partner-ID']
  Partner_Api_Key = this.appConfigService.getConfig()['Partner-Api-Key']

  userIdUpdateDemo:string;
  otpUpdateDemo:string;
  idTypeUpdateDemo:string;

  getUsers(userId: string) {
    let url = this.BASE_URL + this.PRE_REG_URL + appConstants.APPEND_URL.applicants;
    return this.httpClient.get<Applicant[]>(url);
  }

  /**
   * @description This method returns the user details for the given pre-registration id.
   *
   * @param {string} preRegId - pre-registartion-id
   * @returns an `Observable` of the body as an `Object`
   * @memberof DataStorageService
   */
  getUser(preRegId: string) {
    let url = this.BASE_URL + this.PRE_REG_URL + appConstants.APPEND_URL.applicants + appConstants.APPENDER + preRegId;
    return this.httpClient.get(url);
  }

  /**
   * @description This methos returns the list of available genders
   *
   *
   * @returns an `Observable` of the body as an `Object`
   * @memberof DataStorageService
   */
  getGenderDetails() {
    const url = this.BASE_URL + appConstants.APPEND_URL.gender;
    return this.httpClient.get(url);
  }

  /**
   * @description This methos returns the list of available genders
   *
   *
   * @returns an `Observable` of the body as an `Object`
   * @memberof DataStorageService
   */
  getResidentDetails() {
    const url = this.BASE_URL + appConstants.APPEND_URL.resident;
    return this.httpClient.get(url);
  }

  /**
   * @description This method is responsible for doing the transliteration for a given word.
   *
   * @param {*} request
   * @returns an `Observable` of the body as an `Object`
   * @memberof DataStorageService
   */
  getTransliteration(request: any) {
    const obj = new RequestModel(appConstants.IDS.transliteration, request);
    const url = this.BASE_URL + this.PRE_REG_URL + appConstants.APPEND_URL.transliteration;
    return this.httpClient.post(url, obj);
  }

  getUserDocuments(preRegId) {
    return this.httpClient.get(this.BASE_URL + this.PRE_REG_URL + appConstants.APPEND_URL.document + preRegId);
  }

  /**
   * @description This method adds the user
   *
   * @param {*} identity `Object`
   * @returns an `Observable` of the body as an `Object`
   * @memberof DataStorageService
   */
  addUser(identity: any) {
    const obj = new RequestModel(appConstants.IDS.newUser, identity);
    let url = this.BASE_URL + this.PRE_REG_URL + appConstants.APPEND_URL.applicants;
    return this.httpClient.post(url, obj);
  }

  updateUser(identity: any, preRegId: string) {
    let url = this.BASE_URL + this.PRE_REG_URL + appConstants.APPEND_URL.applicants + appConstants.APPENDER + preRegId;
    const obj = new RequestModel(appConstants.IDS.updateUser, identity);
    return this.httpClient.put(url, obj);
  }

  sendFile(formdata: FormData, preRegId: string) {
    return this.httpClient.post(
      this.BASE_URL + this.PRE_REG_URL + appConstants.APPEND_URL.post_document + preRegId,
      formdata
    );
  }

  deleteRegistration(preId: string) {
    return this.httpClient.delete(
      this.BASE_URL + this.PRE_REG_URL + appConstants.APPEND_URL.delete_application + preId
    );
  }

  cancelAppointment(data: RequestModel, preRegId: string) {
    return this.httpClient.put(
      this.BASE_URL + this.PRE_REG_URL + appConstants.APPEND_URL.cancelAppointment + preRegId,
      data
    );
  }

  getNearbyRegistrationCenters(coords: any) {
    return this.httpClient.get(
      this.BASE_URL +
        appConstants.APPEND_URL.master_data +
        appConstants.APPEND_URL.nearby_registration_centers +
        localStorage.getItem('langCode') +
        '/' +
        coords.longitude +
        '/' +
        coords.latitude +
        '/' +
        this.configService.getConfigByKey(appConstants.CONFIG_KEYS.preregistration_nearby_centers)
    );
  }

  getRegistrationCentersByName(locType: string, text: string) {
    return this.httpClient.get(
      this.BASE_URL +
        appConstants.APPEND_URL.master_data +
        appConstants.APPEND_URL.registration_centers_by_name +
        localStorage.getItem('langCode') +
        '/' +
        locType +
        '/' +
        text
    );
  }

  getLocationTypeData() {
    return this.httpClient.get(
      this.BASE_URL + appConstants.APPEND_URL.master_data + 'locations/' + localStorage.getItem('langCode')
    );
  }

  getAvailabilityData(registrationCenterId) {
    return this.httpClient.get(
      this.BASE_URL + this.PRE_REG_URL + appConstants.APPEND_URL.booking_availability + registrationCenterId
    );
  }

  makeBooking(request: RequestModel) {
    return this.httpClient.post(
      this.BASE_URL + this.PRE_REG_URL + appConstants.APPEND_URL.booking_appointment,
      request
    );
  }

  /**
   * @description This method return the list of list of countries.
   *
   * @return String
   * @memberof DataStorageService
   */
  getLocationMetadataHirearchy() {
    return this.configService.getConfigByKey(appConstants.CONFIG_KEYS.mosip_country_code);
  }

  /**
   * @description This method return the below list of location hierarchy in specified language for the given location hierarchy and langugae code.
   *
   * @param {string} lang
   * @param {string} location
   * @return an `Observable` of the body as an `Object`
   * @memberof DataStorageService
   */
  getLocationImmediateHierearchy(lang: string, location: string) {
    const url =
      this.BASE_URL +
      appConstants.APPEND_URL.location +
      appConstants.APPEND_URL.location_immediate_children +
      location +
      appConstants.APPENDER +
      lang;
    return this.httpClient.get(url);
  }

  deleteFile(documentId, preRegId) {
    return this.httpClient.delete(
      this.BASE_URL + this.PRE_REG_URL + appConstants.APPEND_URL.post_document + documentId,
      {
        params: new HttpParams().append(appConstants.PARAMS_KEYS.preRegistrationId, preRegId)
      }
    );
  }

  getSecondaryLanguageLabels(langCode: string) {
    return this.httpClient.get(`./assets/i18n/${langCode}.json`);
  }

  copyDocument(sourceId: string, destinationId: string) {
    const url =
      this.BASE_URL +
      this.PRE_REG_URL +
      appConstants.APPEND_URL.post_document +
      destinationId +
      '?catCode=' +
      appConstants.PARAMS_KEYS.POA +
      '&sourcePreId=' +
      sourceId;
    // const params = new URLSearchParams().set(appConstants.PARAMS_KEYS.catCode, appConstants.PARAMS_KEYS.POA);
    // params.set(appConstants.PARAMS_KEYS.sourcePrId, sourceId);

    return this.httpClient.put(url, {
      observe: 'body',
      responseType: 'json'
    });
  }

  getFileData(fileDocumentId, preId) {
    return this.httpClient.get(
      this.BASE_URL + this.PRE_REG_URL + appConstants.APPEND_URL.post_document + fileDocumentId,
      {
        params: new HttpParams().append(appConstants.PARAMS_KEYS.preRegistrationId, preId)
      }
    );
  }

  generateQRCode(data: string) {
    const obj = new RequestModel(appConstants.IDS.qrCode, data);
    return this.httpClient.post(this.BASE_URL + this.PRE_REG_URL + appConstants.APPEND_URL.qr_code, obj);
  }

  sendNotification(data: FormData) {
    return this.httpClient.post(
      this.BASE_URL +
        this.PRE_REG_URL +
        appConstants.APPEND_URL.notification +
        appConstants.APPEND_URL.send_notification,
      data
    );
  }

  recommendedCenters(langCode: string, locationHierarchyCode: number, data: string[]) {
    let url =
      this.BASE_URL +
      appConstants.APPEND_URL.master_data +
      'registrationcenters/' +
      langCode +
      '/' +
      locationHierarchyCode +
      '/names?';
    data.forEach(name => {
      url += 'name=' + name;
      if (data.indexOf(name) !== data.length - 1) {
        url += '&';
      }
    });
    if (url.charAt(url.length - 1) === '&') {
      url = url.substring(0, url.length - 1);
    }
    return this.httpClient.get(url);
  }

  getRegistrationCenterByIdAndLangCode(id: string, langCode: string) {
    const url = this.BASE_URL + appConstants.APPEND_URL.master_data + 'registrationcenters/' + id + '/' + langCode;
    return this.httpClient.get(url);
  }

  getGuidelineTemplate(templateType: string) {
    const url =
      this.BASE_URL +
      appConstants.APPEND_URL.master_data +
      'templates/' +
      localStorage.getItem('langCode') +
      '/' +
      templateType;
    return this.httpClient.get(url);
  }

  getApplicantType(docuemntCategoryDto) {
    return this.httpClient.post(
      this.BASE_URL + appConstants.APPEND_URL.applicantType + appConstants.APPEND_URL.getApplicantType,
      docuemntCategoryDto
    );
  }

  getDocumentCategories(applicantCode) {
    const APPLICANT_VALID_DOCUMENTS_URL =
      this.BASE_URL +
      appConstants.APPEND_URL.location +
      appConstants.APPEND_URL.validDocument +
      applicantCode +
      '/languages';
    return this.httpClient.get(APPLICANT_VALID_DOCUMENTS_URL, {
      params: new HttpParams().append(appConstants.PARAMS_KEYS.getDocumentCategories, localStorage.getItem('langCode'))
    });
  }

  getConfig() {
      //  return this.httpClient.get('./assets/configs.json');
    const url = this.BASE_URL + this.PRE_REG_URL + appConstants.APPEND_URL.auth + appConstants.APPEND_URL.config;
    return this.httpClient.get(url);
  }
  generateToken(){
    // const req={
    //   clientId: "residentUser_iiitB",
    //   secretKey: "92d5ee2f-4dc5-4fdf-a112-ed4ec91c942b",
    //   appId: "resident"
    // }
    const req = {
         appId: "registrationclient",
         password: "Techno@123",
         userName: "110119"
    }
    const obj= new RequestModelForAuth(appConstants.IDS.residentTokenId,req,"");

    const url=this.BASE_URL+'v1/authmanager/authenticate/useridPwd'
    console.log(obj)
    return this.httpClient.post(url, obj,
      {
        observe:'response',
      });

  }

  sendOtp(userId: string) {
    const req = {
      userId: userId
    };

    const obj = new RequestModel(appConstants.IDS.sendOtp, req);

    const url = this.BASE_URL + this.PRE_REG_URL + appConstants.APPEND_URL.auth + appConstants.APPEND_URL.send_otp;
    return this.httpClient.post(url, obj);
  }

    sendOtpForServices(uin: string, idType:string, authHeader:any){

      const obj = new RequestModelSendOtp(uin,idType);
  
      //const url = this.BASE_URL + this.PRE_REG_URL + appConstants.APPEND_URL.auth + appConstants.APPEND_URL.send_otp;
      const url = this.BASE_URL + appConstants.APPEND_URL.otp_resident_services_new + this.MISP_LicenseKey + this.Partner_ID + this.Partner_Api_Key 
        ;
      console.log("in sendotpforservices");
      var x = this.httpClient.post(url,obj,{ headers: new HttpHeaders({'Authorization':authHeader}) });
      console.log(x)
      return x;
    }

    serviceRequest(rid: string)
    {
      console.log("insde status check");
      const req = {
        individualId: rid,
        individualIdType: "RID",
      };
  
      const obj = new RequestModel(appConstants.IDS.serviceRequest, req);
  
      const url = this.BASE_URL + appConstants.APPEND_URL.resident_service + appConstants.APPEND_URL.check_status;
      return this.httpClient.post(url, obj);
    }
    
    getEUIN(authId: string, otp : string, idType:string) {
      console.log("inside euin");
      const req = {
        individualId: authId,
        individualIdType: idType,
        otp: otp,
        transactionID: "0987654321",
        cardType: "MASKED_UIN"
      };

     const httpOptions = {
     responseType: 'blob' as 'json',
    };
  
      const obj = new RequestModelServices(appConstants.IDS.getEUIN, req);
  
      const url = this.BASE_URL + appConstants.APPEND_URL.resident_service +appConstants.APPEND_URL.euin;
      return this.httpClient.post(url, obj,httpOptions);
    }


    printUIN(authId: string, otp : string, idType:string) {
      console.log("inside print uin");
      const req = {
        individualId: authId,
        individualIdType: idType,
        otp: otp,
        transactionID: "0987654321",
        cardType: "MASKED_UIN"
      };
  
      const obj = new RequestModelServices(appConstants.IDS.printUIN, req);
  
      const url = this.BASE_URL + appConstants.APPEND_URL.resident_service +appConstants.APPEND_URL.print_uin ;
      return this.httpClient.post(url, obj);
    }


    generateVid(uin: string, otp : string, auth:string){
      console.log("inside generate VId");
      console.log(otp);
      const request = {
        individualId: uin,
        individualIdType: "UIN",
        otp: otp,
        transactionID: "0987654321",
        vidType: "Temporary"
      };
  
      const obj = new RequestModelServices(appConstants.IDS.generateVidId, request);
      const url= this.BASE_URL + appConstants.APPEND_URL.resident_service + appConstants.APPEND_URL.vid_service;
  //    const url = this.BASE_URL + appConstants.APPEND_URL.resident+ appConstants.APPEND_URL.vid;
      return this.httpClient.post(url, obj);
  
    }

    revokeVid(vid:string, otp:string){
      console.log("inside revokeVID-service");
      const request = {
        individualId: vid,
        individualIdType: "VID",
        otp: otp,
        transactionID: "0987654321",
        vidStatus: "REVOKED"
      };
      const obj = new RequestModelServices(appConstants.IDS.revokeVid, request);
      const url= this.BASE_URL+'resident/v1/vid/'+vid;
      return this.httpClient.patch(url,obj);
    }

    updateDemoUserOtp(userId: string, otp: string, idType:string  ){
      this.userIdUpdateDemo=userId;
      this.otpUpdateDemo=otp;
      console.log(otp);
      console.log(this.otpUpdateDemo);
      this.idTypeUpdateDemo=idType;
    }
    updateDemographic( docByteArray:any, fileData:File) {
    console.log("Inside UpdateDemo");
    console.log(this.userIdUpdateDemo);
    console.log(this.otpUpdateDemo);
      const request={ 
        transactionID :"0987654321",
        individualId : this.userIdUpdateDemo,
        individualIdType : this.idTypeUpdateDemo,
        otp : this.otpUpdateDemo,
        
        //identityJson : "<base64 encoded identity json byte array>",
        identityJson : "ewoJImlkZW50aXR5IjogewoJCSJwaG9uZSI6ICI5OTk0OTA5NzQ3IiwKCQkiZW1haWwiOiAibG9nYW5hdGhhbi5zZWthckBtaW5kdHJlZS5jb20iLAoJCSJJRFNjaGVtYVZlcnNpb24iOiAwLjIsCgkJIlVJTiI6ICIyMDk2MjU2MTUyIgoJfQp9",
        documents:[ 
           { 
              name:fileData.name,
              value: docByteArray
           }
        ]
     }
     const obj = new RequestModelServices(appConstants.IDS.updateDemo, request);
     console.log("API update Demo hit1");
      const url= this.BASE_URL + appConstants.APPEND_URL.resident_service + appConstants.APPEND_URL.updateDemo;
      console.log("API update Demo hit2");
      return this.httpClient.post(url,obj);
      
     //const url='';
     //return this.httpClient.post(url,);

    }

    lockUIN(authId: string, otp: string,authArray:string[], idType:string){
      console.log("inside lock");
      const request = {
        individualId: authId,
        individualIdType: idType,
        otp: otp,
        transactionID: "0987654321",
        authType:authArray
      };
      const obj = new RequestModel(appConstants.IDS.lockUIN, request);
      const url= this.BASE_URL+ appConstants.APPEND_URL.resident_service +appConstants.APPEND_URL.lock_service;
  //    const url = this.BASE_URL + appConstants.APPEND_URL.resident+ appConstants.APPEND_URL.vid;
      return this.httpClient.post(url,obj);
    }


    unlockUIN(authId: string, otp: string,authArray:string[],idType:string){
      
      console.log("inside unlock");
      const request = {
        individualId: authId,
        individualIdType: idType,
        otp: otp,
        transactionID: "0987654321",
        authType:authArray
      };
      const obj = new RequestModel(appConstants.IDS.unlockUIN, request);
      const url= this.BASE_URL+appConstants.APPEND_URL.resident_service +appConstants.APPEND_URL.unlock_service;
  //    const url = this.BASE_URL + appConstants.APPEND_URL.resident+ appConstants.APPEND_URL.vid;
      return this.httpClient.post(url,obj);

    }

    authHistory(authId: string, otp: string, idType:string)
    {
      console.log("inside auth history");
      const request = {
        individualId: authId,
        individualIdType: idType,
        otp: otp,
        transactionID: "0987654321",
      };
      const obj = new RequestModel(appConstants.IDS.authHistory, request);
      const url= this.BASE_URL+ appConstants.APPEND_URL.resident_service + appConstants.APPEND_URL.authHistory;
  //    const url = this.BASE_URL + appConstants.APPEND_URL.resident+ appConstants.APPEND_URL.vid;
      return this.httpClient.post(url,obj);
    }

    

  verifyOtp(userId: string, otp: string) {
    const request = {
      otp: otp,
      userId: userId
    };

    const obj = new RequestModel(appConstants.IDS.validateOtp, request);

    const url = this.BASE_URL + this.PRE_REG_URL + appConstants.APPEND_URL.auth + appConstants.APPEND_URL.login;
    return this.httpClient.post(url, obj);
  }

  /**
   * @description This is to get the list of working days for a given registration center id.
   *
   * @param {string} registartionCenterId
   * @param {string} langCode
   * @returns
   * @memberof DataStorageService
   */
  getWorkingDays(registartionCenterId: string, langCode: string) {
    const url =
      this.BASE_URL + appConstants.APPEND_URL.master_data + 'workingdays/' + registartionCenterId + '/' + langCode;
    return this.httpClient.get(url);
  }
  
  /**
   * @description This method is responsible to logout the user and invalidate the token.
   *
   * @returns an `Observable` of the body as an `Object`
   * @memberof DataStorageService
   */
  onLogout() {
    const url = this.BASE_URL + this.PRE_REG_URL + appConstants.APPEND_URL.auth + appConstants.APPEND_URL.logout;
    return this.httpClient.post(url, '');
  } 

  
}
