import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserViewModel } from '../../models/UserViewModel';
import { TranslateModule } from '@ngx-translate/core';
import { RiseButtonComponent } from '../rise-button/rise-button.component';
import { MatTooltip } from '@angular/material/tooltip';
import { RiseDropdownComponent } from '../rise-dropdown/rise-dropdown.component';
import { UserRole } from '../../models/UserRole';
import { RiseTextInputComponent } from '../rise-text-input/rise-text-input.component';
import { AreaService } from '../../services/api/area.service';
import { NotificationsDialogsService } from '../../services/notifications-dialogs.service';

export class EditableUser extends UserViewModel {
  isEditing: boolean;
}

@Component({
  selector: 'rise-collaborators',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    MatTooltip,
    RiseButtonComponent,
    RiseDropdownComponent,
    RiseTextInputComponent,
  ],
  templateUrl: './rise-collaborators.component.html',
  styleUrl: './rise-collaborators.component.css',
})
export class RiseCollaboratorsComponent implements OnInit {
  @Input() m_aoUsers: Array<any> = [];

  @Input() m_sResourceType: string = '';

  @Input() m_sResourceId: string = '';

  @Output() m_oInviteClick: EventEmitter<any> = new EventEmitter();

  @Output() m_oEditClick: EventEmitter<any> = new EventEmitter();

  @Output() m_oRemoveClick: EventEmitter<any> = new EventEmitter();

  m_bShowTable: boolean = false;

  m_bAddingUser: boolean = false;

  m_aoRoles = UserRole;

  m_asRoles: Array<string> = [];

  constructor(
    private m_oAreaService: AreaService,
    private m_oNotificationsService: NotificationsDialogsService
  ) {}

  ngOnInit(): void {
    this.initRoles();
  }

  toggleUserEditing(oUser: any) {
    oUser.isEditing = !oUser.isEditing;
  }

  emitInviteClick() {
    if (this.m_sResourceType === 'organization') {
      this.m_oInviteClick.emit(true);
    } else {
      this.m_bShowTable = !this.m_bShowTable;
      this.m_bAddingUser = !this.m_bAddingUser;
    }
  }

  emitEditClick(oUser: any) {
    this.m_oEditClick.emit(oUser);
    oUser.isEditing = false;
  }

  emitRemoveClick(oUser) {
    this.m_oRemoveClick.emit(oUser);
  }

  handleSelection(oEvent, oUser) {
    oUser.role = oEvent.value;
  }

  initRoles() {
    this.m_asRoles = Object.keys(this.m_aoRoles);
    //Remove the RISE_ADMIN role from selection
    this.m_asRoles.shift();
  }

  refreshUsers() {
    if (this.m_sResourceType === 'area') {
      this.m_oAreaService.getUsersFromArea(this.m_sResourceId).subscribe({
        next: (oResponse) => {
          this.m_aoUsers = oResponse;
        },
        error: (oError) => {
          this.m_oNotificationsService.openInfoDialog(
            'Could not refresh users list. Please try again',
            'danger',
            'Error'
          );
        },
      });
    }
  }
}
