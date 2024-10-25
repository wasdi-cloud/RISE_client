import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { RiseButtonComponent } from '../../../components/rise-button/rise-button.component';
import { RiseCheckboxComponent } from '../../../components/rise-checkbox/rise-checkbox.component';
import { RiseDropdownComponent } from '../../../components/rise-dropdown/rise-dropdown.component';
import { RiseTextInputComponent } from '../../../components/rise-text-input/rise-text-input.component';
import { UserViewModel } from '../../../models/UserViewModel';
import { OrganizationsService } from '../../../services/api/organizations.service';
import { OrganizationViewModel } from '../../../models/OrganizationViewModel';
import { ConstantsService } from '../../../services/constants.service';
import { NotificationOptions } from '../../../shared/notification-options/notification-options';

@Component({
  selector: 'user-account',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    RiseButtonComponent,
    RiseCheckboxComponent,
    RiseDropdownComponent,
    RiseTextInputComponent,
  ],
  templateUrl: './user-account.component.html',
  styleUrl: './user-account.component.css',
})
export class UserAccountComponent implements OnInit {
  m_oUser: UserViewModel = {} as UserViewModel;
  m_oOrganization: OrganizationViewModel = {} as OrganizationViewModel;
  m_aoNotificationOptions = NotificationOptions;
  //TODO : UPDATE USER INFORMATION
  constructor(
    private m_oConstantsService: ConstantsService,
    private m_oOrganizationService: OrganizationsService,
    private m_oTranslate: TranslateService
  ) {}

  ngOnInit(): void {
    this.getUserInfo();
    this.translateNotifications();
  }

  /**
   * Get user information from the server and set the user object
   */
  getUserInfo() {
    this.m_oOrganizationService.getByUser().subscribe({
      next: (oResponse) => {
        if (oResponse) {
          this.m_oOrganization = oResponse;
          this.m_oConstantsService.setOrganization(this.m_oOrganization);
        }
      },
      error: (oError) => {
        console.log(oError);
      },
    });
  }

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

  translateNotifications() {
    this.m_aoNotificationOptions = this.m_aoNotificationOptions.map(
      (oOption) => {
        return {
          label: this.m_oTranslate.instant(oOption.label),
          value: oOption.value,
        };
      }
    );
  }

  handleCheckboxChange(aoEvent: Array<string>) {
    console.log(aoEvent);
  }

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
