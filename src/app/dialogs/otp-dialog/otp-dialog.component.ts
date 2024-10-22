import { Component } from '@angular/core';
import { RiseButtonComponent } from '../../components/rise-button/rise-button.component';
import { MatDialogRef } from '@angular/material/dialog';
import { RiseTextInputComponent } from '../../components/rise-text-input/rise-text-input.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-otp-dialog',
  standalone: true,
  imports: [RiseButtonComponent, RiseTextInputComponent, TranslateModule],
  templateUrl: './otp-dialog.component.html',
  styleUrl: './otp-dialog.component.css',
})
export class OtpDialogComponent {
  m_sOneTimePW: string = '';

  constructor(private m_oDialogRef: MatDialogRef<OtpDialogComponent>) {}

  submitOTP() {
    this.m_oDialogRef.close(this.m_sOneTimePW);
  }

  onDismiss() {
    this.m_oDialogRef.close();
  }
}
