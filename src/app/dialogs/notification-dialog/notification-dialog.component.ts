import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';

@Component({
  selector: 'app-notification-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-dialog.component.html',
  styleUrl: './notification-dialog.component.css',
})
export class NotificationDialogComponent implements OnInit {
  m_sMessage: string = '';
  m_sClassName: string = '';
  m_sTitle: string = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public m_oData,
    private m_oDialogRef: MatDialogRef<NotificationDialogComponent>
  ) {}

  ngOnInit(): void {
    this.m_sClassName = this.m_oData.className;
    this.m_sMessage = this.m_oData.message;
    this.m_sTitle = this.m_oData.title;
    if (this.m_sTitle === undefined) {
      this.m_sTitle = 'Information';
    }
    else if (this.m_sTitle === null) {
      this.m_sTitle = 'Information';
    }
  }

  onDismiss() {
    this.m_oDialogRef.close();
  }
}
