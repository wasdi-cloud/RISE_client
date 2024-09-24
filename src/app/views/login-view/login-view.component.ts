import { Component, OnInit } from '@angular/core';
import { RiseTextInputComponent } from '../../components/rise-text-input/rise-text-input.component';
import { AuthService } from '../../services/api/auth.service';
import { RiseButtonComponent } from '../../components/rise-button/rise-button.component';
import { UserCredentials } from '../../shared/models/user-credentials';
import { OtpDialogComponent } from '../../dialogs/otp-dialog/otp-dialog.component';
import { MatDialog } from '@angular/material/dialog';


@Component({
  selector: 'app-login-view',
  standalone: true,
  imports: [RiseButtonComponent, RiseTextInputComponent, OtpDialogComponent,],
  templateUrl: './login-view.component.html',
  styleUrl: './login-view.component.css'
})
export class LoginViewComponent {
  public m_oUserInput: UserCredentials = {
    userId: "",
    password: ""
  };

  constructor(private m_oAuthService: AuthService, private m_oDialog: MatDialog) { }

  executeLogin() {
    // this.m_oAuthService.loginUser(this.m_oUserInput); -> Returns OTP View Model

    let oOtpViewModel;
    this.m_oDialog.open(OtpDialogComponent, {
      data: oOtpViewModel
    });
  }
}
