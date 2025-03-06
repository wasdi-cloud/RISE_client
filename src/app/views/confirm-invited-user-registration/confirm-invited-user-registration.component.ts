import { Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-confirm-registration',
  standalone: true,
  imports: [
    RiseTextInputComponent,
    RiseButtonComponent,
    RiseCheckboxComponent,
    RiseToolbarComponent,
  ],
  templateUrl: './confirm-invited-user-registration.component.html',
  styleUrl: './confirm-invited-user-registration.component.css',
})
export class ConfirmInvitedUserRegistrationComponent implements OnInit {
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
  m_asTermsAndConditions: { label: string; value: string }[] = [
    {
      label: 'I have read and accept the RISE terms and conditions ',
      value: 'RISE terms and conditions',
    },
    {
      label: 'I have read and accept the RISE Privacy policy',
      value: 'RISE Privacy policy',
    },
  ];
  m_asTermsAndConditionSelected: string[] = [];

  constructor(
    private m_oActiveRoute: ActivatedRoute,
    private m_oAuthService: AuthService,
    private m_oNotificationService: NotificationsDialogsService,
    private m_oRouter: Router,
    private m_oRiseUtils: RiseUtils
  ) {}

  ngOnInit(): void {
    this.m_oActiveRoute.queryParams.subscribe((params) => {
      this.m_oConfirmInviteModel.email = params['mail'];
      this.m_oConfirmInviteModel.confirmationCode = params['code'];
    });
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
          'A good password contains: <br><ul><li>Minimum 8 characters</li><li>At least 1 letter</li><li>At least one number</li><li>At least one special character</li></ul>';
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

  onSelectionChange(selectedValues) {
    this.m_asTermsAndConditionSelected = selectedValues;
  }

  register() {
    if (this.validatePassword()) {
      this.m_oConfirmInviteModel.password = this.m_oPasswordInputs.password;
    }
    if(this.validateUserName()){
      this.m_oConfirmInviteModel.userId=this.m_oUserInfoInput.userId.trim()
    }
    if (this.verifyInputs()) {
      this.m_oAuthService.confirmUser(this.m_oConfirmInviteModel).subscribe({
        next: (oResponse) => {
          this.m_oNotificationService.openInfoDialog(
            'You are successfully registered',
            'success',
            'User Registered'
          );
          this.m_oRouter.navigateByUrl('/login');
        },
        error: (oError) => {
          this.m_oNotificationService.openInfoDialog(
            'There were some problems with your inputted information. Please review your entries',
            'alert',
            'Error'
          );
          if (oError.error.errorStringCodes) {
            this.m_oRiseUtils.handleNotificationError(
              oError.error.errorStringCodes
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
    if (this.m_asTermsAndConditionSelected.length != 2) {
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
    if (this.m_oUserInfoInput.userId) {
      this.m_oUserInfoInput.userId= this.m_oUserInfoInput.userId.trim();
      if (this.m_oUserInfoInput.userId.length < 8) {
        this.m_sUsernameError =
          'Please ensure that user id is longer than 8 characters';
        return false;
      }

      if (/\s/.test(this.m_oUserInfoInput.userId)) {
        this.m_sUsernameError = 'User ID cannot contain spaces';
        return false;
      }

      if (this.m_oUserInfoInput.userId !== this.m_oUserInfoInput.userId.toLowerCase()) {
        this.m_sUsernameError = 'User ID must be all lowercase';
        return false;
      }
    }
    return true;
  }
}
