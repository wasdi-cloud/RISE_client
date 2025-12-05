import {Component, OnDestroy, OnInit} from '@angular/core';
import {RiseButtonComponent} from "../../components/rise-button/rise-button.component";
import {RiseTextInputComponent} from "../../components/rise-text-input/rise-text-input.component";
import {RiseToolbarComponent} from "../../components/rise-toolbar/rise-toolbar.component";
import {ActivatedRoute, Router} from "@angular/router";
import {UserService} from "../../services/api/user.service";
import {NotificationsDialogsService} from "../../services/notifications-dialogs.service";
import {ChangeExpiredPasswordRequestViewModel} from "../../models/ChangeExpiredPasswordRequestViewModel";
import {Subject, takeUntil} from "rxjs";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-password-expired',
  standalone: true,
  imports: [
    RiseButtonComponent,
    RiseTextInputComponent,
    RiseToolbarComponent
  ],
  templateUrl: './password-expired.component.html',
  styleUrl: './password-expired.component.css'
})
export class PasswordExpiredComponent implements OnInit, OnDestroy {

  m_sConfirmationCode: string;
  m_sUserId: string;
  m_oPasswordInputs = {
    password: '',
    confirmPw: '',
  };
  m_sPasswordError: string = '';
  private m_oDestroy$: Subject<void> = new Subject<void>();

  constructor(
    private m_oActiveRoute: ActivatedRoute,
    private m_oTranslate: TranslateService,
    private m_oUserService: UserService,
    private m_oNotificationService: NotificationsDialogsService,
    private m_oRouter: Router,
  ) {
  }

  ngOnInit() {
    this.m_sUserId = this.m_oActiveRoute.snapshot.paramMap.get("userId")
  }

  ngOnDestroy() {
    this.m_oDestroy$.next();
    this.m_oDestroy$.complete();
  }

  confirmRequest() {
    if ( this.validatePassword()) {

      let oRequestVM: ChangeExpiredPasswordRequestViewModel = {
        password: this.m_oPasswordInputs.password,
        userId: this.m_sUserId
      }
      
      this.m_oUserService.changeExpiredPassword(oRequestVM).pipe(takeUntil(this.m_oDestroy$)).subscribe({
        next: (oResponse) => {
          this.m_oNotificationService.openSnackBar(
            "Password updated successfully",
            "Update",
            "success"
          );
          this.m_oRouter.navigateByUrl('/login')
        },
        error: (oError) => {
          this.m_oNotificationService.openSnackBar(
            "Something went wrong",
            "Error",
            "danger"
          );
        }
      })
    }
  }

  validatePassword(): boolean {
    let sPasswordErrorRegex = this.m_oTranslate.instant("REGISTER.PASSWORD_ERROR_MESSAGE_CONDITIONS");
    let sPasswordErrorMissmatch = this.m_oTranslate.instant("REGISTER.PASSWORD_ERROR_MESSAGE_MISSMATCH");
    let sPassword = this.m_oPasswordInputs.password;
    let sConfirmPw = this.m_oPasswordInputs.confirmPw;
    // Minimum 8 Characters, at least one letter, one number, and one special character:
    const sPasswordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*#?&,.]).{8,}$/;
    // If the user has modified both inputs
    if (sPassword && sConfirmPw) {
      //If the first password doesn't pass regex OR the pw's don't match
      if (!sPasswordRegex.test(sPassword)) {
        this.m_sPasswordError = sPasswordErrorRegex
        return false;
      } else if (sPassword !== sConfirmPw) {
        this.m_sPasswordError = sPasswordErrorMissmatch;
        return false;
      } else {
        return true;
      }
      // IF there are no inputs, do not show validation msg
    } else {
      return true;
    }
  }


  enableSubmit() {
    if (!this.m_oPasswordInputs.password) {
      return false;
    }
    if (!this.m_oPasswordInputs.confirmPw) {
      return false;
    }
    if (!this.validatePassword()) {
      return false;
    }
    return true;
  }
}
