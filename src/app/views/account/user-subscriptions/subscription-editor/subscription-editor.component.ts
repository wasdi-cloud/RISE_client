import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SubscriptionService } from '../../../../services/api/subscription.service';
import { SubscriptionViewModel } from '../../../../models/SubscriptionViewModel';
import { RiseButtonComponent } from '../../../../components/rise-button/rise-button.component';
import { RiseTextInputComponent } from '../../../../components/rise-text-input/rise-text-input.component';
import { RiseTextareaInputComponent } from '../../../../components/rise-textarea-input/rise-textarea-input.component';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SubscriptionTypeViewModel } from '../../../../models/SubscriptionTypeViewModel';
import { NotificationsDialogsService } from '../../../../services/notifications-dialogs.service';
import FadeoutUtils from '../../../../shared/utilities/FadeoutUtils';
import { RiseDateInputComponent } from '../../../../components/rise-date-input/rise-date-input.component';
import {Subject, takeUntil} from "rxjs";

@Component({
  selector: 'app-subscription-editor',
  standalone: true,
  imports: [
    RiseButtonComponent,
    RiseDateInputComponent,
    RiseTextInputComponent,
    RiseTextareaInputComponent,
    CommonModule,
    CurrencyPipe,
    TranslateModule,
  ],
  templateUrl: './subscription-editor.component.html',
  styleUrl: './subscription-editor.component.css',
})
export class SubscriptionEditorComponent implements OnInit,OnDestroy {
  m_bIsEditing: boolean = false;
  m_sSubscriptionHeader: string = '';
  m_aoSubTypes: Array<SubscriptionTypeViewModel> = [];
  m_sPrice: string = '';
  private m_oDestroy$ = new Subject<void>();

  m_oSubscription: SubscriptionViewModel = {} as SubscriptionViewModel;

  constructor(
    @Inject(MAT_DIALOG_DATA) private m_oData: any,
    private m_oDialogRef: MatDialogRef<SubscriptionEditorComponent>,
    private m_oNotificationService: NotificationsDialogsService,
    private m_oSubscriptionService: SubscriptionService,
    private m_oTranslate: TranslateService
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

  ngOnDestroy() {
    this.m_oDestroy$.next();
    this.m_oDestroy$.complete();
  }

  getSubscriptionTypes() {
    let sError = this.m_oTranslate.instant('SUBSCRIPTIONS.TYPE_ERROR');
    this.m_oSubscriptionService.getSubscriptionTypes().pipe(takeUntil(this.m_oDestroy$)).subscribe({
      next: (oResponse) => {
        if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {
          this.m_aoSubTypes = oResponse;
        }
      },
      error: (oError) => {
        this.m_oNotificationService.openInfoDialog(sError, 'danger');
      },
    });
  }

  getSubscriptionVM(sSubscriptionId: string) {
    let sError = this.m_oTranslate.instant('SUBSCRIPTIONS.ERROR_INFO');
    this.m_oSubscriptionService.getSubscriptionById(sSubscriptionId).pipe(takeUntil(this.m_oDestroy$)).subscribe({
      next: (oResponse) => {
        if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {
          this.m_oSubscription = oResponse;
          this.m_sPrice = this.m_oSubscription.price.toString();
        }
      },
      error: (oError) => {
        this.m_oNotificationService.openInfoDialog(sError, 'danger');
      },
    });
  }

  updateSubscription() {
    this.m_oSubscriptionService
      .updateSubscription(this.m_oSubscription)
      .pipe(takeUntil(this.m_oDestroy$))
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
          console.error(oError)
          this.m_oNotificationService.openInfoDialog(
            'Could not update subscription',
            'danger',
            'Error'
          );
        },
      });
  }

  onDismiss(bUpdated: boolean) {
    this.m_oDialogRef.close(bUpdated);
  }
}
