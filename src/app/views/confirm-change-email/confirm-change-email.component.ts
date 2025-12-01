import {Component, OnDestroy, OnInit} from '@angular/core';
import {RiseButtonComponent} from "../../components/rise-button/rise-button.component";
import {RiseToolbarComponent} from "../../components/rise-toolbar/rise-toolbar.component";
import {ActivatedRoute, Router} from "@angular/router";
import {NotificationsDialogsService} from "../../services/notifications-dialogs.service";
import FadeoutUtils from "../../shared/utilities/FadeoutUtils";
import {UserService} from "../../services/api/user.service";
import {ConstantsService} from "../../services/constants.service";
import {ConfirmEmailChangeViewModel} from "../../models/ConfirmEmailChangeViewModel";
import {Subject, takeUntil} from "rxjs";

@Component({
  selector: 'app-confirm-change-email',
  standalone: true,
  imports: [
    RiseButtonComponent,
    RiseToolbarComponent
  ],
  templateUrl: './confirm-change-email.component.html',
  styleUrl: './confirm-change-email.component.css'
})
export class ConfirmChangeEmailComponent implements OnInit, OnDestroy {

  m_sConfirmationCode: string;
  m_sNewEmail: string;
  private m_oDestroy$: Subject<void> = new Subject<void>();

  constructor(
    private m_oActiveRoute: ActivatedRoute,
    private m_oConstantService: ConstantsService,
    private m_oUserService: UserService,
    private m_oNotificationService: NotificationsDialogsService,
    private m_oRouter: Router,
  ) {
  }

  ngOnInit() {
    this.m_oActiveRoute.queryParams.subscribe((params) => {
      this.m_sConfirmationCode = params['code'];
      this.m_sNewEmail = params['mail'];
    });
  }


  ngOnDestroy() {
    this.m_oDestroy$.next();
    this.m_oDestroy$.complete();
  }

  confirmEmailChange() {
    if (
      !FadeoutUtils.utilsIsStrNullOrEmpty(this.m_sConfirmationCode) &&
      !FadeoutUtils.utilsIsStrNullOrEmpty(this.m_sNewEmail)
    ) {
      if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oConstantService.m_oUser)) {
        this.m_oUserService.getUser().pipe(takeUntil(this.m_oDestroy$)).subscribe({
          next: (oUser) => {
            let oConfirmationChangeEmailRequest: ConfirmEmailChangeViewModel = {
              oldEmail: oUser.email,
              newEmail: this.m_sNewEmail,
              confirmationCode: this.m_sConfirmationCode
            }
            this.m_oUserService.confirmNewEmail(oConfirmationChangeEmailRequest).pipe(takeUntil(this.m_oDestroy$)).subscribe({
              next: (oResponse) => {
                this.m_oRouter.navigateByUrl('login');
                this.m_oNotificationService.openSnackBar(
                  'Thank you for confirming your request! Your email has been successfully updated. You can now log in with your new email.',
                  'Success',
                  'success'
                );

              },
              error: (oError) => {
                console.error(oError)
              }
            })
          }
        })
      } else {
        let oConfirmationChangeEmailRequest: ConfirmEmailChangeViewModel = {
          oldEmail: this.m_oConstantService.m_oUser.email,
          newEmail: this.m_sNewEmail,
          confirmationCode: this.m_sConfirmationCode
        }
        this.m_oUserService.confirmNewEmail(oConfirmationChangeEmailRequest).pipe(takeUntil(this.m_oDestroy$)).subscribe({
          next: (oResponse) => {
            this.m_oRouter.navigateByUrl('login');
            this.m_oNotificationService.openSnackBar(
              'Thank you for confirming your request! Your email has been successfully updated. You can now log in with your new email.',
              'Success',
              'success'
            );

          },
          error: (oError) => {
            console.error(oError)
          }
        })
      }
    } else {
      this.m_oNotificationService.openSnackBar(
        'Please make a request to change email from an existing RISE account.',
        'Error',
        'danger'
      );

    }

  }

}
