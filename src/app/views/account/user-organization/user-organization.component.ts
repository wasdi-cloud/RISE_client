import { Component, OnInit } from '@angular/core';
import { OrganizationViewModel } from '../../../models/OrganizationViewModel';
import { OrganizationsService } from '../../../services/api/organizations.service';
import { FormsModule } from '@angular/forms';
import { RiseTextInputComponent } from '../../../components/rise-text-input/rise-text-input.component';

@Component({
  selector: 'user-organization',
  standalone: true,
  imports: [FormsModule, RiseTextInputComponent],
  templateUrl: './user-organization.component.html',
  styleUrl: './user-organization.component.css',
})
export class UserOrganizationComponent implements OnInit {
  m_oOrganization: OrganizationViewModel = null;
  constructor(private m_oOrganizationsService: OrganizationsService) {}
  // Admin can edit the basic information of the Organization inserted at the time of the registration (UC_010)
  // Admin can see the list of users of the Organization
  // Admin can remove users from the Organization
  // Admin can change the role (Admin, HQ Operator, Field Operator) of a user of the Organization
  // Admin can delete the organization
  // RISE ask confirmation for  the deletion
  // Admin confirm to delete
  // RISE ask another confirmation using OTP (UC_005)
  // If the OTP is correct, WASDI deletes the Organization and all the related areas of operations.

  ngOnInit(): void {
    this.getOrganization();
  }

  getOrganization(): void {
    this.m_oOrganizationsService.getByUser().subscribe({
      next: (oResponse) => {
        if (oResponse) {
          this.m_oOrganization = oResponse;
        }
      },
      error: (oError) => {
        console.log(oError);
      },
    });
  }
}
