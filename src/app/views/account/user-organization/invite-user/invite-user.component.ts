import { Component, OnInit } from '@angular/core';
import { RegisterViewModel } from '../../../../models/RegisterViewModel';
import { UserViewModel } from '../../../../models/UserViewModel';
import { OrganizationViewModel } from '../../../../models/OrganizationViewModel';
import { OrganizationsService } from '../../../../services/api/organizations.service';
import { UserRole } from '../../../../models/UserRole';
import { RiseTextInputComponent } from '../../../../components/rise-text-input/rise-text-input.component';
import { RiseButtonComponent } from '../../../../components/rise-button/rise-button.component';

@Component({
  selector: 'invite-user',
  standalone: true,
  imports: [RiseButtonComponent, RiseTextInputComponent],
  templateUrl: './invite-user.component.html',
  styleUrl: './invite-user.component.css',
})
export class InviteUserComponent implements OnInit {
  m_oOrgInfo: OrganizationViewModel = {} as OrganizationViewModel;
  m_oInviteInput: RegisterViewModel = {} as RegisterViewModel;
  m_oUserInfoInput: UserViewModel = {} as UserViewModel;

  m_asRoles = UserRole;

  constructor(private m_oOrganizationsService: OrganizationsService) {}

  ngOnInit() {
    console.log(this.m_asRoles);
  }
  // Admin clicks on “Invite Users to Organization”
  // Admin inserts the email of the User to invite
  // Admin confirms the email of the User to invite
  // Admin select a role for the user between:
  // Administrator
  // HQ Operator
  // Field Operator
  // RISE send an email to the invited user that will expire in 48 hours
  // User open the invitation email received
}
