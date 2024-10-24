import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RiseButtonComponent } from '../../components/rise-button/rise-button.component';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule, RiseButtonComponent],
  templateUrl: './confirmation-dialog.component.html',
  styleUrl: './confirmation-dialog.component.css',
})
export class ConfirmationDialogComponent implements OnInit {
  m_sClassName: string = '';
  m_sMessage: string = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public m_oData:any,
    private m_oDialogRef: MatDialogRef<ConfirmationDialogComponent>
  ) {}

  ngOnInit(): void {
    this.m_sMessage = this.m_oData.message;
    this.m_sClassName = this.m_oData.className;
  }

  onConfirm() {
    this.m_oDialogRef.close(true);
  }

  onDismiss() {
    this.m_oDialogRef.close();
  }
}
