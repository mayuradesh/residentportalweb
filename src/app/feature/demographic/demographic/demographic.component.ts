import { Component, OnInit, ViewChild, ElementRef, OnDestroy, HostListener, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { MatSelectChange, MatButtonToggleChange, MatDialog } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { BookingService } from '../../booking/booking.service';

import { DataStorageService } from 'src/app/core/services/data-storage.service';
import { RegistrationService } from 'src/app/core/services/registration.service';

import { UserModel } from 'src/app/shared/models/demographic-model/user.modal';
import { CodeValueModal } from 'src/app/shared/models/demographic-model/code.value.modal';
import { FormControlModal } from 'src/app/shared/models/demographic-model/form.control.modal';
import { IdentityModel } from 'src/app/shared/models/demographic-model/identity.modal';
import { DemoIdentityModel } from 'src/app/shared/models/demographic-model/demo.identity.modal';
import { RequestModel } from 'src/app/shared/models/demographic-model/request.modal';
import * as appConstants from '../../../app.constants';
import Utils from 'src/app/app.util';
import { DialougComponent } from 'src/app/shared/dialoug/dialoug.component';
import { ConfigService } from 'src/app/core/services/config.service';
import { AttributeModel } from 'src/app/shared/models/demographic-model/attribute.modal';
import { ResponseModel } from 'src/app/shared/models/demographic-model/response.model';
import { FilesModel } from 'src/app/shared/models/demographic-model/files.model';
import { MatKeyboardService, MatKeyboardRef, MatKeyboardComponent } from 'ngx7-material-keyboard';
import { RouterExtService } from 'src/app/shared/router/router-ext.service';
import { LogService } from 'src/app/shared/logger/log.service';
import LanguageFactory from 'src/assets/i18n';
import { FormDeactivateGuardService } from 'src/app/shared/can-deactivate-guard/form-guard/form-deactivate-guard.service';
import { Subscription } from 'rxjs';
// import { ErrorService } from 'src/app/shared/error/error.service';

/**
 * @description This component takes care of the demographic page.
 * @author Shashank Agrawal
 *
 * @export
 * @class DemographicComponent
 * @implements {OnInit}
 * @implements {OnDestroy}
 */
@Component({
  selector: 'app-demographic',
  templateUrl: './demographic.component.html',
  styleUrls: ['./demographic.component.css']
})
export class DemographicComponent extends FormDeactivateGuardService implements OnInit, OnDestroy {
  textDir = localStorage.getItem('dir');
  secTextDir = localStorage.getItem('secondaryDir');
  primaryLang = localStorage.getItem('langCode');
  secondaryLang = localStorage.getItem('secondaryLangCode');
  languages = [this.primaryLang, this.secondaryLang];
  keyboardLang = appConstants.virtual_keyboard_languages[this.primaryLang];
  keyboardSecondaryLang = appConstants.virtual_keyboard_languages[this.secondaryLang];

  files: FilesModel;
  agePattern: string;
  MOBILE_PATTERN: string;
  MOBILE_LENGTH: string;
  REFERENCE_IDENTITY_NUMBER_PATTERN: string;
  REFERENCE_IDENTITY_NUMBER_PATTERN_LENGTH: string;
  EMAIL_PATTERN: string;
  EMAIL_LENGTH: string;
  DOB_PATTERN: string;
  POSTALCODE_PATTERN: string;
  POSTALCODE_LENGTH: string;
  ADDRESS_PATTERN: string;
  defaultDay: string;
  defaultMonth: string;
  FULLNAME_PATTERN: string;
  defaultLocation: string;

  ageOrDobPref = '';
  showDate = false;
  isNewApplicant = false;
  checked = true;
  dataUploadComplete = true;
  hasError = false;
  dataModification: boolean;
  showPreviewButton = false;
  dataIncomingSuccessful = false;
  canDeactivateFlag = true;
  hierarchyAvailable = true;
  isConsentMessage = false;
  isReadOnly = false;

  step: number = 0;
  id: number;
  oldAge: number;
  oldKeyBoardIndex: number;
  numberOfApplicants: number;
  userForm: FormGroup;
  transUserForm: FormGroup;
  maxDate = new Date(Date.now());
  preRegId = '';
  loginId = '';
  user: UserModel;
  demodata: string[];
  secondaryLanguagelabels: any;
  demographiclabels: any;
  errorlabels: any;
  uppermostLocationHierarchy: any;
  primaryGender = [];
  secondaryGender = [];
  primaryResidenceStatus = [];
  secondaryResidenceStatus = [];
  secondaryResidenceStatusTemp = [];
  genders: any;
  residenceStatus: any;
  message = {};
  config = {};
  consentMessage: any;
  titleOnError = '';

  @ViewChild('dd') dd: ElementRef;
  @ViewChild('mm') mm: ElementRef;
  @ViewChild('yyyy') yyyy: ElementRef;
  @ViewChild('age') age: ElementRef;

  private _keyboardRef: MatKeyboardRef<MatKeyboardComponent>;
  @ViewChildren('keyboardRef', { read: ElementRef })
  private _attachToElementMesOne: any;

  regions_in_primary_lang: CodeValueModal[] = [];
  regions_in_secondary_lang: CodeValueModal[] = [];
  regions: CodeValueModal[][] = [this.regions_in_primary_lang, this.regions_in_secondary_lang];
  provinces_in_primary_lang: CodeValueModal[] = [];
  provinces_in_secondary_lang: CodeValueModal[] = [];
  provinces: CodeValueModal[][] = [this.provinces_in_primary_lang, this.provinces_in_secondary_lang];
  cities_in_primary_lang: CodeValueModal[] = [];
  cities_in_secondary_lang: CodeValueModal[] = [];
  cities: CodeValueModal[][] = [this.cities_in_primary_lang, this.cities_in_secondary_lang];
  zones_in_primary_lang: CodeValueModal[] = [];
  zones_in_secondary_lang: CodeValueModal[] = [];
  zones: CodeValueModal[][] = [this.zones_in_primary_lang, this.zones_in_secondary_lang];
  locations = [this.regions, this.provinces, this.cities, this.zones];
  selectedLocationCode = [];
  codeValue: CodeValueModal[] = [];
  subscriptions: Subscription[] = [];

  formControlValues: FormControlModal;
  formControlNames: FormControlModal = {
    fullName: 'fullName',
    gender: 'gender',
    dateOfBirth: 'dateOfBirth',
    residenceStatus: 'residenceStatus',
    addressLine1: 'addressLine1',
    addressLine2: 'addressLine2',
    addressLine3: 'addressLine3',
    region: 'region',
    province: 'province',
    city: 'city',
    zone: 'zone',
    email: 'email',
    postalCode: 'postalCode',
    phone: 'phone',
    referenceIdentityNumber: 'referenceIdentityNumber',

    age: 'age',
    date: 'date',
    month: 'month',
    year: 'year',
    fullNameSecondary: 'secondaryFullName',
    addressLine1Secondary: 'secondaryAddressLine1',
    addressLine2Secondary: 'secondaryAddressLine2',
    addressLine3Secondary: 'secondaryAddressLine3'
  };

  /**
   * @description Creates an instance of DemographicComponent.
   * @param {Router} router
   * @param {RegistrationService} regService
   * @param {DataStorageService} dataStorageService
   * @param {BookingService} bookingService
   * @param {ConfigService} configService
   * @param {TranslateService} translate
   * @param {MatDialog} dialog
   * @memberof DemographicComponent
   */
  constructor(
    private router: Router,
    private regService: RegistrationService,
    private dataStorageService: DataStorageService,
    private bookingService: BookingService,
    private configService: ConfigService,
    private translate: TranslateService,
    public dialog: MatDialog,
    private matKeyboardService: MatKeyboardService,
    private routerService: RouterExtService,
    private loggerService: LogService // private errorService: ErrorService
  ) {
    super(dialog);
    this.translate.use(localStorage.getItem('langCode'));
    this.subscriptions.push(this.regService.getMessage().subscribe(message => (this.message = message)));
  }

  /**
   * @description This is the angular life cycle hook called upon loading the component.
   *
   * @memberof DemographicComponent
   */
  async ngOnInit() {
    this.initialization();
    this.config = this.configService.getConfig();
    this.setConfig();
    this.getPrimaryLabels();
    await this.getConsentMessage();
    this.initForm();

    let factory = new LanguageFactory(this.secondaryLang);
    let response = factory.getCurrentlanguage();
    this.secondaryLanguagelabels = response['demographic'];

    let previousURL = this.routerService.getPreviousUrl();
    if (!this.dataModification) {
      if (
        !previousURL.includes('demographic') ||
        (previousURL.includes('demographic') && this.configService.navigationType !== 'popstate')
      )
        if (this.isConsentMessage) this.consentDeclaration();
    }
  }

  /**
   * @description This set the global configuration used in the demographic component.
   *
   * @memberof DemographicComponent
   */
  setConfig() {
    this.MOBILE_PATTERN = this.config[appConstants.CONFIG_KEYS.mosip_regex_phone];
    this.REFERENCE_IDENTITY_NUMBER_PATTERN = this.config[appConstants.CONFIG_KEYS.mosip_regex_referenceIdentityNumber];
    this.EMAIL_PATTERN = this.config[appConstants.CONFIG_KEYS.mosip_regex_email];
    this.POSTALCODE_PATTERN = this.config[appConstants.CONFIG_KEYS.mosip_regex_postalCode];
    this.DOB_PATTERN = this.config[appConstants.CONFIG_KEYS.mosip_regex_DOB];
    this.defaultDay = this.config[appConstants.CONFIG_KEYS.mosip_default_dob_day];
    this.defaultMonth = this.config[appConstants.CONFIG_KEYS.mosip_default_dob_month];
    this.ADDRESS_PATTERN = this.config[appConstants.CONFIG_KEYS.preregistration_address_length];
    this.FULLNAME_PATTERN = this.config[appConstants.CONFIG_KEYS.preregistration_fullname_length];
    this.agePattern = this.config[appConstants.CONFIG_KEYS.mosip_id_validation_identity_age];
    this.defaultLocation = this.config[appConstants.CONFIG_KEYS.mosip_default_location];
  }

  /**
   * @description This will return the json object of label of demographic in the primary language.
   *
   * @private
   * @returns the `Promise`
   * @memberof DemographicComponent
   */
  private getPrimaryLabels() {
    let factory = new LanguageFactory(this.primaryLang);
    let response = factory.getCurrentlanguage();
    this.demographiclabels = response['demographic'];
    this.errorlabels = response['error'];
  }

  private getConsentMessage() {
    return new Promise((resolve, reject) => {
      this.subscriptions.push(
        this.dataStorageService.getGuidelineTemplate('consent').subscribe(
          response => {
            this.isConsentMessage = true;
            if (response && response[appConstants.RESPONSE])
              this.consentMessage = response['response']['templates'][0].fileText.split('\n');
            else if (response[appConstants.NESTED_ERROR]) this.onError(this.errorlabels.error, '');
            resolve(true);
          },
          error => {
            this.isConsentMessage = false;
            this.onError(this.errorlabels.error, error);
          }
        )
      );
    });
  }

  /**
   * @description This method do the basic initialization,
   * if user is opt for updation or creating the new applicaton
   *
   * @private
   * @memberof DemographicComponent
   */
  private initialization() {
    if (localStorage.getItem('newApplicant') === 'true') {
      this.isNewApplicant = true;
    }
    if (this.message['modifyUser'] === 'true' || this.message['modifyUserFromPreview'] === 'true') {
      this.dataModification = true;
      this.step = this.regService.getUsers().length - 1;
      if (this.message['modifyUserFromPreview'] === 'true') this.showPreviewButton = true;
    } else {
      this.dataModification = false;
      this.step = this.regService.getUsers().length;
    }
    this.loginId = this.regService.getLoginId();
  }

  /**
   * @description This is the consent form, which applicant has to agree upon to proceed forward.
   *
   * @private
   * @memberof DemographicComponent
   */
  private consentDeclaration() {
    if (this.demographiclabels) {
      const data = {
        case: 'CONSENTPOPUP',
        title: this.demographiclabels.consent.title,
        subtitle: this.demographiclabels.consent.subtitle,
        message: this.consentMessage,
        checkCondition: this.demographiclabels.consent.checkCondition,
        acceptButton: this.demographiclabels.consent.acceptButton,
        alertMessageFirst: this.demographiclabels.consent.alertMessageFirst,
        alertMessageSecond: this.demographiclabels.consent.alertMessageSecond,
        alertMessageThird: this.demographiclabels.consent.alertMessageThird
      };
      this.dialog.open(DialougComponent, {
        width: '550px',
        data: data,
        disableClose: true
      });
    }
  }

  /**
   * @description This will initialize the demographic form and
   * if update set the inital values of the attributes.
   *
   *
   * @memberof DemographicComponent
   */
  async initForm() {
    if (this.dataModification) {
      this.user = this.regService.getUser(this.step);
      this.preRegId = this.user.preRegId;
    }
    this.setFormControlValues();

    this.userForm = new FormGroup({
      [this.formControlNames.fullName]: new FormControl(this.formControlValues.fullName.trim(), [
        Validators.required,
        Validators.pattern(this.FULLNAME_PATTERN),
        this.noWhitespaceValidator
      ]),
      [this.formControlNames.gender]: new FormControl(this.formControlValues.gender, Validators.required),
      [this.formControlNames.residenceStatus]: new FormControl(
        this.formControlValues.residenceStatus,
        Validators.required
      ),
      [this.formControlNames.age]: new FormControl(this.formControlValues.age, [
        Validators.required,
        Validators.pattern(this.agePattern)
      ]),
      [this.formControlNames.dateOfBirth]: new FormControl(this.formControlValues.dateOfBirth, [
        Validators.pattern(this.DOB_PATTERN)
      ]),
      [this.formControlNames.date]: new FormControl(this.formControlValues.date, [Validators.required]),
      [this.formControlNames.month]: new FormControl(this.formControlValues.month, [Validators.required]),
      [this.formControlNames.year]: new FormControl(this.formControlValues.year, [Validators.required]),
      [this.formControlNames.addressLine1]: new FormControl(this.formControlValues.addressLine1, [
        Validators.required,
        Validators.pattern(this.ADDRESS_PATTERN),
        this.noWhitespaceValidator
      ]),
      [this.formControlNames.addressLine2]: new FormControl(
        this.formControlValues.addressLine2,
        Validators.pattern(this.ADDRESS_PATTERN)
      ),
      [this.formControlNames.addressLine3]: new FormControl(
        this.formControlValues.addressLine3,
        Validators.pattern(this.ADDRESS_PATTERN)
      ),
      [this.formControlNames.region]: new FormControl(this.formControlValues.region, Validators.required),
      [this.formControlNames.province]: new FormControl(this.formControlValues.province, Validators.required),
      [this.formControlNames.city]: new FormControl(this.formControlValues.city, Validators.required),
      [this.formControlNames.zone]: new FormControl(this.formControlValues.zone, Validators.required),
      [this.formControlNames.email]: new FormControl(this.formControlValues.email, [
        Validators.pattern(this.EMAIL_PATTERN)
      ]),
      [this.formControlNames.postalCode]: new FormControl(this.formControlValues.postalCode, [
        Validators.required,
        Validators.pattern(this.POSTALCODE_PATTERN)
      ]),
      [this.formControlNames.phone]: new FormControl(this.formControlValues.phone, [
        Validators.pattern(this.MOBILE_PATTERN)
      ]),
      [this.formControlNames.referenceIdentityNumber]: new FormControl(this.formControlValues.referenceIdentityNumber, [
        Validators.required,
        Validators.pattern(this.REFERENCE_IDENTITY_NUMBER_PATTERN)
      ])
    });

    this.transUserForm = new FormGroup({
      [this.formControlNames.fullNameSecondary]: new FormControl(this.formControlValues.fullNameSecondary.trim(), [
        Validators.required,
        Validators.pattern(this.FULLNAME_PATTERN),
        this.noWhitespaceValidator
      ]),
      [this.formControlNames.addressLine1Secondary]: new FormControl(this.formControlValues.addressLine1Secondary, [
        Validators.required,
        Validators.pattern(this.ADDRESS_PATTERN),
        this.noWhitespaceValidator
      ]),
      [this.formControlNames.addressLine2Secondary]: new FormControl(
        this.formControlValues.addressLine2Secondary,
        Validators.pattern(this.ADDRESS_PATTERN)
      ),
      [this.formControlNames.addressLine3Secondary]: new FormControl(
        this.formControlValues.addressLine3Secondary,
        Validators.pattern(this.ADDRESS_PATTERN)
      )
    });

    this.setLocations();
    this.setGender();
    this.setResident();
  }

  /**
   * @description This sets the top location hierachy,
   * if update set the regions also.
   *
   * @private
   * @memberof DemographicComponent
   */
  private async setLocations() {
    await this.getLocationMetadataHirearchy();
    this.selectedLocationCode = [
      this.uppermostLocationHierarchy,
      this.formControlValues.region,
      this.formControlValues.province,
      this.formControlValues.city,
      this.formControlValues.zone
    ];
    if (!this.dataModification) {
      this.locations = [this.regions];
    }

    for (let index = 0; index < this.locations.length; index++) {
      const parentLocationCode = this.selectedLocationCode[index];
      const currentLocationCode = this.selectedLocationCode[index + 1];
      const elements = this.locations[index];
      for (let elementsIndex = 0; elementsIndex < elements.length; elementsIndex++) {
        const element = elements[elementsIndex];
        const language = this.languages[elementsIndex];
        await this.getLocationImmediateHierearchy(language, parentLocationCode, element, currentLocationCode);
      }
    }
    this.dataIncomingSuccessful = true;
  }

  /**
   * @description This is to get the list of gender available in the master data.
   *
   * @private
   * @memberof DemographicComponent
   */
  private async setGender() {
    await this.getGenderDetails();
    this.filterOnLangCode(this.primaryLang, this.primaryGender, this.genders);
    this.filterOnLangCode(this.secondaryLang, this.secondaryGender, this.genders);
  }

  /**
   * @description This is to get the list of gender available in the master data.
   *
   * @private
   * @memberof DemographicComponent
   */
  private async setResident() {
    await this.getResidentDetails();
    this.filterOnLangCode(this.primaryLang, this.primaryResidenceStatus, this.residenceStatus);
    this.filterOnLangCode(this.secondaryLang, this.secondaryResidenceStatus, this.residenceStatus);
    // if(this.dataModification){
    //   this.getValueFromCode(this.secondaryResidenceStatus,this.user.request.demographicDetails.identity.residenceStatus[0].value)
    // }
  }

  /**
   * @description This set the initial values for the form attributes.
   *
   * @memberof DemographicComponent
   */
  setFormControlValues() {
    if (this.primaryLang === this.secondaryLang) {
      this.languages.pop();
      this.isReadOnly = true;
    }
    if (!this.dataModification) {
      this.formControlValues = {
        fullName: '',
        gender: '',
        residenceStatus: '',
        date: '',
        month: '',
        year: '',
        dateOfBirth: '',
        age: '',
        addressLine1: '',
        addressLine2: '',
        addressLine3: '',
        region: '',
        province: '',
        city: '',
        zone: '',
        email: '',
        postalCode: '',
        phone: '',
        referenceIdentityNumber: '',

        fullNameSecondary: '',
        addressLine1Secondary: '',
        addressLine2Secondary: '',
        addressLine3Secondary: ''
      };
    } else {
      let index = 0;
      let secondaryIndex = 1;
      this.loggerService.info('user', this.user);

      if (this.user.request.demographicDetails.identity.fullName[0].language !== this.primaryLang) {
        index = 1;
        secondaryIndex = 0;
      }
      if (this.primaryLang === this.secondaryLang) {
        index = 0;
        secondaryIndex = 0;
      }
      const dob = this.user.request.demographicDetails.identity.dateOfBirth;
      this.formControlValues = {
        fullName: this.user.request.demographicDetails.identity.fullName[index].value,
        gender: this.user.request.demographicDetails.identity.gender[index].value,
        residenceStatus: this.user.request.demographicDetails.identity.residenceStatus[index].value,
        date: this.user.request.demographicDetails.identity.dateOfBirth.split('/')[2],
        month: this.user.request.demographicDetails.identity.dateOfBirth.split('/')[1],
        year: this.user.request.demographicDetails.identity.dateOfBirth.split('/')[0],
        dateOfBirth: dob,
        age: this.calculateAge(new Date(new Date(dob))).toString(),
        addressLine1: this.user.request.demographicDetails.identity.addressLine1[index].value,
        addressLine2: this.user.request.demographicDetails.identity.addressLine2[index].value,
        addressLine3: this.user.request.demographicDetails.identity.addressLine3[index].value,
        region: this.user.request.demographicDetails.identity.region[index].value,
        province: this.user.request.demographicDetails.identity.province[index].value,
        city: this.user.request.demographicDetails.identity.city[index].value,
        zone: this.user.request.demographicDetails.identity.zone[0].value,
        email: this.user.request.demographicDetails.identity.email,
        postalCode: this.user.request.demographicDetails.identity.postalCode,
        phone: this.user.request.demographicDetails.identity.phone,
        referenceIdentityNumber: this.user.request.demographicDetails.identity.referenceIdentityNumber.toString(),

        fullNameSecondary: this.user.request.demographicDetails.identity.fullName[secondaryIndex].value,
        addressLine1Secondary: this.user.request.demographicDetails.identity.addressLine1[secondaryIndex].value,
        addressLine2Secondary: this.user.request.demographicDetails.identity.addressLine2[secondaryIndex].value,
        addressLine3Secondary: this.user.request.demographicDetails.identity.addressLine3[secondaryIndex].value
      };
    }
  }

  /**
   * @description This will get the gender details from the master data.
   *
   * @private
   * @returns
   * @memberof DemographicComponent
   */
  private getGenderDetails() {
    return new Promise(resolve => {
      this.subscriptions.push(
        this.dataStorageService.getGenderDetails().subscribe(
          response => {
            if (response[appConstants.RESPONSE]) {
              this.genders = response[appConstants.RESPONSE][appConstants.DEMOGRAPHIC_RESPONSE_KEYS.genderTypes];
              resolve(true);
            } else {
              this.onError(this.errorlabels.error, '');
            }
          },
          error => {
            this.loggerService.error('Unable to fetch gender');
            this.onError(this.errorlabels.error, error);
          }
        )
      );
    });
  }

  /**
   * @description This will get the residenceStatus details from the master data.
   *
   * @private
   * @returns
   * @memberof DemographicComponent
   */
  private getResidentDetails() {
    return new Promise(resolve => {
      this.subscriptions.push(
        this.dataStorageService.getResidentDetails().subscribe(
          response => {
            if (response[appConstants.RESPONSE]) {
              this.residenceStatus =
                response[appConstants.RESPONSE][appConstants.DEMOGRAPHIC_RESPONSE_KEYS.residentTypes];
              resolve(true);
            } else {
              this.onError(this.errorlabels.error, '');
            }
          },
          error => {
            this.loggerService.error('Unable to fetch Resident types');
            this.onError(this.errorlabels.error, error);
          }
        )
      );
    });
  }

  /**
   * @description This will filter the gender on the basis of langugae code.
   *
   * @private
   * @param {string} langCode
   * @param {*} [genderEntity=[]]
   * @param {*} entityArray
   * @memberof DemographicComponent
   */
  private filterOnLangCode(langCode: string, genderEntity = [], entityArray: any) {
    if (entityArray) {
      entityArray.filter((element: any) => {
        if (element.langCode === langCode) genderEntity.push(element);
      });
      if (this.formControlValues.gender) {
        genderEntity.filter(element => {
          if (element.code === this.formControlValues.gender) {
            const codeValue: CodeValueModal = {
              valueCode: element.code,
              valueName: element.genderName,
              languageCode: element.langCode
            };
            this.addCodeValue(codeValue);
          }
          if (element.code === this.formControlValues.residenceStatus) {
            const codeValue: CodeValueModal = {
              valueCode: element.code,
              valueName: element.name,
              languageCode: element.langCode
            };
            this.addCodeValue(codeValue);
          }
        });
      }
    }
  }

  /**
   * @description This is to get the top most location Hierarchy, i.e. `Country Code`
   *
   * @returns
   * @memberof DemographicComponent
   */
  getLocationMetadataHirearchy() {
    return new Promise(resolve => {
      const uppermostLocationHierarchy = this.dataStorageService.getLocationMetadataHirearchy();
      this.uppermostLocationHierarchy = uppermostLocationHierarchy;
      resolve(this.uppermostLocationHierarchy);
    });
  }

  /**
   * @description This method get the next set of locations hierarchy for the selected location
   *
   * @param {MatSelectChange} event
   * @param {CodeValueModal[][]} nextHierarchies
   * @param {CodeValueModal[][]} currentLocationHierarchies
   * @param {string} [formControlName]
   * @memberof DemographicComponent
   */
  async onLocationSelect(
    event: MatSelectChange,
    nextHierarchies: CodeValueModal[][],
    currentLocationHierarchies: CodeValueModal[][],
    formControlName?: string
  ) {
    if (nextHierarchies) {
      for (let index = 0; index < nextHierarchies.length; index++) {
        const element = nextHierarchies[index];
        const languageCode = this.languages[index];
        if (formControlName) this.userForm.controls[formControlName].setValue('');
        this.getLocationImmediateHierearchy(languageCode, event.value, element);
      }
    } else {
      this.dataIncomingSuccessful = true;
    }

    if (currentLocationHierarchies) {
      for (let index = 0; index < currentLocationHierarchies.length; index++) {
        const currentLocationHierarchy = currentLocationHierarchies[index];
        currentLocationHierarchy.filter(currentLocationHierarchy => {
          if (currentLocationHierarchy.valueCode === event.value) {
            this.addCodeValue(currentLocationHierarchy);
          }
        });
      }
    }
  }

  /**
   * @description This method push to the CodeValueModal array
   *
   * @param {CodeValueModal} element
   * @memberof DemographicComponent
   */
  addCodeValue(element: CodeValueModal) {
    this.codeValue.push({
      valueCode: element.valueCode,
      valueName: element.valueName,
      languageCode: element.languageCode
    });
  }

  /**
   * @description This method returns the next immediate location hierarchy for the selected location.
   *
   * @param {string} languageCode
   * @param {string} parentLocationCode
   * @param {CodeValueModal[]} childLocations
   * @param {string} [currentLocationCode]
   * @returns
   * @memberof DemographicComponent
   */
  getLocationImmediateHierearchy(
    languageCode: string,
    parentLocationCode: string,
    childLocations: CodeValueModal[],
    currentLocationCode?: string
  ) {
    childLocations.length = 0;
    return new Promise(resolve => {
      if (!this.hierarchyAvailable) {
        this.onLocationNotAvailable(childLocations, this.defaultLocation, this.defaultLocation, languageCode);
        return resolve(true);
      }
      this.subscriptions.push(
        this.dataStorageService.getLocationImmediateHierearchy(languageCode, parentLocationCode).subscribe(
          response => {
            if (response[appConstants.RESPONSE]) {
              response[appConstants.RESPONSE][appConstants.DEMOGRAPHIC_RESPONSE_KEYS.locations].forEach(element => {
                let codeValueModal: CodeValueModal = {
                  valueCode: element.code,
                  valueName: element.name,
                  languageCode: languageCode
                };
                childLocations.push(codeValueModal);
                if (currentLocationCode && codeValueModal.valueCode === currentLocationCode) {
                  this.addCodeValue(codeValueModal);
                }
              });
              return resolve(true);
            }
            // if no location hiererchy available
            else if (
              response[appConstants.NESTED_ERROR] &&
              response[appConstants.NESTED_ERROR][0][appConstants.ERROR_CODE] ===
                appConstants.ERROR_CODES.noLocationAvailable
            ) {
              this.hierarchyAvailable = false;
              this.onLocationNotAvailable(childLocations, this.defaultLocation, this.defaultLocation, languageCode);
              return resolve(true);
            } else {
              this.onError(this.errorlabels.error, '');
            }
          },
          error => {
            this.onError(this.errorlabels.error, error);
            this.loggerService.error('Unable to fetch Below Hierearchy');
          }
        )
      );
    });
  }

  private onLocationNotAvailable(
    childLocations: CodeValueModal[],
    valueCode: string,
    valueName: string,
    languageCode: string
  ) {
    let codeValueModal: CodeValueModal = {
      valueCode: valueCode,
      valueName: valueName,
      languageCode: languageCode
    };
    childLocations.push(codeValueModal);
    this.addCodeValue(codeValueModal);
  }

  /**
   * @description On click of back button the user will be navigate to dashboard.
   *
   * @memberof DemographicComponent
   */
  onBack() {
    let url = '';
    url = Utils.getURL(this.router.url, 'dashboard', 2);
    this.router.navigate([url]);
  }

  /**
   * @description On change of natioanlity, this is called.
   *
   * @param {*} entity
   * @param {MatButtonToggleChange} [event]
   * @memberof DemographicComponent
   */
  onEntityChange(entity: any, event?: MatButtonToggleChange) {
    if (event) {
      entity.forEach(element => {
        element.filter((element: any) => {
          if (event.value === element.code) {
            const codeValue: CodeValueModal = {
              languageCode: element.langCode,
              valueCode: element.code,
              valueName: element.genderName ? element.genderName : element.name
            };
            this.addCodeValue(codeValue);
          }
        });
      });
    }
    // this.getValueFromCode(entity[1], event.value);
  }

  // In progress to do
  getValueFromCode(entity: any, value: string) {
    this.secondaryResidenceStatusTemp = JSON.parse(JSON.stringify(entity));
    console.log('secondaryResidenceStatusTemp ', this.secondaryResidenceStatusTemp);
    console.log(
      'index',
      entity.findIndex(item => {
        console.log('item', item);

        item.code !== value;
      })
    );
    this.secondaryResidenceStatusTemp.splice(
      entity.findIndex(item => item.code !== value),
      1
    );
    console.log('enityt1', this.secondaryResidenceStatusTemp);
    console.log('enityt2', entity);
  }

  /**
   * @description This is called when age is changed and the date of birth will get calculated.
   *
   * @memberof DemographicComponent
   */
  onAgeChange() {
    const age = this.age.nativeElement.value;
    const ageRegex = new RegExp(this.agePattern);
    if (age && age != this.oldAge)
      if (ageRegex.test(age)) {
        const now = new Date();
        const calulatedYear = now.getFullYear() - age;
        this.userForm.controls[this.formControlNames.date].patchValue(this.defaultDay);
        this.userForm.controls[this.formControlNames.month].patchValue(this.defaultMonth);
        this.userForm.controls[this.formControlNames.year].patchValue(calulatedYear);
        this.userForm.controls[this.formControlNames.dateOfBirth].patchValue(
          calulatedYear + '/' + this.defaultMonth + '/' + this.defaultDay
        );
        this.userForm.controls[this.formControlNames.dateOfBirth].setErrors(null);
      } else {
        this.oldAge = age;
        this.userForm.controls[this.formControlNames.date].patchValue('');
        this.userForm.controls[this.formControlNames.month].patchValue('');
        this.userForm.controls[this.formControlNames.year].patchValue('');
      }
  }

  /**
   * @description This is called whenever there is a change in Date of birth field and accordingly age
   * will get calculate.
   *
   * @memberof DemographicComponent
   */
  onDOBChange() {
    const date = this.dd.nativeElement.value;
    const month = this.mm.nativeElement.value;
    const year = this.yyyy.nativeElement.value;

    const newDate = year + '/' + month + '/' + date;
    const dobRegex = new RegExp(this.DOB_PATTERN);
    if (dobRegex.test(newDate)) {
      const dateform = new Date(newDate);
      this.userForm.controls[this.formControlNames.dateOfBirth].patchValue(newDate);
      this.userForm.controls[this.formControlNames.age].patchValue(this.calculateAge(dateform));
    } else if (date && month && year) {
      this.userForm.controls[this.formControlNames.dateOfBirth].markAsTouched();
      this.userForm.controls[this.formControlNames.dateOfBirth].setErrors({
        incorrect: true
      });
      this.userForm.controls[this.formControlNames.age].patchValue('');
    }
  }

  /**
   * @description This method calculates the age for the given date.
   *
   * @param {Date} bDay
   * @returns
   * @memberof DemographicComponent
   */
  calculateAge(bDay: Date) {
    const now = new Date();
    const born = new Date(bDay);
    const years = Math.floor((now.getTime() - born.getTime()) / (365.25 * 24 * 60 * 60 * 1000));

    if (this.dataModification) {
      this.oldAge = years;
      return years;
    }
    if (years > 150) {
      this.userForm.controls[this.formControlNames.dateOfBirth].markAsTouched();
      this.userForm.controls[this.formControlNames.dateOfBirth].setErrors({
        incorrect: true
      });
      this.userForm.controls[this.formControlNames.year].setErrors(null);
      return '';
    } else {
      this.userForm.controls[this.formControlNames.dateOfBirth].markAsUntouched();
      this.userForm.controls[this.formControlNames.dateOfBirth].setErrors(null);
      this.userForm.controls[this.formControlNames.year].setErrors(null);
      this.oldAge = years;
      return years;
    }
  }

  /**
   * @description This is used for the tranliteration.
   *
   * @param {FormControl} fromControl
   * @param {*} toControl
   * @memberof DemographicComponent
   */
  onTransliteration(fromControl: FormControl, toControl: any) {
    if (fromControl.value) {
      const request: any = {
        from_field_lang: this.primaryLang,
        from_field_value: fromControl.value,
        to_field_lang: this.secondaryLang,
        to_field_value: ''
      };

      if (this.primaryLang === this.secondaryLang) {
        this.transUserForm.controls[toControl].patchValue(fromControl.value);
        return;
      }

      this.subscriptions.push(
        this.dataStorageService.getTransliteration(request).subscribe(
          response => {
            if (response[appConstants.RESPONSE])
              this.transUserForm.controls[toControl].patchValue(response[appConstants.RESPONSE].to_field_value);
            else {
              this.onError(this.errorlabels.error, '');
            }
          },
          error => {
            this.onError(this.errorlabels.error, error);
            this.loggerService.error(error);
          }
        )
      );
    } else {
      this.transUserForm.controls[toControl].patchValue('');
    }
  }

  /**
   * @description This is a custom validator, which check for the white spaces.
   *
   * @private
   * @param {FormControl} control
   * @returns
   * @memberof DemographicComponent
   */
  private noWhitespaceValidator(control: FormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { whitespace: true };
  }

  /**
   * @description This is called to submit the user form in case od modify or create.
   *
   * @memberof DemographicComponent
   */
  onSubmit() {
    this.markFormGroupTouched(this.userForm);
    this.markFormGroupTouched(this.transUserForm);
    if (this.userForm.valid && this.transUserForm.valid && this.dataIncomingSuccessful) {
      const identity = this.createIdentityJSONDynamic();
      const request = this.createRequestJSON(identity);
      const responseJSON = this.createResponseJSON(identity);
      this.dataUploadComplete = false;
      if (this.dataModification) {
        let preRegistrationId = this.user.preRegId;
        this.subscriptions.push(
          this.dataStorageService.updateUser(request, preRegistrationId).subscribe(
            response => {
              if (
                (response[appConstants.NESTED_ERROR] === null && response[appConstants.RESPONSE] === null) ||
                response[appConstants.NESTED_ERROR] !== null
              ) {
                let message = '';
                if (
                  response[appConstants.NESTED_ERROR][0][appConstants.ERROR_CODE] ===
                  appConstants.ERROR_CODES.invalidPin
                ) {
                  message = this.formValidation(response);
                } else message = this.errorlabels.error;
                this.onError(message, '');
                return;
              } else {
                this.onModification(responseJSON);
              }
              this.onSubmission();
            },
            error => {
              this.loggerService.error(error);
              this.onError(this.errorlabels.error, error);
            }
          )
        );
      } else {
        this.subscriptions.push(
          this.dataStorageService.addUser(request).subscribe(
            response => {
              if (
                (response[appConstants.NESTED_ERROR] === null && response[appConstants.RESPONSE] === null) ||
                response[appConstants.NESTED_ERROR] !== null
              ) {
                this.loggerService.error(JSON.stringify(response));
                let message = '';
                if (
                  response[appConstants.NESTED_ERROR] &&
                  response[appConstants.NESTED_ERROR][0][appConstants.ERROR_CODE] ===
                    appConstants.ERROR_CODES.invalidPin
                ) {
                  message = this.formValidation(response);
                } else message = this.errorlabels.error;
                this.onError(message, '');
                return;
              } else {
                this.onAddition(response, responseJSON);
              }
              this.onSubmission();
            },
            error => {
              this.loggerService.error(error);
              this.onError(this.errorlabels.error, error);
            }
          )
        );
      }
    }
  }

  formValidation(response: any) {
    const str = response[appConstants.NESTED_ERROR][0]['message'];
    const attr = str.substring(str.lastIndexOf('/') + 1);
    let message = this.errorlabels[attr];
    this.userForm.controls[this.formControlNames[attr]].setErrors({
      incorrect: true
    });
    return message;
  }

  /**
   * @description This is called when user chooses to modify the data.
   *
   * @private
   * @param {ResponseModel} request
   * @memberof DemographicComponent
   */
  private onModification(request: ResponseModel) {
    this.regService.updateUser(
      this.step,
      new UserModel(this.preRegId, request, this.regService.getUserFiles(this.step), this.codeValue)
    );
    this.bookingService.updateNameList(this.step, {
      fullName: this.userForm.controls[this.formControlNames.fullName].value,
      fullNameSecondaryLang: this.transUserForm.controls[this.formControlNames.fullNameSecondary].value,
      preRegId: this.preRegId,
      postalCode: this.userForm.controls[this.formControlNames.postalCode].value,
      regDto: this.bookingService.getNameList()[0].regDto
    });
  }

  /**
   * @description This is called when user creates a new application.
   *
   * @private
   * @param {*} response
   * @param {ResponseModel} request
   * @memberof DemographicComponent
   */
  private onAddition(response: any, request: ResponseModel) {
    this.preRegId = response[appConstants.RESPONSE][appConstants.DEMOGRAPHIC_RESPONSE_KEYS.preRegistrationId];
    this.regService.addUser(new UserModel(this.preRegId, request, this.files, this.codeValue));
    this.bookingService.addNameList({
      fullName: this.userForm.controls[this.formControlNames.fullName].value,
      fullNameSecondaryLang: this.transUserForm.controls[this.formControlNames.fullNameSecondary].value,
      preRegId: this.preRegId,
      postalCode: this.userForm.controls[this.formControlNames.postalCode].value
    });
  }

  /**
   * @description After sumission of the form, the user is route to file-upload or preview page.
   *
   * @memberof DemographicComponent
   */
  onSubmission() {
    this.canDeactivateFlag = false;
    this.loggerService.info('regService.getUsers', this.regService.getUsers());
    this.checked = true;
    this.dataUploadComplete = true;
    let url = '';
    if (this.message['modifyUserFromPreview'] === 'true') {
      url = Utils.getURL(this.router.url, 'summary/preview');
    } else {
      url = Utils.getURL(this.router.url, 'file-upload');
    }
    this.router.navigate([url]);
  }

  /**
   * @description THis is to create the attribute array for the Identity modal.
   *
   * @private
   * @param {string} element
   * @param {IdentityModel} identity
   * @memberof DemographicComponent
   */
  private createAttributeArray(element: string, identity: IdentityModel) {
    let attr: any;
    if (typeof identity[element] === 'object') {
      let forms = [];
      let formControlNames = [];
      const transliterateField = ['fullName', 'addressLine1', 'addressLine2', 'addressLine3'];
      if (transliterateField.includes(element)) {
        forms = ['userForm', 'transUserForm'];
        formControlNames = [element, element + 'Secondary'];
      } else {
        forms = ['userForm', 'userForm'];
        formControlNames = [element, element];
      }
      attr = [];
      for (let index = 0; index < this.languages.length; index++) {
        const languageCode = this.languages[index];
        const form = forms[index];
        const controlName = formControlNames[index];
        attr.push(new AttributeModel(languageCode, this[form].controls[this.formControlNames[controlName]].value));
      }
    } else if (typeof identity[element] === 'string' && this.userForm.controls[this.formControlNames[element]].value) {
      attr = this.userForm.controls[this.formControlNames[element]].value;
    }
    identity[element] = attr;
  }

  /**
   * @description This method mark all the form control as touched
   *
   * @private
   * @param {FormGroup} formGroup
   * @memberof DemographicComponent
   */
  private markFormGroupTouched(formGroup: FormGroup) {
    (<any>Object).values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control.controls) {
        this.markFormGroupTouched(control);
      }
    });
  }

  /**
   * @description This is to create the identity modal
   *
   * @private
   * @returns
   * @memberof DemographicComponent
   */
  private createIdentityJSONDynamic() {
    const identity = new IdentityModel(1, [], '', [], [], [], [], [], [], [], [], [], '', '', '', '');
    let keyArr: any[] = Object.keys(this.formControlNames);
    for (let index = 0; index < keyArr.length - 8; index++) {
      const element = keyArr[index];
      this.createAttributeArray(element, identity);
    }
    return identity;
  }

  /**
   * @description This is to create the request modal.
   *
   * @private
   * @param {IdentityModel} identity
   * @returns
   * @memberof DemographicComponent
   */
  private createRequestJSON(identity: IdentityModel) {
    let langCode = this.primaryLang;
    if (this.user) {
      langCode = this.user.request.langCode;
    }
    const req: RequestModel = {
      langCode: langCode,
      demographicDetails: new DemoIdentityModel(identity)
    };
    return req;
  }

  /**
   * @description This is the response modal.
   *
   * @private
   * @param {IdentityModel} identity
   * @returns
   * @memberof DemographicComponent
   */
  private createResponseJSON(identity: IdentityModel) {
    let preRegistrationId = '';
    let createdBy = this.loginId;
    let createdDateTime = Utils.getCurrentDate();
    let updatedDateTime = '';
    let langCode = this.primaryLang;
    if (this.user) {
      preRegistrationId = this.user.preRegId;
      createdBy = this.user.request.createdBy;
      createdDateTime = this.user.request.createdDateTime;
      updatedDateTime = Utils.getCurrentDate();
      langCode = this.user.request.langCode;
    }
    const req: ResponseModel = {
      preRegistrationId: preRegistrationId,
      createdBy: createdBy,
      createdDateTime: createdDateTime,
      updatedDateTime: updatedDateTime,
      langCode: langCode,
      demographicDetails: new DemoIdentityModel(identity)
    };
    return req;
  }

  /**
   * @description This is a dialoug box whenever an erroe comes from the server, it will appear.
   *
   * @private
   * @memberof DemographicComponent
   */
  private onError(message: string, error: any) {
    this.dataUploadComplete = true;
    this.hasError = true;
    this.titleOnError = this.errorlabels.errorLabel;
    // this.errorService.onError(this.titleOnError, message, error, this.errorlabels);

    if (
      error &&
      error[appConstants.ERROR] &&
      error[appConstants.ERROR][appConstants.NESTED_ERROR] &&
      error[appConstants.ERROR][appConstants.NESTED_ERROR][0].errorCode === appConstants.ERROR_CODES.tokenExpired
    ) {
      message = this.errorlabels.tokenExpiredLogout;
      this.titleOnError = '';
    }
    const body = {
      case: 'ERROR',
      title: this.titleOnError,
      message: message,
      yesButtonText: this.errorlabels.button_ok
    };
    this.dialog.open(DialougComponent, {
      width: '250px',
      data: body
    });
  }

  /**
   * @description This method is called to open a virtual keyvboard in the specified languaged.
   *
   * @param {string} formControlName
   * @param {number} index
   * @memberof DemographicComponent
   */
  onKeyboardDisplay(formControlName: string, index: number) {
    let control: AbstractControl;
    let lang: string;
    if (this.userForm.controls[formControlName]) {
      control = this.userForm.controls[formControlName];
      lang = appConstants.virtual_keyboard_languages[this.primaryLang];
    } else {
      control = this.transUserForm.controls[formControlName];
      lang = appConstants.virtual_keyboard_languages[this.secondaryLang];
    }
    if (this.oldKeyBoardIndex == index && this.matKeyboardService.isOpened) {
      this.matKeyboardService.dismiss();
    } else {
      let el: ElementRef;
      this.oldKeyBoardIndex = index;
      el = this._attachToElementMesOne._results[index];
      el.nativeElement.focus();
      this._keyboardRef = this.matKeyboardService.open(lang);
      this._keyboardRef.instance.setInputInstance(el);
      this._keyboardRef.instance.attachControl(control);
    }
  }

  scrollUp(ele: HTMLElement) {
    ele.scrollIntoView({ behavior: 'smooth' });
  }

  @HostListener('blur', ['$event'])
  @HostListener('focusout', ['$event'])
  private _hideKeyboard() {
    if (this.matKeyboardService.isOpened) {
      this.matKeyboardService.dismiss();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
