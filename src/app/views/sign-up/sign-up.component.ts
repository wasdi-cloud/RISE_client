import {Component, OnInit} from '@angular/core';
import {NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Router} from '@angular/router';

import {TranslateModule, TranslateService} from '@ngx-translate/core';

import {AuthService} from '../../services/api/auth.service';
import {NotificationsDialogsService} from '../../services/notifications-dialogs.service';

import {RiseButtonComponent} from '../../components/rise-button/rise-button.component';
import {RiseDropdownComponent} from '../../components/rise-dropdown/rise-dropdown.component';
import {RiseTextInputComponent} from '../../components/rise-text-input/rise-text-input.component';
import {RiseToolbarComponent} from '../../components/rise-toolbar/rise-toolbar.component';

import {OrganizationViewModel} from '../../models/OrganizationViewModel';
import {RegisterViewModel} from '../../models/RegisterViewModel';
import {UserViewModel} from '../../models/UserViewModel';

import {OrganizationTypes} from '../../shared/organization-types';

import FadeoutUtils from '../../shared/utilities/FadeoutUtils';
import {RiseNumberInputComponent} from "../../components/rise-number-input/rise-number-input.component";
import {map} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {CountryViewModel} from "../../models/CountryViewModel";

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
    RiseNumberInputComponent,
  ],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css',
})
export class SignUpComponent implements OnInit {
  /**
   * UC_010 - Registration
   */
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
    internationalPrefix:'+352'
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

  m_bMobileIsValid: boolean = true;

  m_bIsSubmitted:boolean=false;

  m_aoCountries: CountryViewModel[] = [];

  m_oOrgCountry: CountryViewModel={}

  constructor(
    private m_oAuthService: AuthService,
    private m_oNotificationService: NotificationsDialogsService,
    private m_oTranslate: TranslateService,
    private m_oRouter: Router,
    private m_oHttp:HttpClient
  ) {
  }

  ngOnInit() {

    this.loadCountries();
    this.resetFormVariables();
  }

  /**
   * Handle changes to the organization type dropdown
   * UC: Admin selects the type of Organization between:
   *   Humanitarian NGO
   *   Research
   *   Commercial
   *   Educational
   *   Government
   *   Individual
   * @param oEvent
   */
  handleSelection(oEvent): void {
    if (oEvent.value) {
      this.m_oOrgInfoInput.type = oEvent.value;
    }
  }

  /**
   * Set the current page of the form
   * @param sPage
   */
  setPage(sPage): void {
    this.m_sCurrentPg = sPage;
  }

  /**
   * Enable the button to continue to the user's personal information
   * @returns boolean
   */
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

    if (!this.validateUserName()) {
      return false;
    }
    return true;
  }

  /**
   * Check if the organization information is valid - enables registration button
   * UC: Admin inserts the Organization Business Name; Admin selects the type of Organization between; Admin inserts the address of the Organization;
   * @param bTouched
   * @returns
   */
  checkOrgInfo(bTouched?: boolean): boolean {
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

  /**
   * Ensure all the personal information (Name, Surname, Mobile) is valid - enables button to move on to organization info
   * UC: Admin inserts a valid email; Admin confirms the inserted email; Admin inserts a Mobile Number
   * @returns boolean
   */
  checkPersonalInfo(): boolean {
    if (
      !this.m_oUserInfoInput.name ||
      !this.m_oUserInfoInput.surname ||
      !this.m_oUserInfoInput.mobile
    ) {
      this.m_sPersonalError =
        "Please ensure you've entered a name, surname, and mobile phone number";
      return false;
    }
    if (!this.validatePhone(this.m_oUserInfoInput.mobile)) {
      this.m_sPersonalError =
        "Please ensure the phone number you've entered is a valid format";
      return false;
    }
    return true;
  }

  /**
   * Executes the registration of the user and handles errors
   */
  register(): void {

    let sMessage=this.m_oTranslate.instant("REGISTER.SUCCESS_MESSAGE")
    let sTitle=this.m_oTranslate.instant("REGISTER.SUCCESS_TITLE")
    //Check validations
    if (this.validateEmail()) {
      this.m_oUserInfoInput.email = this.m_oEmailInputs.email;
    }
    if (this.validatePassword()) {
      this.m_oRegisterInput.password = this.m_oPasswordInputs.password;
    }
    this.m_oRegisterInput.admin = this.m_oUserInfoInput;
    this.m_oRegisterInput.organization = this.m_oOrgInfoInput;

    if (this.validateRegisterInputs()) {
      this.m_bIsSubmitted=true;
      this.m_oAuthService.registerUser(this.m_oRegisterInput).subscribe({
        next: (oResponse) => {

          if (oResponse.status === 200) {
            //Alert User to success and re-direct to login
            this.m_oNotificationService.openInfoDialog(
              sMessage,
              'success',
              sTitle
            );
            this.m_oRouter.navigateByUrl('/login');
          }
          this.m_bIsSubmitted=false;
        },
        error: (oError) => {
          this.m_bIsSubmitted=false;
          let asErrorCodes = Array.isArray(oError?.error?.errorStringCodes)
            ? oError.error.errorStringCodes.map(
              (sCode: string) =>
                `<li>${this.m_oTranslate.instant('ERROR_MSG.' + sCode)}</li>`
            )
            : [];
          let sErrorMsg = `'There were some issues with your inputted information. Please review your entries'<ul>
        ${asErrorCodes.toString().replaceAll(',', '')}
        </ul>`;
          this.m_oNotificationService.openInfoDialog(sErrorMsg, 'alert', 'Error');
          if (oError.error.errorStringCodes) {
            this.handleAPIErrors(oError.error.errorStringCodes);
          }
        },
      });
    }else{
      console.error("Validating register input : not validated")
    }

  }

  /**
   * Handle errors returned upon execution of the registration
   * @param asStringCodes
   */
  handleAPIErrors(asStringCodes): void {
    asStringCodes.forEach((sCode) => {
      if (sCode.includes('ORG')) {
        this.m_sOrgError = 'ERROR_MSG.' + sCode;
        // this.m_bOrgIsValid = false;
      }
      if (sCode.includes('MAIL')) {
        this.m_sEmailError = 'ERROR_MSG.' + sCode;
        // this.m_bEmailIsValid = false;
      }
      if (sCode.includes('USER')) {
        this.m_sUsernameError = 'ERROR_MSG.' + sCode;
        // this.m_bUsernameIsValid = false;
      }
    });
    this.setPage('username');
  }

  /***********************
   * Custom Form Validators
   ************************/
  /**
   * Check if the passwords entered match each other + password criteria
   * UC: Admin inserts a Password of at least 8 characters that mix at least one char, one number and one special symbol.
   * @returns boolean
   */
  validatePassword(): boolean {
    let sPassword = this.m_oPasswordInputs.password;
    let sConfirmPw = this.m_oPasswordInputs.confirmPw;
    // Minimum 8 Characters, at least one letter, one number, and one special character:
    //const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*#?&,\.])[A-Za-z\d@$!%*#?&,\.]{8,}$/;

    const sPasswordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d\s])[A-Za-z\d\S]{8,}$/;
    // If the user has modified both inputs
    if (sPassword && sConfirmPw) {
      //If the first password doesn't pass regex OR the pw's don't match
      if (!sPasswordRegex.test(sPassword)) {
        this.m_sPasswordError =
          'A good password contains: <br><ul><li>Minimum 8 characters</li><li>At least 1 lowercase letter</li><li>At least 1 capital letter</li><li>At least 1 number</li><li>At least 1 special character (@,$,!,%,*,#,?,&)</li></ul>';
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
   * UC: Admin inserts a valid email. Admin confirms the inserted email
   * @returns boolean
   */
  validateEmail(): boolean {

    // Standard email regex:
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // if the user has modified both inputs
    if (this.m_oEmailInputs.email && this.m_oEmailInputs.confirmEmail) {
      this.m_oEmailInputs.email = this.m_oEmailInputs.email.trim();
      this.m_oEmailInputs.confirmEmail = this.m_oEmailInputs.confirmEmail.trim();
      // if the first email doesn't pass Regex OR the emails don't match
      if (!emailRegex.test(this.m_oEmailInputs.email) || this.m_oEmailInputs.email !== this.m_oEmailInputs.confirmEmail) {
        this.m_sEmailError =
          'Please ensure the inputted emails are valid emails and match';
        return false;
      } else {
        return true;
      }
    } else {
      return true;
    }
  }

  /**
   * Check if the entered user name is valid
   * UC: Admin inserts a UserId of at least 8 characters
   * @returns boolean
   */
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

  /**
   * Validate that the phone number entered is valid
   * UC: Admin inserts a Mobile Number; Admin inserts a number for the organization (optional)
   * @returns boolean
   */
  validatePhone(sPhone: string): boolean {
    if (FadeoutUtils.utilsIsStrNullOrEmpty(sPhone)) {
      return true;
    }
    const sPhoneRegex = /^[0-9]{6,15}$/;
    if (!sPhoneRegex.test(sPhone)) {
      return false;
    }
    return true;
  }

  /**
   * Resets the form variables
   */
  private resetFormVariables(): void {
    this.m_oRegisterInput = {} as RegisterViewModel;

    this.m_oUserInfoInput = {
      userId: '',
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
      internationalPrefix:'+352'
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

  private validateRegisterInputs() {
    if(this.m_oRegisterInput==null) return false;
    if(this.m_oRegisterInput.password==null) return false;
    if(this.m_oRegisterInput.admin==null) return false;
    if(this.m_oRegisterInput.organization==null) return false;
    return true;
  }

  private loadCountries() {
    return this.m_oHttp.get<CountryViewModel[]>('assets/data/countries.json').pipe(
      map(data => data.sort((a, b) => a.name.localeCompare(b.name))) // Optional: Sort alphabetically
    ).subscribe(
      {
        next:(oValue)=>{
          this.m_aoCountries=oValue

        },
        error:(oError)=>{
          console.error(oError)
        }
      }
    );
  }

  setOrganizationCountry(event: any) {
    this.m_oOrgCountry=event.value;
    this.m_oOrgInfoInput.country = event.value.name;
  }
}
