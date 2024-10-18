import { Component, Input, OnInit } from '@angular/core';
import { SubscriptionService } from '../../../services/api/subscription.service';
import { SubscriptionViewModel } from '../../../models/SubscriptionViewModel';
import { TranslateModule } from '@ngx-translate/core';
import { RiseButtonComponent } from '../../../components/rise-button/rise-button.component';
import { CommonModule } from '@angular/common';
import { RiseTextInputComponent } from '../../../components/rise-text-input/rise-text-input.component';
import { RiseTextAreaInputComponent } from '../../../components/rise-textarea-input/rise-text-area-input.component';
import { BuyNewSubscriptionComponent } from './buy-new-subscription/buy-new-subscription.component';
import { ConstantsService } from '../../../services/constants.service';

@Component({
  selector: 'user-subscriptions',
  standalone: true,
  imports: [
    BuyNewSubscriptionComponent,
    CommonModule,
    TranslateModule,
    RiseButtonComponent,
    RiseTextAreaInputComponent,
    RiseTextInputComponent,
  ],
  templateUrl: './user-subscriptions.component.html',
  styleUrl: './user-subscriptions.component.css',
})
export class UserSubscriptionsComponent implements OnInit {
  @Input() m_oOrganizationId: string = '';

  m_bShowBuySub: boolean = false;

  //
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
        console.log(oResponse);
      },
      error: (oError) => {},
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
