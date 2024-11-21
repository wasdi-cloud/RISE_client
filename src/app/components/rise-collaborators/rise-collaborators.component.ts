import {CommonModule} from '@angular/common';
import {Component, EventEmitter, Input, OnInit, Output,} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {UserViewModel} from '../../models/UserViewModel';
import {TranslateModule} from '@ngx-translate/core';
import {RiseButtonComponent} from '../rise-button/rise-button.component';
import {MatTooltip} from '@angular/material/tooltip';
import {RiseDropdownComponent} from '../rise-dropdown/rise-dropdown.component';
import {UserRole} from '../../models/UserRole';

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
  ],
  templateUrl: './rise-collaborators.component.html',
  styleUrl: './rise-collaborators.component.css',
})
export class RiseCollaboratorsComponent implements OnInit {
  @Input() m_aoUsers: Array<EditableUser> = [];

  @Output() m_oInviteClick: EventEmitter<any> = new EventEmitter();

  @Output() m_oEditClick: EventEmitter<any> = new EventEmitter();

  @Output() m_oRemoveClick: EventEmitter<any> = new EventEmitter();

  m_aoRoles = UserRole;

  m_asRoles: Array<string> = [];

  ngOnInit(): void {
    this.initRoles();
  }

  toggleUserEditing(oUser: EditableUser) {
    oUser.isEditing = !oUser.isEditing;
  }

  emitInviteClick() {
    this.m_oInviteClick.emit(true);
  }

  emitEditClick(oUser: EditableUser) {
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
}
