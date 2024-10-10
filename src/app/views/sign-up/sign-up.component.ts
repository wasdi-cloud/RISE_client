import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { AuthService } from '../../services/api/auth.service';

import { RiseButtonComponent } from '../../components/rise-button/rise-button.component';
import { RiseDropdownComponent } from '../../components/rise-dropdown/rise-dropdown.component';
import { RiseTextInputComponent } from '../../components/rise-text-input/rise-text-input.component';
import { RiseToolbarComponent } from '../../components/rise-toolbar/rise-toolbar.component';

import { OrganizationViewModel } from '../../models/OrganizationViewModel';
import { RegisterViewModel } from '../../models/RegisterViewModel';
import { UserViewModel } from '../../models/UserViewModel';

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
  ],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css',
})
export class SignUpComponent implements OnInit {
  m_oRegisterInput: RegisterViewModel = {} as RegisterViewModel;

  m_oUserInfoInput: UserViewModel = {} as UserViewModel;

  m_oOrgInfoInput: OrganizationViewModel = {} as OrganizationViewModel;

  m_aoOrganizationTypes: Array<any> = [];

  m_oEmailInputs = {
    email: '',
    confirmEmail: '',
  };

  m_oPasswordInputs = {
    password: '',
    confirmPw: '',
  };

  constructor(
    private m_oAuthService: AuthService,
    private m_oTranslate: TranslateService
  ) {}

  ngOnInit(): void {
    this.getOrganizationTypes();
  }

  validatePassword(sPassword: string, sConfirmPw: string): boolean {
    // Minimum 8 Characters, at least one letter, one number, and one special character:
    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}/;
    // If the user has modified both inputs
    if (sPassword && sConfirmPw) {
      //If the first password doesn't pass regex OR the pw's don't match
      if (!passwordRegex.test(sPassword) || sPassword !== sConfirmPw) {
        return false;
      } else {
        return true;
      }
      // IF there are no inputs, do not show validation msg
    } else {
      return true;
    }
  }

  validateEmail(sEmail: string, sConfirmEmail: string): boolean {
    // Standard email regex:
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // if the user has modified both inputs
    if (sEmail && sConfirmEmail) {
      // if the first email doesn't pass Regex OR the emails don't match
      if (!emailRegex.test(sEmail) || sEmail !== sConfirmEmail) {
        return false;
      } else {
        return true;
      }
      // If there is no input, do not show validation message
    } else {
      return true;
    }
  }

  validatePhone(sPhone: string): boolean {
    return true;
  }

  getOrganizationTypes() {}

  register() {
    //Check validations
    if (
      this.validateEmail(
        this.m_oEmailInputs.email,
        this.m_oEmailInputs.confirmEmail
      )
    ) {
      this.m_oUserInfoInput.email = this.m_oEmailInputs.email;
    }
    if (
      this.validatePassword(
        this.m_oPasswordInputs.password,
        this.m_oPasswordInputs.confirmPw
      )
    ) {
      this.m_oRegisterInput.password = this.m_oPasswordInputs.password;
    }

    this.m_oRegisterInput.admin = this.m_oUserInfoInput;
    this.m_oRegisterInput.organization = this.m_oOrgInfoInput;

    console.log(this.m_oRegisterInput);

    this.m_oAuthService.registerUser(this.m_oRegisterInput).subscribe({
      next: (oResponse) => {
        if (oResponse.status === 200) {
          alert('User Registered');
          alert('Organization Registered');
        }
      },
      error: (oError) => {
        if (oError.error.errorStringCodes) {
          let asTranslationKeys: Array<string> = oError.error.errorStringCodes;
          asTranslationKeys.forEach((sKey) =>
            console.log(this.m_oTranslate.instant(sKey))
          );
        }
      },
    });
  }
}
