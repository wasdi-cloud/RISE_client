import {Component, Inject, Input, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';

import {OrganizationsService} from '../../../../services/api/organizations.service';

import {RiseButtonComponent} from '../../../../components/rise-button/rise-button.component';
import {RiseDropdownComponent} from '../../../../components/rise-dropdown/rise-dropdown.component';
import {RiseTextInputComponent} from '../../../../components/rise-text-input/rise-text-input.component';

import {InviteViewModel} from '../../../../models/InviteViewModel';
import {UserRole} from '../../../../models/UserRole';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {NotificationsDialogsService} from "../../../../services/notifications-dialogs.service";

@Component({
  selector: 'invite-user',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    RiseButtonComponent,
    RiseDropdownComponent,
    RiseTextInputComponent,
  ],
  templateUrl: './invite-user.component.html',
  styleUrl: './invite-user.component.css',
})
export class InviteUserComponent implements OnInit {
  /**
   * Organization Id (Received from User Organization Component)
   */
  @Input() m_sOrganizationId: string = '';

  @Input() m_sOrganizationName: string = '';

  /**
   * Email Inputs - evaluated by email validator
   */
  m_oEmailInputs = {
    email: '',
    confirmEmail: '',
  };

  /**
   * Selected Role from dropdown
   */
  m_sUserRole: string = '';

  /**
   * Possible User Roles import
   */
  m_oUserRoles = UserRole;

  /**
   * Possible user roles as array for the dropdown
   */
  m_asRoles = [];

  /**
   * Flag to know when to show the outcome of the invitation
   */
  m_bShowStatus = false;

  /**
   * Was the invitation successful?
   */
  m_bSuccess = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) private m_oData: any,
    private m_oDialogRef: MatDialogRef<InviteUserComponent>,
    private m_oOrganizationsService: OrganizationsService,
    private m_oNotificationsDialogsService: NotificationsDialogsService,
    private m_oTranslateService:TranslateService
  ) {
  }

  ngOnInit() {

    this.initRoles();
    this.m_sOrganizationId = this.m_oData.organizationId;
  }

  /**
   * Convert the user roles to an array
   */
  initRoles(): void {
    this.m_asRoles = Object.keys(this.m_oUserRoles);
    //Remove the RISE_ADMIN role from selection
    this.m_asRoles.shift();
  }

  /**
   * Handle the user selection in the Role Dropdown
   * @param oEvent
   */
  handleRoleSelect(oEvent: any): void {
    if (oEvent.value) {
      this.m_sUserRole = oEvent.value;
    }
  }

  /**
   * Handle validation (ensure emails are emails and values are the same)
   * @returns boolean
   */
  validateEmail(): boolean {
    let sEmail = this.m_oEmailInputs.email;
    let sConfirmEmail = this.m_oEmailInputs.confirmEmail;
    // Standard email regex:
    const sEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // if the user has modified both inputs
    if (sEmail && sConfirmEmail) {
      // if the first email doesn't pass Regex OR the emails don't match
      if (!sEmailRegex.test(sEmail) || sEmail !== sConfirmEmail) {
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
   * Execute the invite action, set the user message, show option to invite another or return
   */
  executeInvite() {
    const sNotificationMsg = this.m_oTranslateService.instant('ORGANIZATION.INVITE_SUCCESS');
    let bValidEmail = this.validateEmail();

    if (!bValidEmail || !this.m_sUserRole) {
      console.log('Email is invalid or user role is not defined');
    } else {
      let oInvite: InviteViewModel = {
        email: this.m_oEmailInputs.email,
        role: this.m_sUserRole,
        organizationId: this.m_sOrganizationId,
      };
      this.m_oOrganizationsService.inviteUser(oInvite).subscribe({
        next: (oResponse) => {
          if (oResponse.status === 200) {
            this.m_bShowStatus = true;
            this.m_bSuccess = true;
            this.m_oNotificationsDialogsService.openSnackBar(
              sNotificationMsg,
              "Success",
              "success"
            )
          }
          this.onDismiss();
        },
        error: (oError) => {
          this.m_bShowStatus = true;
          this.m_bSuccess = false;
          this.onDismiss();
          let asErrorCodes = Array.isArray(oError?.error?.errorStringCodes)
            ? oError.error.errorStringCodes.map(
              (sCode: string) =>
                `<li>${this.m_oTranslateService.instant('ERROR_MSG.' + sCode)}</li>`
            )
            : [];
          let sErrorMsg = `'There were some issues with your inputted information. Please review your entries'<ul>
        ${asErrorCodes.toString().replaceAll(',', '')}
        </ul>`;
          this.m_oNotificationsDialogsService.openSnackBar(
            sErrorMsg,
            "Error",
            "danger"
          )
        },
      });
    }
  }

  /**
   * Reset the inputs so the user can add new users
   */
  resetInputs(): void {
    this.m_oEmailInputs = {
      email: '',
      confirmEmail: '',
    };
    this.m_sUserRole = '';
    this.m_bShowStatus = false;
    this.m_bSuccess = false;
  }

  onDismiss() {
    this.m_oDialogRef.close();
  }

  openInfoDialog() {
    const sMsg = this.m_oTranslateService.instant('COLLABORATORS.ROLE_INFO');
    this.m_oNotificationsDialogsService.openInfoDialog(sMsg, 'alert', '');
  }
}
