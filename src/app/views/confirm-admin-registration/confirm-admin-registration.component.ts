import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../services/api/auth.service';
import { NotificationsDialogsService } from '../../services/notifications-dialogs.service';

import { RiseButtonComponent } from '../../components/rise-button/rise-button.component';
import { RiseToolbarComponent } from '../../components/rise-toolbar/rise-toolbar.component';

import { RiseUtils } from '../../shared/utilities/RiseUtils';
import FadeoutUtils from '../../shared/utilities/FadeoutUtils';

@Component({
  selector: 'app-confirm-registration',
  standalone: true,
  imports: [RiseButtonComponent, RiseToolbarComponent],
  templateUrl: './confirm-admin-registration.component.html',
  styleUrl: './confirm-admin-registration.component.css',
})
export class ConfirmAdminRegistrationComponent implements OnInit {
  m_sConfirmationCode: string;
  m_sUserId: string;

  constructor(
    private m_oActiveRoute: ActivatedRoute,
    private m_oAuthService: AuthService,
    private m_oNotificationService: NotificationsDialogsService,
    private m_oRouter: Router,
  ) {}

  ngOnInit() {
    this.m_oActiveRoute.queryParams.subscribe((params) => {
      this.m_sConfirmationCode = params['code'];
      this.m_sUserId = params['usr'];
    });
  }

  confirmRegistration() {
    if (
      !FadeoutUtils.utilsIsStrNullOrEmpty(this.m_sConfirmationCode) &&
      !FadeoutUtils.utilsIsStrNullOrEmpty(this.m_sUserId)
    )
      this.m_oAuthService
        .confirmAdm(this.m_sConfirmationCode, this.m_sUserId)
        .subscribe({
          next: (oResponse) => {
            this.m_oRouter.navigateByUrl('login');
            this.m_oNotificationService.openSnackBar(
              'Thank you for confirming your email! Your account has been successfully verified. You can now log in and start exploring.',
              'Success',
              'success'
            );
          },
          error: (oError) => {
            this.m_oNotificationService.openSnackBar(
              'Something is wrong',
              'Error',
              'danger'
            );
          },
        });
  }
}
