import {Component, OnInit} from '@angular/core';
import {OrganizationViewModel} from '../../../models/OrganizationViewModel';
import {OrganizationsService} from '../../../services/api/organizations.service';
import {FormsModule} from '@angular/forms';
import {RiseTextInputComponent} from '../../../components/rise-text-input/rise-text-input.component';
import {RiseButtonComponent} from '../../../components/rise-button/rise-button.component';
import {CommonModule} from '@angular/common';
import {InviteUserComponent} from './invite-user/invite-user.component';
import {OrganizationTypes} from '../../../shared/organization-types';
import {RiseDropdownComponent} from '../../../components/rise-dropdown/rise-dropdown.component';
import {TranslateModule} from '@ngx-translate/core';
import FadeoutUtils from '../../../shared/utilities/FadeoutUtils';
import {RiseCollaboratorsComponent} from '../../../components/rise-collaborators/rise-collaborators.component';
import {MatDialog} from '@angular/material/dialog';
import {RiseCrudTableComponent} from "../../../components/rise-crud-table/rise-crud-table.component";
import {MatTooltip} from "@angular/material/tooltip";

@Component({
  selector: 'user-organization',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    InviteUserComponent,
    RiseButtonComponent,
    RiseCollaboratorsComponent,
    RiseDropdownComponent,
    RiseTextInputComponent,
    RiseCrudTableComponent,
    MatTooltip,
  ],
  templateUrl: './user-organization.component.html',
  styleUrl: './user-organization.component.css',
})
export class UserOrganizationComponent implements OnInit {
  m_oOrganization: OrganizationViewModel = null;

  m_aoOrgTypes = OrganizationTypes;

  m_aoOrgUsers: Array<any> = [];

  m_bInviteUser: boolean = false;

  constructor(
    private m_oDialog: MatDialog,
    private m_oOrganizationsService: OrganizationsService
  ) {
  }

  ngOnInit(): void {
    this.getOrganization();
    this.getOrgUsers();
  }

  getOrganization(): void {
    this.m_oOrganizationsService.getByUser().subscribe({
      next: (oResponse) => {
        if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {
          this.m_oOrganization = oResponse;
          this.getOrgVM(this.m_oOrganization.id);
        }
      },
      error: (oError) => {
        console.log(oError);
      },
    });
  }

  getOrgVM(sOrgId: string): void {
    this.m_oOrganizationsService.getOrg(sOrgId).subscribe({
      next: (oResponse) => {
        console.log(oResponse);
      },
      error: (oError) => {
      },
    });
  }

  /**
   * Use Case: Admin can see the list of users of the Organization
   * Set the m_aoOrgUsers array after call
   */
  getOrgUsers() {
    this.m_oOrganizationsService.getOrganizationUsers().subscribe({
      next: (oResponse) => {
        console.log("user of this org are" + oResponse);
        this.m_aoOrgUsers = oResponse;
      }, error: (oError) => {
        //todo handle it
      }
    })
  }

  /**
   * Use Case: Admin can remove users from the Organization
   * Remove one User from the Organization via table
   */
  removeOrgUser() {
  }

  /**
   * User Case: Admin can change the role (Admin, HQ Operator, Field Operator) of a user of the Organization
   * Change User Role via table
   */
  changeUserRole() {
  }

  /**
   * Use Case: Admin can edit the basic information of the Organization inserted at the time of the registration (UC_010)
   * Open confirmation dialog and then save the user's changes (if yes)
   */
  saveChanges() {
    if(this.isOrgValid()){
      this.m_oOrganizationsService.updateOrganization(this.m_oOrganization).subscribe({
        next: (oResponse) => {
          console.log(oResponse)
        }, error: (oError) => {
          console.error(oError)
        }
      })
    }else{
      //add validation
    }

  }

   isOrgValid() {
    if(FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oOrganization)){
      return false;
    }
    return  true;

  }

  /**
   * Use Case: Admin can delete the organization
   * Execute beginning of Delete Org Call and open Confirmation + OTP dialog
   */
  deleteOrganization() {
  }

  openInviteUser(oEvent: any) {
    console.log(oEvent);
    this.m_oDialog
      .open(InviteUserComponent, {})
      .afterClosed()
      .subscribe((oResult) => {
        this.getOrgUsers();
      });
    // this.m_bInviteUser = bStatus;
  }

  deleteUserFromOrg(oUser: any) {
    
  }
}
