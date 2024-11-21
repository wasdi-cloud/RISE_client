import {Component, OnInit} from '@angular/core';

import {CommonModule} from '@angular/common';
import {TranslateModule, TranslateService} from '@ngx-translate/core';

import {RiseButtonComponent} from '../../../components/rise-button/rise-button.component';
import {RiseCheckboxComponent} from '../../../components/rise-checkbox/rise-checkbox.component';
import {RiseDropdownComponent} from '../../../components/rise-dropdown/rise-dropdown.component';
import {RiseTextInputComponent} from '../../../components/rise-text-input/rise-text-input.component';
import {UserViewModel} from '../../../models/UserViewModel';
import {OrganizationsService} from '../../../services/api/organizations.service';
import {OrganizationViewModel} from '../../../models/OrganizationViewModel';
import {ConstantsService} from '../../../services/constants.service';
import {NotificationOptions} from '../../../shared/notification-options/notification-options';
import FadeoutUtils from '../../../shared/utilities/FadeoutUtils';
import {UserService} from '../../../services/api/user.service';
import {ChangeEmailViewModel} from '../../../models/ChangeEmailViewModel';
import {NotificationsDialogsService} from '../../../services/notifications-dialogs.service';
import {MatDialog} from '@angular/material/dialog';
import {OtpDialogComponent} from '../../../dialogs/otp-dialog/otp-dialog.component';
import {OTPVerifyViewModel} from '../../../models/OTPVerifyViewModel';
import {AuthService} from '../../../services/api/auth.service';
import {ChangePasswordRequestViewModel} from "../../../models/ChangePasswordRequestViewModel";
import {OTPViewModel} from "../../../models/OTPViewModel";

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
  m_bValidPw: boolean = true;

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
  m_oPasswordInputs = {
    currentPW: '',
    newPw: '',
    verifyNewPw: '',
  };

  m_oEmail;
  //TODO : UPDATE USER INFORMATION
  m_sPasswordError: string = '';

  constructor(
    private m_oAuthService: AuthService,
    private m_oConstantsService: ConstantsService,
    private m_oDialog: MatDialog,
    private m_oNotificationDialogService: NotificationsDialogsService,
    private m_oOrganizationService: OrganizationsService,
    private m_oTranslate: TranslateService,
    private m_oUserService: UserService,
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
            error: (oError) => {
            },
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
      error: (oError) => {
      },
    });
  }

  changePassword() {
    let oChangePasswordRequest: ChangePasswordRequestViewModel = {
      oldPassword: this.m_oPasswordInputs.currentPW,
      newPassword: this.m_oPasswordInputs.newPw
    }
    this.m_oUserService.updatePassword(oChangePasswordRequest).subscribe({
      next: (oResponse) => {
        this.confirmChangePassword(oResponse)
      }, error: (oError) => {
        this.m_oNotificationDialogService.openSnackBar(
          "Password did not change",
          'Error',
          'danger'
        )
      }
    })
  }

  /**
   * Use case: The user can select the default language to use in RISE: English, French, Spanish, Arabic
   */
  changeLanguage() {
  }

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

  validatePassword(): boolean {
    let sPassword = this.m_oPasswordInputs.newPw;
    let sConfirmPw = this.m_oPasswordInputs.verifyNewPw;
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


  enableChangePassword() {
    if (!this.m_oPasswordInputs.currentPW) {

      return false;
    } else if (
      !this.m_oPasswordInputs.newPw ||
      !this.m_oPasswordInputs.verifyNewPw
    ) {

      return false;
    } else if (!this.validatePassword()) {

      return false;
    }
    return true;
  }

  private confirmChangePassword(oOtpViewModel: OTPViewModel) {

    this.m_oDialog
      .open(OtpDialogComponent, {
        data: {
          userId: this.m_oUser.userId,
        },
      })
      .afterClosed()
      .subscribe((sDialogResult) => {
        oOtpViewModel.userProvidedCode = sDialogResult;
        this.m_oAuthService.verifyOTP(oOtpViewModel).subscribe({
          next: (oResponse) => {

            let oOtpVm = {
              id: oOtpViewModel.id,
              userId: oOtpViewModel.userId,
            };
            if (oResponse.status === 200) {
              this.m_oUserService
                .confirmNewPassword(oOtpVm)
                .subscribe({
                  next: (oResponse) => {
                    this.getUserInfo();
                    this.m_oNotificationDialogService.openSnackBar(
                      "Password Changed Successfully",
                      "Success",
                      "success"
                    )
                  },
                  error: (oError) => {
                    console.log(oResponse);
                  },
                });
            }
          },
        });
      });
  }
}
