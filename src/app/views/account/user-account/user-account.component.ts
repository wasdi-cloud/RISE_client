import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { RiseButtonComponent } from '../../../components/rise-button/rise-button.component';
import { RiseCheckBoxComponent } from '../../../components/rise-check-box/rise-check-box.component';
import { RiseDropdownComponent } from '../../../components/rise-dropdown/rise-dropdown.component';
import { RiseTextInputComponent } from '../../../components/rise-text-input/rise-text-input.component';
import { UserViewModel } from '../../../models/UserViewModel';

@Component({
  selector: 'user-account',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    RiseButtonComponent,
    RiseCheckBoxComponent,
    RiseDropdownComponent,
    RiseTextInputComponent,
  ],
  templateUrl: './user-account.component.html',
  styleUrl: './user-account.component.css',
})
export class UserAccountComponent implements OnInit {
  m_oUser: UserViewModel = {} as UserViewModel;
  //TODO : UPDATE USER INFORMATION
  constructor() {}

  ngOnInit(): void {
    this.getUserInfo();
  }

  /**
   * Get user information from the server and set the user object
   */
  getUserInfo() {}

  /**
   * Delete user account
   */
  deleteUser() {}

  changeEmail() {}

  changePassword() {}

  /**
   * Save changes to the user id, name, surname, number, language, and notification settings
   */
  saveInformation() {}

  /**
   * Use case: The user can select the default language to use in RISE: English, French, Spanish, Arabic
   */
  changeLanguage() {}

  // The user can activate or deactivate the RISE mail notification:
  // Newsletter
  // Maintenance
  // Activities (added to organization, added to an area…)

  // The user can change the email
  // The user must confirm the new email
  // RISE will send a verification email
  // User must click on the confirmation link
  // The user can change the password
  // The user must insert the old password
  // The user must insert the new password
  // The user must confirm the new password
  // The user submit the password change request
  // RISE ask to the user the confirmation with OTP (UC_005)
  // If the OTP is correct RISE updates the password of the User.
  // The user can request to be deleted from RISE
  // RISE ask confirmation for the deletion
  // If the user confirms, RISE ask another confirmation with OTP (UC_005)
  // If the OTP is correct RISE delete the User.
}
