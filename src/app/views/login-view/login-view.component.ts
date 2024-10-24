import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { AuthService } from '../../services/api/auth.service';

import { OtpDialogComponent } from '../../dialogs/otp-dialog/otp-dialog.component';
import { RiseButtonComponent } from '../../components/rise-button/rise-button.component';
import { RiseTextInputComponent } from '../../components/rise-text-input/rise-text-input.component';

import { UserCredentialsViewModel } from '../../models/UserCredentialsViewModel';
import { RiseToolbarComponent } from '../../components/rise-toolbar/rise-toolbar.component';
import { NotificationsDialogsService } from '../../services/notifications-dialogs.service';
import { TranslateService } from '@ngx-translate/core';
import { RiseUtils } from '../../shared/RiseUtils';

@Component({
  selector: 'app-login-view',
  standalone: true,
  imports: [
    RiseToolbarComponent,
    RiseButtonComponent,
    RiseTextInputComponent,
    OtpDialogComponent,
  ],
  templateUrl: './login-view.component.html',
  styleUrl: './login-view.component.css',
})
export class LoginViewComponent {
  public m_oUserInput: UserCredentialsViewModel = {
    userId: '',
    password: '',
  };

  private m_oOTPVerifyVM: any = {};

  constructor(
    private m_oAuthService: AuthService,
    private m_oDialog: MatDialog,
    private m_oRouter: Router,
    private m_oRiseUtils: RiseUtils
  ) {}

  executeLogin() {
    this.m_oAuthService.loginUser(this.m_oUserInput).subscribe({
      next: (oResponse) => {
        if (oResponse) {
          this.m_oOTPVerifyVM = oResponse;
          let oDialogRef = this.m_oDialog.open(OtpDialogComponent);
          oDialogRef.afterClosed().subscribe((sResult) => {
            this.verifyOtp(sResult);
          });
        }
      },
      error: (oError) => {
        this.m_oRiseUtils.handleError(oError);
      },
    });
  }

  verifyOtp(sOTP) {
    if (sOTP) {
      this.m_oOTPVerifyVM.userProvidedCode = sOTP;
      this.m_oAuthService.verifyOTP(this.m_oOTPVerifyVM).subscribe({
        next: (oResponse) => {
          if (oResponse.status === 200) {
            this.verifyLogin();
          }
        },
        error: (oError) => {
          this.m_oRiseUtils.handleError(oError);
        },
      });
    }
  }

  verifyLogin() {
    let oOtpVerify = {
      id: this.m_oOTPVerifyVM.id,
      userId: this.m_oOTPVerifyVM.userId,
    };

    this.m_oAuthService.loginVerify(oOtpVerify).subscribe({
      next: (oResponse) => {
        if (oResponse.token) {
          //Set user Token and login
          this.m_oAuthService.saveToken(oResponse.token);
          this.m_oRouter.navigateByUrl('/dashboard');
        }
      },
      error: (oError) => {
        console.log(oError);
      },
    });
  }
}
