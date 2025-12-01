import {Component, OnDestroy} from '@angular/core';
import {RiseButtonComponent} from "../../components/rise-button/rise-button.component";
import {RiseToolbarComponent} from "../../components/rise-toolbar/rise-toolbar.component";
import {RiseTextInputComponent} from "../../components/rise-text-input/rise-text-input.component";
import {NgIf} from "@angular/common";
import {TranslateModule} from "@ngx-translate/core";
import {Router} from "@angular/router";
import {UserService} from "../../services/api/user.service";
import {NotificationsDialogsService} from "../../services/notifications-dialogs.service";
import {Subject, takeUntil} from "rxjs";

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
export class ForgetPasswordRequestComponent implements OnDestroy {
  m_sUserId: string;
  m_bValidUserId: boolean = true;
  m_sErrorInput: string = "Please Input your User Id";
  m_bRequestSent = false;
  private m_oDestroy$: Subject<void> = new Subject<void>();

  constructor(
    private m_oRouter: Router,
    private m_oUserService: UserService,
    private m_oNotificationService: NotificationsDialogsService,
  ) {

  }

  ngOnDestroy() {
    this.m_oDestroy$.next();
    this.m_oDestroy$.complete();
  }

  sendRequest() {
    if (this.m_sUserId) {
      this.m_oUserService.forgetPassword(this.m_sUserId).pipe(takeUntil(this.m_oDestroy$)).subscribe({
        next: (oResponse) => {
          this.m_bRequestSent = true;
        },
        error: (oError) => {
          if (oError.error.errorStringCodes) {
            this.handleAPIErrors(oError.error.errorStringCodes);
          }

        }
      })
    } else {
      this.m_bValidUserId = false;
    }

  }

  handleAPIErrors(asStringCodes): void {
    asStringCodes.forEach((sCode) => {
      if (sCode.includes('ERROR_API_USERID_NOT_FOUND')) {
        this.m_oNotificationService.openInfoDialog("This user does not exist", 'danger', "Error");
      } else {
        this.m_oNotificationService.openSnackBar(
          "Something went wrong",
          "Error",
          "danger"
        )
      }
    });

  }

  goBackToLogin() {
    this.m_oRouter.navigateByUrl('/')
  }
}
