import {Component} from '@angular/core';
import {RiseTextInputComponent} from "../../components/rise-text-input/rise-text-input.component";
import {UserViewModel} from "../../models/UserViewModel";
import {RiseButtonComponent} from "../../components/rise-button/rise-button.component";
import {RiseCheckboxComponent} from "../../components/rise-checkbox/rise-checkbox.component";

@Component({
  selector: 'app-confirm-registration',
  standalone: true,
  imports: [
    RiseTextInputComponent,
    RiseButtonComponent,
    RiseCheckboxComponent
  ],
  templateUrl: './confirm-registration.component.html',
  styleUrl: './confirm-registration.component.css'
})
export class ConfirmRegistrationComponent {
  m_oPasswordInputs = {
    password: '',
    confirmPw: '',
  };
  m_oUserInfoInput: UserViewModel = {} as UserViewModel;
  m_bPersonalValid: boolean = true;

  m_bEmailIsValid: boolean = true;

  m_bOrgIsValid: boolean = true;

  m_bUsernameIsValid: boolean = true;
  m_sEmilError: string = '';
  m_sPasswordError: string = '';
  m_sUsernameError: string = '';
  m_sPersonalError: string = '';
  m_bIsAgreeToTerms: any[];
  m_asTermsAndConditions: { label: string; value: string }[] = [
    {label: "I have read and accept the RISE terms and conditions ", value: "RISE terms and conditions"},
    {label: "I have read and accept the RISE Privacy policy", value: "RISE Privacy policy"}
  ];
  m_asTermsAndConditionSelected: string[] = [];


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

  }
}
