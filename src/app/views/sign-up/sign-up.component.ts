import { Component, OnInit } from '@angular/core';
import { RiseButtonComponent } from '../../components/rise-button/rise-button.component';
import { RiseTextInputComponent } from '../../components/rise-text-input/rise-text-input.component';
import { RiseToolbarComponent } from '../../components/rise-toolbar/rise-toolbar.component';
import { TranslateModule } from '@ngx-translate/core';
import { RiseDropdownComponent } from '../../components/rise-dropdown/rise-dropdown.component';
import { AuthService } from '../../services/api/auth.service';
import { Register } from '../../shared/models/register';
import { User } from '../../shared/models/user';
import { Organization } from '../../shared/models/organization';
import { UserRegistration } from '../../shared/models/user-registration';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [RiseButtonComponent, RiseDropdownComponent, RiseTextInputComponent, RiseToolbarComponent, TranslateModule],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css'
})

export class SignUpComponent implements OnInit {
  m_oRegisterInput: UserRegistration = {} as UserRegistration;

  m_oUserInfoInput: User = {} as User;

  m_oOrgInfoInput: Organization = {} as Organization;

  m_aoOrganizationTypes: Array<any> = [];

  m_oEmailInputs = {
    email: "",
    confirmEmail: ""
  }

  m_oPasswordInputs = {
    password: "",
    confirmPw: ""
  }

  constructor(private m_oAuthService: AuthService) { }

  ngOnInit(): void {
    this.getOrganizationTypes();
  }

  validatePassword(sPassword: string, sConfirmPw: string): boolean {
    // Minimum 8 Characters, at least one letter, one number, and one special character:
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}/;
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
      return true
    }
  }

  validatePhone(sPhone: string): boolean {
    return true;
  }

  getOrganizationTypes() {

  }

  register() {
    //Check validations 
    if (this.validateEmail(this.m_oEmailInputs.email, this.m_oEmailInputs.confirmEmail)) {
      this.m_oUserInfoInput.email = this.m_oEmailInputs.email;
    }
    if(this.validatePassword(this.m_oPasswordInputs.password, this.m_oPasswordInputs.confirmPw)) {
      this.m_oRegisterInput.password = this.m_oPasswordInputs.password;
    }
    //TODO Phone Number Validations 
    
    this.m_oRegisterInput.user = this.m_oUserInfoInput;
    this.m_oRegisterInput.organization = this.m_oOrgInfoInput;

    // this.m_oAuthService.registerUser(this.m_oRegisterInput).subscribe({
    //   next: oResponse => {},
    //   error: oError => {}
    // })
  }
}
