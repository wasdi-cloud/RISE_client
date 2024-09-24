import { Component, Output } from '@angular/core';
import { RiseButtonComponent } from '../../components/rise-button/rise-button.component';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-otp-dialog',
  standalone: true,
  imports: [RiseButtonComponent],
  templateUrl: './otp-dialog.component.html',
  styleUrl: './otp-dialog.component.css'
})
export class OtpDialogComponent {
  constructor(private m_oDialogRef: MatDialogRef<OtpDialogComponent>) { }

  submitOTP() {
    this.m_oDialogRef.close(true);
  }
}
