import { Component, OnInit } from '@angular/core';
import { RiseTextInputComponent } from '../../components/rise-text-input/rise-text-input.component';
import { AuthService } from '../../services/api/auth.service';
import { RiseButtonComponent } from '../../components/rise-button/rise-button.component';
import { UserCredentials } from '../../shared/models/user-credentials';
import { OtpDialogComponent } from '../../dialogs/otp-dialog/otp-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-view',
  standalone: true,
  imports: [RiseButtonComponent, RiseTextInputComponent, OtpDialogComponent],
  templateUrl: './login-view.component.html',
  styleUrl: './login-view.component.css',
})
export class LoginViewComponent {
  public m_oUserInput: UserCredentials = {
    userId: '',
    password: '',
  };

  private m_oOTPVerifyVM: any = {};

  constructor(
    private m_oAuthService: AuthService,
    private m_oDialog: MatDialog,
    private m_oRouter: Router
  ) {}

  executeLogin() {
    // this.m_oAuthService.loginUser(this.m_oUserInput); -> Returns OTP View Model
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
        console.log(oError);
      },
    });
  }

  verifyOtp(sOTP) {
    if (sOTP) {
      this.m_oOTPVerifyVM.userProvidedCode = sOTP;
      console.log(this.m_oOTPVerifyVM);
      this.m_oAuthService.verifyOTP(this.m_oOTPVerifyVM).subscribe({
        next: (oResponse) => {
          if (oResponse.status === 200) {
            this.verifyLogin()
          }
        },
        error: (oError) => {
          console.log(oError);
        },
      });
    }
  }

  verifyLogin() {
    let oOtpVerify = {
      id: this.m_oOTPVerifyVM.id,
      userId: this.m_oOTPVerifyVM.userId
    }

    this.m_oAuthService.loginVerify(oOtpVerify).subscribe({
      next: oResponse => {
        if(oResponse.token) {
          //Set user Token and login
          this.m_oAuthService.saveToken(oResponse.token);
          this.m_oRouter.navigateByUrl('/dashboard');
        }
      },
      error: oError => {
        console.log(oError)
      }
    })
  }
}
