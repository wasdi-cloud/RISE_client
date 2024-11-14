import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UserViewModel } from '../../models/UserViewModel';
import { TranslateModule } from '@ngx-translate/core';
import { RiseCollaboratorsComponent } from '../rise-collaborators/rise-collaborators.component';

@Component({
  selector: 'rise-collaborators-dialog',
  standalone: true,
  imports: [TranslateModule, RiseCollaboratorsComponent],
  templateUrl: './rise-collaborators-dialog.component.html',
  styleUrl: './rise-collaborators-dialog.component.css',
})
export class RiseCollaboratorsDialogComponent implements OnInit {
  m_aoUsers: Array<UserViewModel> = [];
  constructor(
    @Inject(MAT_DIALOG_DATA) public m_oData: any,
    private m_oDialogRef: MatDialogRef<RiseCollaboratorsDialogComponent>
  ) {}

  ngOnInit(): void {
    if (this.m_oData) {
      this.m_aoUsers = this.m_oData.users;
    }
  }

  onDismiss() {
    this.m_oDialogRef.close();
  }
}
