import {Component} from '@angular/core';
import {RiseButtonComponent} from "../../components/rise-button/rise-button.component";
import {RiseToolbarComponent} from "../../components/rise-toolbar/rise-toolbar.component";
import {RiseTextInputComponent} from "../../components/rise-text-input/rise-text-input.component";
import {NgIf} from "@angular/common";
import {TranslateModule} from "@ngx-translate/core";
import {Router} from "@angular/router";
import {UserService} from "../../services/api/user.service";
import {NotificationsDialogsService} from "../../services/notifications-dialogs.service";

@Component({
  selector: 'app-forget-password-request',
  standalone: true,
  imports: [
    RiseButtonComponent,
    RiseToolbarComponent,
    RiseTextInputComponent,
    NgIf,
    TranslateModule
  ],
  templateUrl: './forget-password-request.component.html',
  styleUrl: './forget-password-request.component.css'
})
export class ForgetPasswordRequestComponent {
  m_sUserId: string;
  m_bValidUserId: boolean = true;
  m_sErrorInput: string = "Please Input your User Id";
  m_bRequestSent = false;

  constructor(
    private m_oRouter: Router,
    private m_oUserService: UserService,
    private m_oNotificationService: NotificationsDialogsService,
  ) {

  }

  sendRequest() {
    if (this.m_sUserId) {
      this.m_oUserService.forgetPassword(this.m_sUserId).subscribe({
        next: (oResponse) => {
          this.m_bRequestSent = true;
        },
        error: (oError) => {
          this.m_oNotificationService.openSnackBar(
            "Something went wrong",
            "Error",
            "danger"
          )
        }
      })
    } else {
      this.m_bValidUserId = false;
    }

  }

  goBackToLogin() {
    this.m_oRouter.navigateByUrl('/')
  }
}
