import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { MatDialog } from '@angular/material/dialog';

import { AuthService } from '../../services/api/auth.service';
import { ConstantsService } from '../../services/constants.service';
import { NotificationsDialogsService } from '../../services/notifications-dialogs.service';
import { UserService } from '../../services/api/user.service';

import { RiseButtonComponent } from '../../components/rise-button/rise-button.component';
import { RiseTextInputComponent } from '../../components/rise-text-input/rise-text-input.component';
import { RiseToolbarComponent } from '../../components/rise-toolbar/rise-toolbar.component';

import { UserCredentialsViewModel } from '../../models/UserCredentialsViewModel';

import { RiseUtils } from '../../shared/utilities/RiseUtils';
import FadeoutUtils from '../../shared/utilities/FadeoutUtils';

@Component({
  selector: 'app-login-view',
  standalone: true,
  imports: [
    RiseToolbarComponent,
    RiseButtonComponent,
    RiseTextInputComponent,
    TranslateModule,
    NgIf,
  ],
  templateUrl: './login-view.component.html',
  styleUrl: './login-view.component.css',
})
export class LoginViewComponent {
  /**
   * UC_020 - Login
   */
  public m_oUserInput: UserCredentialsViewModel = {
    userId: '',
    password: '',
  };

  public m_bShowOtp: boolean = false;

  public m_sErrorInput: string = '';

  public m_bValidOtp: boolean = true;

  public m_oOTPVerifyVM: any = {};
  m_bIsSubmitted: boolean =false;

  constructor(
    private m_oAuthService: AuthService,
    private m_oConstantsService: ConstantsService,
    private m_oDialog: MatDialog,
    private m_oNotificationService: NotificationsDialogsService,
    private m_oRouter: Router,
    private m_oRiseUtils: RiseUtils,
    private m_oTranslate: TranslateService,
    private m_oUserService: UserService
  ) {}

  /**
   * Execute initial login action - check credentials against DB and request OTP
   * UC: User inserts the User Id; User inserts the password; User submit the credentials info
   * If credentials are not valid, RISE gives to the User a message that Credentials are not valid and invites the Operator to try again.
   */
  executeLogin(): void {
    this.m_oAuthService.loginUser(this.m_oUserInput).subscribe({
      next: (oResponse) => {
        if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {
          this.m_oOTPVerifyVM = oResponse;
          this.m_bShowOtp = true;
        }
      },
      error: (oError) => {
        this.m_oRiseUtils.handleNotificationError(
          oError.error.errorStringCodes
        );
      },
    });
  }

  /**
   * Verifies the OTP entered by the User
   * UC: If credentials are valid, RISE ask to validate the login with OTP (UC_005)
   */
  verifyOtp(): void {
    this.m_bIsSubmitted=true;
    this.m_oAuthService.verifyOTP(this.m_oOTPVerifyVM).subscribe({
      next: (oResponse) => {
        if (oResponse.status === 200) {
          this.verifyLogin();

        }
      },
      error: (oError) => {
        this.m_oRiseUtils.handleNotificationError(
          oError.error.errorStringCodes
        );
        this.m_bIsSubmitted=false;
      },
    });
  }

  /**
   * Final login action - if OTP is valid, user is re-routed to RISE + Tokens saved
   * UC: If also the OTP is valid, RISE grants the access to the User.
   */
  verifyLogin(): void {
    let sError = this.m_oTranslate.instant('LOGIN.ERROR');
    let oOtpVerify = {
      id: this.m_oOTPVerifyVM.id,
      userId: this.m_oOTPVerifyVM.userId,
    };

    this.m_oAuthService.loginVerify(oOtpVerify).subscribe({
      next: (oResponse) => {
        if (oResponse.token) {
          //Set user Token and login
          this.m_oAuthService.saveToken(oResponse.token);
          this.m_oUserService.getUser().subscribe({
            next: (oResponse) => {
              if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {
                this.m_oNotificationService.openInfoDialog(sError, 'danger');
              } else {
                this.m_oConstantsService.setUser(oResponse);
                if(oResponse.defaultLanguage){
                  this.m_oTranslate.use(oResponse.defaultLanguage.toLowerCase());
                }
                this.m_oRouter.navigateByUrl('/dashboard');
              }
            },
            error:(oError)=>{
              this.m_bIsSubmitted=false;
            }
          });
          this.m_bIsSubmitted=false;
        }
      },
      error: (oError) => {
        if (oError.error.errorStringCodes) {
          this.handleAPIErrors(sError,oError.error.errorStringCodes);
        }
        this.m_bIsSubmitted=false;

      },
    });
  }
  handleAPIErrors(sError,asStringCodes): void {
    asStringCodes.forEach((sCode) => {
      if (sCode.includes('WARNING_API_PASSWORD_EXPIRED')) {
        this.m_oRouter.navigate(['/password-expired', this.m_oUserInput.userId]);
      }else{
        this.m_oNotificationService.openInfoDialog(sError, 'danger');
      }

    });

  }
  /**
   * Navigate the user back to the Login View
   */
  backToLogin(): void {
    this.m_bIsSubmitted=false;
    this.m_bShowOtp = false;
  }

  toForgetPassword() {
    this.m_oRouter.navigateByUrl('/forget-password')
  }
}
