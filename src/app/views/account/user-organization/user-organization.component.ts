import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {TranslateModule, TranslateService} from '@ngx-translate/core';

import {NotificationsDialogsService} from '../../../services/notifications-dialogs.service';
import {OrganizationsService} from '../../../services/api/organizations.service';
import {UserService} from '../../../services/api/user.service';

import {MatDialog} from '@angular/material/dialog';

import {InviteUserComponent} from './invite-user/invite-user.component';
import {RiseButtonComponent} from '../../../components/rise-button/rise-button.component';
import {
  EditableUser,
  RiseCollaboratorsComponent,
} from '../../../components/rise-collaborators/rise-collaborators.component';
import {RiseDropdownComponent} from '../../../components/rise-dropdown/rise-dropdown.component';
import {RiseTextInputComponent} from '../../../components/rise-text-input/rise-text-input.component';

import {OrganizationViewModel} from '../../../models/OrganizationViewModel';
import {UserViewModel} from '../../../models/UserViewModel';

import {OrganizationTypes} from '../../../shared/organization-types';

import FadeoutUtils from '../../../shared/utilities/FadeoutUtils';
import {OtpDialogComponent} from "../../../dialogs/otp-dialog/otp-dialog.component";
import {AuthService} from "../../../services/api/auth.service";
import {RiseNumberInputComponent} from "../../../components/rise-number-input/rise-number-input.component";

@Component({
  selector: 'user-organization',
  standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TranslateModule,
        RiseButtonComponent,
        RiseCollaboratorsComponent,
        RiseDropdownComponent,
        RiseTextInputComponent,
        RiseNumberInputComponent,
    ],
  templateUrl: './user-organization.component.html',
  styleUrl: './user-organization.component.css',
})
export class UserOrganizationComponent implements OnInit {
  m_oOrganization: OrganizationViewModel = null;

  m_aoOrgTypes = OrganizationTypes;

  m_aoOrgUsers: Array<any> = [];

  m_bInviteUser: boolean = false;

  m_aoCountries: any[] = [];

  m_oOrgCountry: { name?:string,code?:string }={}

  constructor(
    private m_oDialog: MatDialog,
    private m_oNotificationDialogService: NotificationsDialogsService,
    private m_oOrganizationsService: OrganizationsService,
    private m_oTranslate: TranslateService,
    private m_oUserService: UserService,
    private m_oAuthService: AuthService
  ) {
  }

  ngOnInit(): void {
    this.m_aoCountries = [
      { name: 'United States', code: 'US' },
      { name: 'Canada', code: 'CA' },
      { name: 'United Kingdom', code: 'GB' },
      { name: 'Germany', code: 'DE' },
      { name: 'France', code: 'FR' },
      { name: 'Luxembourg', code: 'LU' },
      // ... more countries with their 'code'
    ];
    this.getOrganization();
    this.getOrgUsers();
  }

  /**
   * Fetch organization information from the server
   */
  getOrganization(): void {
    let sErrorMsg = this.m_oTranslate.instant('ORGANIZATION.ERROR_MSG');
    this.m_oOrganizationsService.getByUser().subscribe({
      next: (oResponse) => {
        if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {
          this.m_oOrganization = oResponse;
          this.fillOrgCountryObject(this.m_oOrganization);
        }
      },
      error: (oError) => {
        this.m_oNotificationDialogService.openInfoDialog(
          sErrorMsg,
          'danger',
          'Error'
        );
      },
    });
  }

  /**
   * Use Case: Admin can see the list of users of the Organization
   * Set the m_aoOrgUsers array after call
   */
  getOrgUsers(): void {
    let sErrorMsg = this.m_oTranslate.instant('ORGANIZATION.USERS_ERROR');
    this.m_oOrganizationsService.getOrganizationUsers().subscribe({
      next: (oResponse) => {
        this.m_aoOrgUsers = oResponse;
      },
      error: (oError) => {
        this.m_oNotificationDialogService.openInfoDialog(
          sErrorMsg,
          'danger',
          'Error'
        );
      },
    });
  }

  /**
   * Use Case: Admin can remove users from the Organization
   * Remove one User from the Organization via table
   */
  removeOrgUser(oUser: EditableUser): void {
    let sConfirmMsg = this.m_oTranslate.instant(
      'ORGANIZATION.CONFIRM_DELETE_USER'
    );
    sConfirmMsg += `<li>${oUser.userId}</li>`;
    let sErrorMsg = this.m_oTranslate.instant('ORGANIZATION.ERROR_DELETE_USER');
    let sSuccessMsg = this.m_oTranslate.instant(
      'ORGANIZATION.SUCCESS_DELETE_USER'
    );
    this.m_oNotificationDialogService
      .openConfirmationDialog(sConfirmMsg, 'alert')
      .subscribe((bDialogResult) => {
        if (bDialogResult) {
          delete oUser.isEditing;
          let aoUsersToDelete: UserViewModel[] = [];
          aoUsersToDelete.push(oUser);
          if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oUser.userId)) {
            this.m_oOrganizationsService
              .deleteUsersFromOrganization(aoUsersToDelete)
              .subscribe({
                next: (oResponse) => {
                  this.getOrgUsers();
                  this.m_oNotificationDialogService.openSnackBar(
                    sSuccessMsg,
                    'Success',
                    'success'
                  );
                },
                error: (oError) => {
                  this.m_oNotificationDialogService.openSnackBar(
                    sErrorMsg,
                    'Error',
                    'danger'
                  );
                },
              });
          }
        }
      });
  }


  setOrganizationCountry(event: any) {
    this.m_oOrgCountry=event.value;
    this.m_oOrganization.country = event.value.name;
    console.log('Selected Country:', this.m_oOrganization.country);
  }
  /**
   * Use Case: Admin can edit the basic information of the Organization inserted at the time of the registration (UC_010)
   * Open confirmation dialog and then save the user's changes (if yes)
   */
  saveChanges(): void {
    let sErrorMsg = this.m_oTranslate.instant('ORGANIZATION.CHANGES_ERROR');
    let sSuccessMsg = this.m_oTranslate.instant('ORGANIZATION.CHANGES_SAVED');

    if (this.isOrgValid()) {
      this.m_oOrganizationsService
        .updateOrganization(this.m_oOrganization)
        .subscribe({
          next: (oResponse) => {
            this.m_oNotificationDialogService.openSnackBar(
              sSuccessMsg,
              'Success',
              'success'
            );
          },
          error: (oError) => {
            this.m_oNotificationDialogService.openInfoDialog(
              sErrorMsg,
              'danger',
              'error'
            );
          },
        });
    }
  }

  /**
   * Check if the organization is valid
   * TODO: Add more validators
   * @returns boolean
   */
  isOrgValid(): boolean {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oOrganization)) {
      return false;
    }
    return true;
  }

  /**
   * Open dialog to invite new user to the organization
   * @param oEvent
   */
  openInviteUser(oEvent: any): void {
    this.m_oDialog
      .open(InviteUserComponent, {
        data: {
          organizationId: this.m_oOrganization.id,
        },
      })
      .afterClosed()
      .subscribe((oResult) => {
        this.getOrgUsers();
      });
  }

  /**
   * User Case: Admin can change the role (Admin, HQ Operator, Field Operator) of a user of the Organization
   * Change User Role via table
   */
  changeUserRole(oUser: EditableUser): void {
    let sSuccessMsg = this.m_oTranslate.instant(
      'COLLABORATORS.ROLE_CHANGE_SUCCESS'
    );
    let sErrorMsg = this.m_oTranslate.instant(
      'COLLABORATORS.ROLE_CHANGE_ERROR'
    );
    //Remove property special to 'Editable User' view model
    delete oUser.isEditing;
    if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oUser)) {
      this.m_oUserService.changeUserRole(oUser).subscribe({
        next: (oResponse) => {
          this.m_oNotificationDialogService.openSnackBar(
            sSuccessMsg,
            'Success',
            'success'
          );
        },
        error: (oError) => {
          this.m_oNotificationDialogService.openSnackBar(
            sErrorMsg,
            'Error',
            'danger'
          );
        },
      });
    }
  }

  /**
   * Use Case: Admin can delete the organization
   * Execute beginning of Delete Org Call and open Confirmation + OTP dialog
   */
  deleteOrganization(): void {
    //ask for confirmation
    this.m_oNotificationDialogService
      .openConfirmationDialog(
        'Are you sure you want to delete your Organization? This is a destructive action and cannot be undone and it will automatically delete your account and the organisation users accounts.',
        'danger'
      )
      .subscribe((bResult) => {
        if (bResult) {
          this.m_oOrganizationsService.deleteOrganization().subscribe({
            next: (oResponse) => {
              let oOTPVerifyVM = oResponse;
              this.m_oDialog
                .open(OtpDialogComponent, {
                  data: {
                    userId: oOTPVerifyVM.userId,
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
                        this.m_oOrganizationsService
                          .verifyDeleteOrganization(oOtpVm)
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

  setOrganizationType(sOrgType: any) {
    if(sOrgType){
      this.m_oOrganization.type=sOrgType.value
    }
  }

  private fillOrgCountryObject(oOrganizationVM: OrganizationViewModel) {
    let sCountryName = oOrganizationVM.country;

    this.m_oOrgCountry = this.m_aoCountries.find(
      (oCountry) => oCountry.name === sCountryName
    ) || null;
    console.log(this.m_oOrgCountry);
  }
}
