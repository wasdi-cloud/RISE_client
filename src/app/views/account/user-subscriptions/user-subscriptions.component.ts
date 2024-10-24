import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { BuyNewSubscriptionComponent } from './buy-new-subscription/buy-new-subscription.component';
import { MatDialog } from '@angular/material/dialog';
import { RiseButtonComponent } from '../../../components/rise-button/rise-button.component';
import { RiseCrudTableComponent } from '../../../components/rise-crud-table/rise-crud-table.component';
import { RiseTextInputComponent } from '../../../components/rise-text-input/rise-text-input.component';
import { RiseTextareaInputComponent } from '../../../components/rise-textarea-input/rise-textarea-input.component';
import { SubscriptionEditorComponent } from './subscription-editor/subscription-editor.component';

import { ConstantsService } from '../../../services/constants.service';
import { SubscriptionService } from '../../../services/api/subscription.service';

import { SubscriptionViewModel } from '../../../models/SubscriptionViewModel';

@Component({
  selector: 'user-subscriptions',
  standalone: true,
  imports: [
    BuyNewSubscriptionComponent,
    CommonModule,
    TranslateModule,
    RiseButtonComponent,
    RiseCrudTableComponent,
    RiseTextareaInputComponent,
    RiseTextInputComponent,
  ],
  templateUrl: './user-subscriptions.component.html',
  styleUrl: './user-subscriptions.component.css',
})
export class UserSubscriptionsComponent implements OnInit {
  @Input() m_oOrganizationId: string = '';

  m_bShowBuySub: boolean = false;

  m_asTableHeadings: Array<string> = [];

  // For each line RISE show:
  // Subscription Name
  // Subscription Type
  // Buy Date
  // Expiry Date
  // HQ Operator can view the details of a Subscription
  // RISE shows the details of the subscription:
  // Subscription Name
  // Subscription Type
  // Buy Date
  // Expiry Date
  // Payment type (year/month)
  // Price
  // HQ Operator can click the Buy New Subscription button
  // See UC_095

  m_aoSubscriptions: Array<SubscriptionViewModel> = [];
  constructor(
    private m_oConstantsService: ConstantsService,
    private m_oDialog: MatDialog,
    private m_oSubscriptionService: SubscriptionService
  ) {}

  ngOnInit() {
    this.getSubscriptions();
  }

  /**
   * RISE show by default a list of the active subscriptions
   */
  getSubscriptions() {
    this.m_oSubscriptionService.getSubscriptionsList(true).subscribe({
      next: (oResponse) => {
        if (!oResponse) {
          return;
        } else {
          this.m_aoSubscriptions = oResponse;
          this.m_asTableHeadings = Object.keys(this.m_aoSubscriptions[0]);
        }
      },
      error: (oError) => {},
    });
  }

  preppedDates(oResponse): Array<SubscriptionViewModel> {
    let aoSubscriptions = oResponse.map((oSubscription) => {
      oSubscription.buyDate = new Date(oSubscription.buyDate).toDateString();
      oSubscription.expireDate = new Date(
        oSubscription.expireDate
      ).toDateString();
      return oSubscription;
    });
    return aoSubscriptions;
  }

  openEditor(oEvent) {
    console.log(oEvent);
    let oDialog = this.m_oDialog.open(SubscriptionEditorComponent, {
      data: { subscription: oEvent, isEditing: false },
      width: '500px',
    });
    oDialog.afterClosed().subscribe((bResult) => {
      if (bResult === true) {
        this.getSubscriptions();
      }
    });
  }

  getOrganization() {}

  /**
   * HQ Operator can change the filter of Subscriptions adding also expired subscriptions
   */
  filterSubscriptions() {}

  /**
   * HQ Operator can view the details of a Subscription
   */
  openSubscriptionInfo() {}

  /**
   * HQ Operator can click the Buy New Subscription button
   */
  openBuyNewSub(bInput: boolean) {
    this.m_bShowBuySub = bInput;
  }
}
