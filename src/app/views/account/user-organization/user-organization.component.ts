import { Component, OnInit } from '@angular/core';
import { OrganizationViewModel } from '../../../models/OrganizationViewModel';
import { OrganizationsService } from '../../../services/api/organizations.service';
import { FormsModule } from '@angular/forms';
import { RiseTextInputComponent } from '../../../components/rise-text-input/rise-text-input.component';
import { RiseCrudTableComponent } from '../../../components/rise-crud-table/rise-crud-table.component';
import { RiseButtonComponent } from '../../../components/rise-button/rise-button.component';
import { CommonModule } from '@angular/common';
import { InviteUserComponent } from './invite-user/invite-user.component';
import { OrganizationTypes } from '../../../shared/organization-types';
import { RiseDropdownComponent } from '../../../components/rise-dropdown/rise-dropdown.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'user-organization',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    InviteUserComponent,
    RiseButtonComponent,
    RiseCrudTableComponent,
    RiseDropdownComponent,
    RiseTextInputComponent,
  ],
  templateUrl: './user-organization.component.html',
  styleUrl: './user-organization.component.css',
})
export class UserOrganizationComponent implements OnInit {
  m_oOrganization: OrganizationViewModel = null;

  m_aoOrgTypes = OrganizationTypes;

  m_aoOrgUsers: Array<any> = [];

  m_bInviteUser: boolean = false;
  constructor(private m_oOrganizationsService: OrganizationsService) {}

  ngOnInit(): void {
    this.getOrganization();
  }

  getOrganization(): void {
    this.m_oOrganizationsService.getByUser().subscribe({
      next: (oResponse) => {
        if (oResponse) {
          this.m_oOrganization = oResponse;
          this.getOrgVM(this.m_oOrganization.id);
          console.log(this.m_oOrganization);
        }
      },
      error: (oError) => {
        console.log(oError);
      },
    });
  }

  getOrgVM(sOrgId: string): void {
    this.m_oOrganizationsService.getOrg(sOrgId).subscribe({
      next: (oResponse) => {},
      error: (oError) => {},
    });
  }

  /**
   * Use Case: Admin can see the list of users of the Organization
   * Set the m_aoOrgUsers array after call
   */
  getOrgUsers() {}

  /**
   * Use Case: Admin can remove users from the Organization
   * Remove one User from the Organization via table
   */
  removeOrgUser() {}

  /**
   * User Case: Admin can change the role (Admin, HQ Operator, Field Operator) of a user of the Organization
   * Change User Role via table
   */
  changeUserRole() {}

  /**
   * Use Case: Admin can edit the basic information of the Organization inserted at the time of the registration (UC_010)
   * Open confirmation dialog and then save the user's changes (if yes)
   */
  saveChanges() {}

  /**
   * Use Case: Admin can delete the organization
   * Execute beginning of Delete Org Call and open Confirmation + OTP dialog
   */
  deleteOrganization() {}

  openInviteUser(bStatus: boolean) {
    this.m_bInviteUser = bStatus;
  }
}
