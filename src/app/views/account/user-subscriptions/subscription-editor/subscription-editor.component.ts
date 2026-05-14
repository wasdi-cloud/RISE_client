import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SubscriptionService } from '../../../../services/api/subscription.service';
import { SubscriptionViewModel } from '../../../../models/SubscriptionViewModel';
import { RiseButtonComponent } from '../../../../components/rise-button/rise-button.component';
import { RiseTextInputComponent } from '../../../../components/rise-text-input/rise-text-input.component';
import { RiseTextareaInputComponent } from '../../../../components/rise-textarea-input/rise-textarea-input.component';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SubscriptionTypeViewModel } from '../../../../models/SubscriptionTypeViewModel';
import { NotificationsDialogsService } from '../../../../services/notifications-dialogs.service';
import FadeoutUtils from '../../../../shared/utilities/FadeoutUtils';
import {Subject, takeUntil} from "rxjs";

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
export class SubscriptionEditorComponent implements OnInit,OnDestroy {
  m_sSubscriptionHeader: string = '';
  m_aoSubTypes: Array<SubscriptionTypeViewModel> = [];
  private m_oDestroy$ = new Subject<void>();

  private m_oPluginTranslationMap: {[sPluginId: string]: string} = {
    rise_flood_plugin: 'PLUGIN_NAMES.PLUGIN_FLOOD',
    rise_drought_plugin: 'PLUGIN_NAMES.PLUGIN_DROUGHT',
    rise_building_plugin: 'PLUGIN_NAMES.PLUGIN_BUILDINGS',
    rise_impact_plugin: 'PLUGIN_NAMES.PLUGIN_IMPACTS',
    rise_rain_plugin: 'PLUGIN_NAMES.PLUGIN_RAIN',
    rise_lst_plugin: 'PLUGIN_NAMES.PLUGIN_LST',
    rise_active_fire_plugin: 'PLUGIN_NAMES.PLUGIN_ACTIVE_FIRE',
    rise_pollutant_plugin: 'PLUGIN_NAMES.PLUGIN_POLLUTANT',
  };

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

  isExpired(): boolean {
    if (!this.m_oSubscription?.expireDate) {
      return false;
    }

    return Number(this.m_oSubscription.expireDate) < Date.now();
  }

  getStatusLabelKey(): string {
    if (this.isExpired()) {
      return 'SUBSCRIPTIONS.EXPIRED';
    }

    return this.m_oSubscription?.buySuccess ? 'SUBSCRIPTIONS.PAID' : 'SUBSCRIPTIONS.NOT_PAID';
  }

  getStatusIcon(): string {
    if (this.isExpired()) {
      return 'event_busy';
    }

    return this.m_oSubscription?.buySuccess ? 'check_circle' : 'pending';
  }

  getStatusClass(): string {
    if (this.isExpired()) {
      return 'payment-badge-expired';
    }

    return this.m_oSubscription?.buySuccess ? 'payment-badge-paid' : 'payment-badge-not-paid';
  }

  getTranslatedPluginName(sPluginId: string): string {
    if (!sPluginId) {
      return '';
    }

    const sTranslationKey = this.m_oPluginTranslationMap[sPluginId];
    if (sTranslationKey) {
      return this.m_oTranslate.instant(sTranslationKey);
    }

    return sPluginId
      .replace(/^rise_/, '')
      .replace(/_plugin$/, '')
      .split('_')
      .map((sWord) => sWord.charAt(0).toUpperCase() + sWord.slice(1))
      .join(' ');
  }
}
