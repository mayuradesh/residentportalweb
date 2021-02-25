import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DialougComponent } from 'src/app/shared/dialoug/dialoug.component';
import { MatDialog } from '@angular/material';
import { AuthService } from '../auth.service';
import { DataStorageService } from 'src/app/core/services/data-storage.service';
import { RegistrationService } from 'src/app/core/services/registration.service';
import { ConfigService } from 'src/app/core/services/config.service';
import * as appConstants from '../../app.constants';
import LanguageFactory from '../../../assets/i18n';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-request-uin',
  templateUrl: './request-uin.component.html',
  styleUrls: ['./request-uin.component.css']
})
export class RequestUinComponent implements OnInit,OnDestroy {

  disableBtn = false;
  timer:any ;
  inputOTP: string;
  showSendOTP = true;
  showResend = false;
  showVerify = false;
  showOTP = false;
  disableVerify = true;
  secondaryLanguagelabels: any;
  loggedOutLang: string;
  errorMessage: string;
  minutes: string;
  seconds: string;
  showSpinner = true;
  selectedLanguage= '';
  validationMessages = {};
  inputDetails = '';
  showDetail = true;
  idType : string;


  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private dialog: MatDialog,
    private dataService: DataStorageService,
    private regService: RegistrationService,
    private configService: ConfigService,
    private toast:ToastrService
  ) {
  }

  ngOnInit() {  
     this.setTimer();
     this.loadValidationMessages();
     
      if (this.authService.isAuthenticated()) {
        this.authService.onLogout();
      }
  }
  loadValidationMessages() {
    let langCode=localStorage.getItem('langCode');
    this.selectedLanguage = appConstants.languageMapping[langCode].langName;
    let factory = new LanguageFactory(langCode);
    let response = factory.getCurrentlanguage();
    this.validationMessages = response['authValidationMessages'];
    this.showSpinner=false;
  }
  setTimer() {
    const time = Number(this.configService.getConfigByKey(appConstants.CONFIG_KEYS.mosip_kernel_otp_expiry_time));
    if (!isNaN(time)) {
      const minutes = time / 60;
      const seconds = time % 60;
      if (minutes < 10) {
        this.minutes = '0' + minutes;
      } else {
        this.minutes = String(minutes);
      }
      if (seconds < 10) {
        this.seconds = '0' + seconds;
      } else {
        this.seconds = String(seconds);
      }
    } else {
      this.minutes = '02';
      this.seconds = '00';
    }
  }

   showVerifyBtn() {
    if (
      this.inputOTP.length ===
      Number(this.configService.getConfigByKey(appConstants.CONFIG_KEYS.mosip_kernel_otp_default_length))
    ) {
      this.showVerify = true;
      this.showResend = false;
      this.disableVerify = false;
    } else {
      this.disableVerify = true;
    }
  }
  submit(): void {
  if ((this.showSendOTP || this.showResend) && this.errorMessage === undefined )  {
      this.inputOTP = '';
      this.showResend = false;
      this.showVerify = true;
      this.showOTP = true;
      this.showSendOTP = false;
      this.showDetail = false;
      console.log("inside submit111");

      const timerFn = () => {
        let secValue = Number(document.getElementById('secondsSpan').innerText);
        const minValue = Number(document.getElementById('minutesSpan').innerText);

        if (secValue === 0) {
          secValue = 60;
          if (minValue === 0) {
            // redirecting to initial phase on completion of timer
           // this.showContactDetails = true;
            this.showSendOTP = true;
            this.showResend = false;
            this.showOTP = false;
            this.showVerify = false;
            this.showDetail = true;
            document.getElementById('minutesSpan').innerText = this.minutes;
            document.getElementById('timer').style.visibility = 'hidden';
            clearInterval(this.timer);
            return;
          }
          document.getElementById('minutesSpan').innerText = '0' + (minValue - 1);
        }

        if (secValue === 10 || secValue < 10) {
          document.getElementById('secondsSpan').innerText = '0' + --secValue;
        } else {
          document.getElementById('secondsSpan').innerText = --secValue + '';
        }
      };

      // update of timer value on click of resend
      if (document.getElementById('timer').style.visibility === 'visible') {
        document.getElementById('secondsSpan').innerText = this.seconds;
        document.getElementById('minutesSpan').innerText = this.minutes;
      } else {
        // initial set up for timer
        document.getElementById('timer').style.visibility = 'visible';
        this.timer = setInterval(timerFn, 1000);
      }

    this.showSpinner = true;
    this.dataService.generateToken().subscribe(response=>{
        this.dataService.sendOtpForServices(this.inputDetails,this.idType, response.headers.get("authorization")).subscribe(response=>{
          console.log("otp generated");
          this.showSpinner = false;
          if (!response['errors']) {
            this.showOtpMessage();
        } else {
            this.showSendOTP = true;
            this.showResend = false;
            this.showOTP = false;
            this.showVerify = false;
            this.showDetail = true;
            this.inputDetails = "";
            document.getElementById('timer').style.visibility = 'hidden';
            document.getElementById('minutesSpan').innerText = this.minutes;
            clearInterval(this.timer);
            this.showErrorMessage(response['errors'][0]["errorMessage"]);
        }
      },
      error => {
        this.showSpinner = false
        this.disableVerify = false;
        this.showErrorMessage("");
        });
    });
      // dynamic update of button text for Resend and Verify
    } else if (this.showVerify && this.errorMessage === undefined ) {
            this.disableVerify = true;
            document.getElementById('timer').style.visibility = 'visible';
            clearInterval(this.timer);
            this.requestPrintUin();   

      }
  
}
  requestPrintUin(){
    console.log("reqPrintUin");
    this.showSpinner = true;
    this.dataService.printUIN(this.inputDetails, this.inputOTP, this.idType).subscribe(response => {
      if (!response['errors']) {
        this.showSpinner = false;
        this.showResponseMessageDialog()
      } else {
        this.showSpinner = false;
        this.showSendOTP = true;
        this.showResend = false;
        this.showOTP = false;
        this.showVerify = false;
        this.showDetail = true;
        this.inputDetails = "";
        document.getElementById('timer').style.visibility = 'hidden';
        document.getElementById('minutesSpan').innerText = this.minutes;
        clearInterval(this.timer);
        this.showErrorMessage(response["errors"][0]["message"]);
      }
    }, error => {
        this.showSpinner = false
        this.disableVerify = false;
        this.showErrorMessage("");
    })
  }

  showOtpMessage() {
    this.inputOTP = '';
    let factory = new LanguageFactory(localStorage.getItem('langCode'));
    let response = factory.getCurrentlanguage();
    let otpmessage = response['authCommonText']['otpSent'];
    this.toast.success(otpmessage, "Success", {positionClass:"my-toast-class",progressBar:true} );

  }

  showErrorMessage(errMsg:string) {
    let factory = new LanguageFactory(localStorage.getItem('langCode'));
    let response = factory.getCurrentlanguage();
    let errormessage = response['error']['error'];
    if (errMsg == "")
    {
       this.toast.error(errormessage,"Error", {positionClass:"my-toast-class",progressBar:true})

    }
    else
    {
       this.toast.error(errMsg,"Error", {positionClass:"my-toast-class",progressBar:true})
      }
   
  }

  showResponseMessageDialog() {
    let factory = new LanguageFactory(localStorage.getItem('langCode'));
    let response = factory.getCurrentlanguage();
    let successMessage = response["reqPrintUin"]["reprint_success"];
    this.toast.success(successMessage, "Success", {positionClass:"my-toast-class",progressBar:true} );
  }
  ngOnDestroy(){
     clearInterval(this.timer);
   }

}