import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';

import {TranslateModule, TranslateService} from '@ngx-translate/core';

import {AuthService} from '../../services/api/auth.service';

import {RiseButtonComponent} from '../../components/rise-button/rise-button.component';
import {RiseDropdownComponent} from '../../components/rise-dropdown/rise-dropdown.component';
import {RiseTextInputComponent} from '../../components/rise-text-input/rise-text-input.component';
import {RiseToolbarComponent} from '../../components/rise-toolbar/rise-toolbar.component';

import {OrganizationViewModel} from '../../models/OrganizationViewModel';
import {RegisterViewModel} from '../../models/RegisterViewModel';
import {UserViewModel} from '../../models/UserViewModel';
import {OrganizationTypes} from '../../shared/organization-types';
import {NgIf} from '@angular/common';
import {NotificationsDialogsService} from '../../services/notifications-dialogs.service';
import {Router} from "@angular/router";

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [
    FormsModule,
    RiseButtonComponent,
    RiseDropdownComponent,
    RiseTextInputComponent,
    RiseToolbarComponent,
    TranslateModule,
    NgIf,
  ],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css',
})
export class SignUpComponent {
  m_oRegisterInput: RegisterViewModel = {} as RegisterViewModel;

  m_oUserInfoInput: UserViewModel = {} as UserViewModel;

  m_oOrgInfoInput: OrganizationViewModel = {
    city: '',
    country: '',
    name: '',
    number: '',
    phone: '',
    postalCode: '',
    street: '',
    type: '',
  };

  m_aoOrganizationTypes: Array<any> = OrganizationTypes;

  m_sCurrentPg: string = 'username';

  m_oEmailInputs = {
    email: '',
    confirmEmail: '',
  };

  m_oPasswordInputs = {
    password: '',
    confirmPw: '',
  };

  m_sEmailError: string = '';
  m_sPasswordError: string = '';
  m_sOrgError: string = '';
  m_sPersonalError: string = '';
  m_bPersonalValid: boolean = true;

  m_bEmailIsValid: boolean = true;

  m_bOrgIsValid: boolean = true;

  m_bUsernameIsValid: boolean = true;

  m_sUsernameError: string = '';

  constructor(
    private m_oAuthService: AuthService,
    private m_oNotificationService: NotificationsDialogsService,
    private m_oTranslate: TranslateService,
    private m_oRouter: Router
  ) {
  }

  ngOnInit() {
    this.resetFormVariables();
  }

  /***********************
   * Custom Form Validators
   ************************/
  /**
   * Check if the passwords entered match each other + password criteria
   * @returns boolean
   */
  validatePassword(): boolean {
    let sPassword = this.m_oPasswordInputs.password;
    let sConfirmPw = this.m_oPasswordInputs.confirmPw;
    // Minimum 8 Characters, at least one letter, one number, and one special character:
    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&,])[A-Za-z\d@$!%*#?&,]{8,}/;
    // If the user has modified both inputs
    if (sPassword && sConfirmPw) {
      //If the first password doesn't pass regex OR the pw's don't match
      if (!passwordRegex.test(sPassword)) {
        this.m_sPasswordError =
          'A good password contains: <br><ul><li>Minimum 8 characters</li><li>At least 1 letter</li><li>At least 1 capital letter</li><li>At least one number</li><li>At least one special character</li></ul>';
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

  /**
   * Check if the emails entered match each other + email criteria
   * @returns boolean
   */
  validateEmail(): boolean {
    let sEmail = this.m_oEmailInputs.email;
    let sConfirmEmail = this.m_oEmailInputs.confirmEmail;
    // Standard email regex:
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // if the user has modified both inputs
    if (sEmail && sConfirmEmail) {
      // if the first email doesn't pass Regex OR the emails don't match
      if (!emailRegex.test(sEmail) || sEmail !== sConfirmEmail) {
        this.m_sEmailError =
          'Please ensure the inputted emails are valid emails and match';
        return false;
      } else {
        return true;
      }
      // If there is no input, do not show validation message
    } else {
      return true;
    }
  }

  /**
   * TODO: Add phone number validation
   * @returns boolean
   */
  validatePhone(sPhone: string): boolean {
    return true;
  }

  register() {
    //Check validations
    if (this.validateEmail()) {
      this.m_oUserInfoInput.email = this.m_oEmailInputs.email;
    }
    if (this.validatePassword()) {
      this.m_oRegisterInput.password = this.m_oPasswordInputs.password;
    }

    this.m_oRegisterInput.admin = this.m_oUserInfoInput;
    this.m_oRegisterInput.organization = this.m_oOrgInfoInput;

    this.m_oAuthService.registerUser(this.m_oRegisterInput).subscribe({
      next: (oResponse) => {
        if (oResponse.status === 200) {
          //Alert User to success and re-direct to login
          this.m_oNotificationService.openInfoDialog(
            'User Registered - Check your email for a confirmation link',
            'success',
            'User Registered'
          );
          this.m_oRouter.navigateByUrl('/login')
        }
      },
      error: (oError) => {
        let asErrorCodes = oError.error.errorStringCodes.map((sCode) => {
          return `<li>${this.m_oTranslate.instant('ERROR_MSG.' + sCode)}</li>`;
        });

        console.log(asErrorCodes);
        let sErrorMsg = `'There were some problems with your inputted information. Please review your entries'<ul>
        ${asErrorCodes.toString().replaceAll(',', '')}
        </ul>`;
        this.m_oNotificationService.openInfoDialog(sErrorMsg, 'alert', 'Error');
        if (oError.error.errorStringCodes) {
          console.log(oError.error);
          this.handleAPIErrors(oError.error.errorStringCodes);
        }
      },
    });
  }

  handleSelection(oEvent) {
    if (oEvent.value) {
      this.m_oOrgInfoInput.type = oEvent.value;
    }
  }

  setPage(sPage) {
    this.m_sCurrentPg = sPage;
  }

  checkOrgInfo(bTouched?: boolean) {
    let bOrgIsValid = true;
    Object.entries(this.m_oOrgInfoInput).forEach((aEntry) => {
      aEntry[1] === '' ? (bOrgIsValid = false) : '';
    });

    if (!bOrgIsValid) {
      this.m_sOrgError = "Please ensure your organization's input is complete.";
    }

    if (bTouched) {
      return bOrgIsValid;
    }
    this.m_bOrgIsValid = bOrgIsValid;
    return this.m_bOrgIsValid;
  }

  checkPersonalInfo(bIsTouched) {
    let bIsValid = false;
    if (
      this.m_oUserInfoInput.name &&
      this.m_oUserInfoInput.surname &&
      this.m_oUserInfoInput.mobile
    ) {
      bIsValid = true;
    } else {
      this.m_sPersonalError =
        "Please ensure you've entered a name, surname, and mobile number";
      bIsTouched ? (bIsValid = false) : '';
    }

    return bIsValid;
  }

  handleAPIErrors(asStringCodes) {
    asStringCodes.forEach((sCode) => {
      if (sCode.includes('ORG')) {
        this.m_sOrgError = 'ERROR_MSG.' + sCode;
        this.m_bOrgIsValid = false;
      }
      if (sCode.includes('MAIL')) {
        this.m_sEmailError = 'ERROR_MSG.' + sCode;
        this.m_bEmailIsValid = false;
      }
      if (sCode.includes('USER')) {
        this.m_sUsernameError = 'ERROR_MSG.' + sCode;
        this.m_bUsernameIsValid = false;
      }
    });
    this.setPage('username');
  }

  enableUserInfo(): boolean {
    if (
      !this.m_oEmailInputs.email ||
      !this.m_oEmailInputs.confirmEmail ||
      !this.validateEmail()
    ) {

      return false;
    }
    if (
      !this.m_oPasswordInputs.password ||
      !this.m_oPasswordInputs.confirmPw ||
      !this.validatePassword()
    ) {

      return false;
    }

    if (
      !this.m_oUserInfoInput.acceptedPrivacy ||
      !this.m_oUserInfoInput.acceptedTermsAndConditions
    ) {

      return false;
    }

    if (!this.m_oUserInfoInput.userId) {
      return false;
    }
    return true;
  }

  private resetFormVariables() {
    console.log(this.m_oUserInfoInput)
    this.m_oRegisterInput = {} as RegisterViewModel;

    this.m_oUserInfoInput = {
      userId: ""
    } as UserViewModel;

    this.m_oOrgInfoInput = {
      city: '',
      country: '',
      name: '',
      number: '',
      phone: '',
      postalCode: '',
      street: '',
      type: '',
    };
    this.m_sCurrentPg = 'username';
    this.m_oEmailInputs = {
      email: '',
      confirmEmail: '',
    };

    this.m_oPasswordInputs = {
      password: '',
      confirmPw: '',
    };

    this.m_sEmailError = '';
    this.m_sPasswordError = '';
    this.m_sOrgError = '';
    this.m_sPersonalError = '';
    this.m_bPersonalValid = true;
    this.m_bEmailIsValid = true;
    this.m_bOrgIsValid = true;
    this.m_bUsernameIsValid = true;
    this.m_sUsernameError = '';
  }
}
