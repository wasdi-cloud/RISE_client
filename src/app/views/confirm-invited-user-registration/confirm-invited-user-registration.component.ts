import {Component, OnDestroy, OnInit} from '@angular/core';
import { RiseTextInputComponent } from '../../components/rise-text-input/rise-text-input.component';
import { UserViewModel } from '../../models/UserViewModel';
import { RiseButtonComponent } from '../../components/rise-button/rise-button.component';
import { RiseCheckboxComponent } from '../../components/rise-checkbox/rise-checkbox.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmInviteViewModel } from '../../models/ConfirmInviteViewModel';
import { AuthService } from '../../services/api/auth.service';
import FadeoutUtils from '../../shared/utilities/FadeoutUtils';
import { NotificationsDialogsService } from '../../services/notifications-dialogs.service';
import { RiseUtils } from '../../shared/utilities/RiseUtils';
import { RiseToolbarComponent } from '../../components/rise-toolbar/rise-toolbar.component';
import {RiseNumberInputComponent} from "../../components/rise-number-input/rise-number-input.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import {Subject, takeUntil} from "rxjs";

@Component({
  selector: 'app-confirm-registration',
  standalone: true,
  imports: [
    RiseTextInputComponent,
    RiseButtonComponent,
    RiseToolbarComponent,
    RiseNumberInputComponent,
    ReactiveFormsModule,
    TranslateModule,
    FormsModule,
  ],
  templateUrl: './confirm-invited-user-registration.component.html',
  styleUrl: './confirm-invited-user-registration.component.css',
})
export class ConfirmInvitedUserRegistrationComponent implements OnInit,OnDestroy {

  private m_oDestroy$: Subject<void> = new Subject<void>();
  m_oPasswordInputs = {
    password: '',
    confirmPw: '',
  };
  m_oUserInfoInput: UserViewModel = {} as UserViewModel;
  m_bPersonalValid: boolean = true;
  m_bUsernameIsValid: boolean = true;
  m_sPasswordError: string = '';
  m_sUsernameError: string = '';
  m_sPersonalError: string = '';
  m_oConfirmInviteModel: ConfirmInviteViewModel = {};


  constructor(
    private m_oActiveRoute: ActivatedRoute,
    private m_oAuthService: AuthService,
    private m_oNotificationService: NotificationsDialogsService,
    private m_oRouter: Router,
    private m_oRiseUtils: RiseUtils,
    private m_oTranslateService:TranslateService
  ) {}

  ngOnInit(): void {
    this.m_oActiveRoute.queryParams.subscribe((params) => {
      this.m_oConfirmInviteModel.email = params['mail'];
      this.m_oConfirmInviteModel.confirmationCode = params['code'];
    });
  }

ngOnDestroy() {
    this.m_oDestroy$.next();
    this.m_oDestroy$.complete();
}

  getUserLanguage(sEvent:any){
    if(!FadeoutUtils.utilsIsStrNullOrEmpty(sEvent)){
      this.m_oConfirmInviteModel.defaultLanguage=sEvent
    }
  }
  validatePassword(): boolean {
    let sPassword = this.m_oPasswordInputs.password;
    let sConfirmPw = this.m_oPasswordInputs.confirmPw;
    // Minimum 8 Characters, at least one letter, one number, and one special character:
    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}/;
    // If the user has modified both inputs
    if (sPassword && sConfirmPw) {
      //If the first password doesn't pass regex OR the pw's don't match
      if (!passwordRegex.test(sPassword)) {
        this.m_sPasswordError =
          'A good password contains: <br><ul><li>Minimum 8 characters</li><li>At least 1 letter</li><li>At least 1 number</li><li>At least 1 special character (@,$,!,%,*,#,?,&)</li></ul>';
        return false;
      } else if (sPassword !== sConfirmPw) {
        this.m_sPasswordError = 'The passwords do not match';
        return false;
      } else {
        return true;
      }
      // IF there are no inputs, do not show validation msg
    } else {
      return true;
    }
  }



  register() {

    let sInfoMessage=this.m_oTranslateService.instant('REGISTER.INVITED_USER_SUCCESS')
    let sErrorMessage=this.m_oTranslateService.instant('REGISTER.INVITED_USER_ERROR')
    if (this.validatePassword()) {
      this.m_oConfirmInviteModel.password = this.m_oPasswordInputs.password;
    }
    if(this.validateUserName()){
      this.m_oConfirmInviteModel.userId=this.m_oUserInfoInput.userId.trim()
    }
    if (this.verifyInputs()) {
      this.m_oAuthService.confirmUser(this.m_oConfirmInviteModel).pipe(takeUntil(this.m_oDestroy$)).subscribe({
        next: (oResponse) => {
          this.m_oNotificationService.openInfoDialog(
            sInfoMessage,
            'success',
            'User Registered'
          );
          this.m_oRouter.navigateByUrl('/login');
        },
        error: (oError) => {

          if (oError.error.errorStringCodes) {
            this.m_oRiseUtils.handleNotificationError(
              oError.error.errorStringCodes
            );
          }else{
            this.m_oNotificationService.openInfoDialog(
              sErrorMessage,
              'alert',
              'Error'
            );
          }
        },
      });
    } else {
      this.m_oNotificationService.openInfoDialog(
        'Please Verify Your Inputs',
        'danger',
        'Invalid Input'
      );
    }
  }

  verifyInputs() {
    if (
      FadeoutUtils.utilsIsStrNullOrEmpty(this.m_oUserInfoInput.userId) ||
      FadeoutUtils.utilsIsStrNullOrEmpty(this.m_oUserInfoInput.name) ||
      FadeoutUtils.utilsIsStrNullOrEmpty(this.m_oUserInfoInput.surname) ||
      FadeoutUtils.utilsIsStrNullOrEmpty(this.m_oUserInfoInput.mobile)
    ) {
      return false;
    }
    if (this.m_oUserInfoInput.acceptedPrivacy==null || this.m_oUserInfoInput.acceptedTermsAndConditions===null ) {
      return false;
    }
    this.m_oConfirmInviteModel.name = this.m_oUserInfoInput.name;
    this.m_oConfirmInviteModel.surname = this.m_oUserInfoInput.surname;
    this.m_oConfirmInviteModel.mobile = this.m_oUserInfoInput.mobile;
    this.m_oConfirmInviteModel.acceptedPrivacy = true;
    this.m_oConfirmInviteModel.acceptedTermsAndConditions = true;
    return true;
  }

  validateUserName(): boolean {

    let sUserNameErrorLength=this.m_oTranslateService.instant("REGISTER.USERNAME_ERROR_MESSAGE_LENGTH");
    let sUserNameErrorSpace=this.m_oTranslateService.instant("REGISTER.USERNAME_ERROR_MESSAGE_SPACES");
    let sUserNameErrorLowercase=this.m_oTranslateService.instant("REGISTER.USERNAME_ERROR_MESSAGE_LOWERCASE");
    if (this.m_oUserInfoInput.userId) {
      this.m_oUserInfoInput.userId= this.m_oUserInfoInput.userId.trim();
      if (this.m_oUserInfoInput.userId.length < 8) {
        this.m_sUsernameError =sUserNameErrorLength;
        return false;
      }

      if (/\s/.test(this.m_oUserInfoInput.userId)) {
        this.m_sUsernameError = sUserNameErrorSpace
        return false;
      }

      if (this.m_oUserInfoInput.userId !== this.m_oUserInfoInput.userId.toLowerCase()) {
        this.m_sUsernameError =sUserNameErrorLowercase;
        return false;
      }
    }
    return true;
  }
}
