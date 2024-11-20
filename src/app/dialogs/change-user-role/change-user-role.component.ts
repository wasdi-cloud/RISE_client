import {Component, Inject, Input, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {UserRole, UserRoleHelper} from "../../models/UserRole";
import {RiseButtonComponent} from "../../components/rise-button/rise-button.component";
import {RiseDropdownComponent} from "../../components/rise-dropdown/rise-dropdown.component";
import {RiseTextInputComponent} from "../../components/rise-text-input/rise-text-input.component";
import {TranslateModule} from "@ngx-translate/core";
import {UserViewModel} from "../../models/UserViewModel";
import {UserService} from "../../services/api/user.service";
import FadeoutUtils from "../../shared/utilities/FadeoutUtils";

@Component({
  selector: 'app-change-user-role',
  standalone: true,
  imports: [
    RiseButtonComponent,
    RiseDropdownComponent,
    RiseTextInputComponent,
    TranslateModule
  ],
  templateUrl: './change-user-role.component.html',
  styleUrl: './change-user-role.component.css'
})
export class ChangeUserRoleComponent implements OnInit {

  @Input() m_oUser: UserViewModel;
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

  constructor(
    private m_oDialogRef: MatDialogRef<ChangeUserRoleComponent>,
    private m_oUserService: UserService,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) {
  }

  ngOnInit() {
    this.m_oUser = this.data.m_oUser
    this.initRoles();
  }

  /**
   * Convert the user roles to an array
   */
  initRoles(): void {
    this.m_asRoles = Object.keys(this.m_oUserRoles);
    //Remove the RISE_ADMIN role from selection
    this.m_asRoles.shift();
  }

  onDismiss() {
    this.m_oDialogRef.close();
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

  changeUserRole() {
    if (!FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oUser)) {
      this.m_oUser.role = UserRoleHelper.getRoleFromName(this.m_sUserRole);
      this.m_oUserService.changeUserRole(this.m_oUser).subscribe({
        next: (oResponse) => {
          this.onDismiss();
        }, error: (oError) => {
          console.error(oError)
        }
      })
    }

  }
}
