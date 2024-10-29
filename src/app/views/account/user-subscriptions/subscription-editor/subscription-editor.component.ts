import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SubscriptionService } from '../../../../services/api/subscription.service';
import { SubscriptionViewModel } from '../../../../models/SubscriptionViewModel';
import { RiseButtonComponent } from '../../../../components/rise-button/rise-button.component';
import { RiseTextInputComponent } from '../../../../components/rise-text-input/rise-text-input.component';
import { RiseTextareaInputComponent } from '../../../../components/rise-textarea-input/rise-textarea-input.component';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { SubscriptionTypeViewModel } from '../../../../models/SubscriptionTypeViewModel';
import { NotificationsDialogsService } from '../../../../services/notifications-dialogs.service';
import FadeoutUtils from '../../../../shared/utilities/FadeoutUtils';

@Component({
  selector: 'app-subscription-editor',
  standalone: true,
  imports: [
    RiseButtonComponent,
    RiseTextInputComponent,
    RiseTextareaInputComponent,
    CommonModule,
    TranslateModule,
  ],
  templateUrl: './subscription-editor.component.html',
  styleUrl: './subscription-editor.component.css',
})
export class SubscriptionEditorComponent implements OnInit {
  m_bIsEditing: boolean = false;
  m_sSubscriptionHeader: string = '';
  m_aoSubTypes: Array<SubscriptionTypeViewModel> = [];

  m_oSubscription: SubscriptionViewModel = {} as SubscriptionViewModel;

  constructor(
    @Inject(MAT_DIALOG_DATA) private m_oData: any,
    private m_oDialogRef: MatDialogRef<SubscriptionEditorComponent>,
    private m_oNotificationService: NotificationsDialogsService,
    private m_oSubscriptionService: SubscriptionService
  ) {}

  ngOnInit(): void {
    if (this.m_oData) {
      this.m_oSubscription = this.m_oData.subscription;
      this.m_sSubscriptionHeader = this.m_oData.subscription.name;
      this.m_bIsEditing = this.m_oData.isEditing;
    }
    if (this.m_oSubscription.id) {
      this.getSubscriptionVM(this.m_oSubscription.id);
    }
  }

  getSubscriptionTypes() {
    this.m_oSubscriptionService.getSubscriptionTypes().subscribe({
      next: (oResponse) => {
        if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {
          this.m_aoSubTypes = oResponse;
        }
      },
      error: (oError) => {},
    });
  }

  getSubscriptionVM(sSubscriptionId: string) {
    this.m_oSubscriptionService.getSubscriptionById(sSubscriptionId).subscribe({
      next: (oResponse) => {
        if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {
          console.log(oResponse);
          this.m_oSubscription = oResponse;
        }
      },
      error: (oError) => {},
    });
  }

  updateSubscription() {
    this.m_oSubscriptionService
      .updateSubscription(this.m_oSubscription)
      .subscribe({
        next: (oResponse) => {
          if (oResponse.status === 200) {
            this.m_oNotificationService.openInfoDialog(
              'Your subscription was updated',
              'success',
              'Success'
            );
            this.onDismiss(true);
          }
        },
        error: (oError) => {
          this.m_oNotificationService.openInfoDialog(
            'Could not update subscription',
            'error',
            'Error'
          );
        },
      });
  }

  onDismiss(bUpdated: boolean) {
    this.m_oDialogRef.close(bUpdated);
  }
}
