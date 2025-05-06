import { Component, Inject, OnInit } from '@angular/core';
import { RiseButtonComponent } from '../../components/rise-button/rise-button.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RiseTextInputComponent } from '../../components/rise-text-input/rise-text-input.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-otp-dialog',
  standalone: true,
  imports: [RiseButtonComponent, RiseTextInputComponent, TranslateModule],
  templateUrl: './otp-dialog.component.html',
  styleUrl: './otp-dialog.component.css',
})
export class OtpDialogComponent implements OnInit {
  m_sOneTimePW: string = '';

  m_sUserId: string = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) private m_oData: any,
    private m_oDialogRef: MatDialogRef<OtpDialogComponent>
  ) {}

  ngOnInit(): void {
    this.m_sUserId = this.m_oData.userId;
  }

  submitOTP() {
    if (this.m_sOneTimePW != null) this.m_sOneTimePW = this.m_sOneTimePW.trim();
    this.m_oDialogRef.close(this.m_sOneTimePW);
  }

  onDismiss() {
    this.m_oDialogRef.close();
  }
}
