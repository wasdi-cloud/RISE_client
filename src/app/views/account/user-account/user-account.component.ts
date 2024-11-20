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
import FadeoutUtils from '../../../shared/utilities/FadeoutUtils';
import { UserService } from '../../../services/api/user.service';
import { ChangeEmailViewModel } from '../../../models/ChangeEmailViewModel';
import { NotificationsDialogsService } from '../../../services/notifications-dialogs.service';
import { MatDialog } from '@angular/material/dialog';
import { OtpDialogComponent } from '../../../dialogs/otp-dialog/otp-dialog.component';
import { OTPVerifyViewModel } from '../../../models/OTPVerifyViewModel';
import { OTPViewModel } from '../../../models/OTPViewModel';
import { AuthService } from '../../../services/api/auth.service';

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
  m_aoSelectedNotifications = [];

  m_bValidEmail: boolean = true;

  m_aoLanguages = [
    {
      name: 'English',
      value: 'en',
    },
    {
      name: 'Español',
      value: 'es',
    },
    {
      name: 'Français',
      value: 'fr',
    },
    {
      name: 'عربي',
      value: 'ar',
    },
  ];

  m_oEmailInputs = {
    currentEmail: '',
    newEmail: '',
    verifyNewEmail: '',
  };

  m_oEmail;
  //TODO : UPDATE USER INFORMATION
  constructor(
    private m_oAuthService: AuthService,
    private m_oConstantsService: ConstantsService,
    private m_oDialog: MatDialog,
    private m_oNotificationDialogService: NotificationsDialogsService,
    private m_oOrganizationService: OrganizationsService,
    private m_oTranslate: TranslateService,
    private m_oUserService: UserService
  ) {
    m_oTranslate.addLangs(['en', 'es', 'fr', 'ar']);
    m_oTranslate.setDefaultLang('en');
  }

  ngOnInit(): void {
    this.getUserInfo();
    this.translateNotifications();
  }

  /**
   * Get user information from the server and set the user object
   */
  getUserInfo() {
    this.m_oUserService.getUser().subscribe({
      next: (oResponse) => {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {
          return;
        }
        this.m_oUser = oResponse;
        this.m_oEmailInputs.currentEmail = this.m_oUser.email;
        console.log(this.m_oUser);
        this.initCheckboxOptions();
      },
    });
    this.m_oOrganizationService.getByUser().subscribe({
      next: (oResponse) => {
        if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {
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
   * Save changes to the user id, name, surname, number, language, and notification settings
   */
  saveInformation() {
    let oBody = {
      name: this.m_oUser.name,
      surname: this.m_oUser.surname,
      mobile: this.m_oUser.mobile,
    };
    this.m_oUserService.updateUser(oBody).subscribe({
      next: (oResponse) => {
        console.log(oResponse);
      },
    });
  }

  translateLanguageTo(lang: any) {
    this.m_oTranslate.use(lang.value.value);
  }

  /**
   * Delete user account (initial call)
   */
  deleteUser() {
    let oOtpVm: OTPVerifyViewModel = {} as OTPVerifyViewModel;
    this.m_oNotificationDialogService
      .openConfirmationDialog(
        'Are you sure you want to delete your RISE account? This is a destructive action and cannot be undone.',
        'danger'
      )
      .subscribe((bResult) => {
        if (bResult) {
          this.m_oUserService.deleteAccount().subscribe({
            next: (oResponse) => {
              let oOTPVerifyVM = oResponse;
              this.m_oDialog
                .open(OtpDialogComponent, {
                  data: {
                    userId: this.m_oUser.userId,
                  },
                })
                .afterClosed()
                .subscribe((sDialogResult) => {
                  oOTPVerifyVM.userProvidedCode = sDialogResult;
                  this.m_oAuthService.verifyOTP(oOTPVerifyVM).subscribe({
                    next: (oResponse) => {
                      let oOtpVm = {
                        id: oOTPVerifyVM.id,
                        userId: oOTPVerifyVM.userId,
                      };
                      if (oResponse.status === 200) {
                        this.m_oUserService
                          .verifyDeleteAccount(oOtpVm)
                          .subscribe({
                            next: (oResponse) => {
                              this.m_oAuthService.logout();
                            },
                            error: (oError) => {
                              console.log(oResponse);
                            },
                          });
                      }
                    },
                  });
                });
            },
            error: (oError) => {},
          });
        }
      });
  }

  changeEmail() {
    let oEmailVM: ChangeEmailViewModel = {
      oldEmail: this.m_oUser.email,
      newEmail: this.m_oEmailInputs.newEmail,
    };
    this.m_oUserService.updateEmail(oEmailVM).subscribe({
      next: (oResponse) => {
        console.log(oResponse);
      },
      error: (oError) => {},
    });
  }

  changePassword() {}

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
    aoEvent.includes('notifyActivities')
      ? (this.m_oUser.notifyActivities = true)
      : (this.m_oUser.notifyActivities = false);
    aoEvent.includes('notifyMaintenance')
      ? (this.m_oUser.notifyMaintenance = true)
      : (this.m_oUser.notifyMaintenance = false);
    aoEvent.includes('notifyNewsletter')
      ? (this.m_oUser.notifyNewsletter = true)
      : (this.m_oUser.notifyNewsletter = false);
  }

  initCheckboxOptions() {
    Object.entries(this.m_oUser).forEach((oEntry) => {
      if (oEntry[0].includes('notify') && oEntry[1] === true) {
        this.m_aoSelectedNotifications.push(oEntry[0]);
      }
    });
  }

  initNotificationsVM() {
    let oNotificationsVM = {};
  }

  // The user can activate or deactivate the RISE mail notification:
  // Newsletter
  // Maintenance
  // Activities (added to organization, added to an area…)
  saveNotifications() {
    this.m_oUserService.updateNotifications(this.m_oUser).subscribe({
      next: (oResponse) => {
        this.m_oNotificationDialogService.openSnackBar(
          'Notification Settings Saved',
          'Success',
          'success'
        );
      },
      error: (oError) => {
        console.log(oError);
      },
    });
  }

  /**
   * Handle user inputs to enable the button to execute changing their email
   */
  enableChangeEmail(): boolean {
    if (!this.m_oEmailInputs.currentEmail) {
      return false;
    } else if (
      !this.m_oEmailInputs.newEmail ||
      !this.m_oEmailInputs.verifyNewEmail
    ) {
      return false;
    } else if (!this.validateEmail()) {
      return false;
    }
    return true;
  }

  validateEmail(): boolean {
    let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (
      !emailRegex.test(this.m_oEmailInputs.newEmail) ||
      !emailRegex.test(this.m_oEmailInputs.verifyNewEmail)
    ) {
      return false;
    } else if (
      this.m_oEmailInputs.newEmail !== this.m_oEmailInputs.verifyNewEmail
    ) {
      return false;
    } else if (
      this.m_oEmailInputs.currentEmail === this.m_oEmailInputs.newEmail ||
      this.m_oEmailInputs.currentEmail === this.m_oEmailInputs.verifyNewEmail
    ) {
      return false;
    } else if (this.m_oEmailInputs.currentEmail !== this.m_oUser.email) {
      return false;
    }
    return true;
  }

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
