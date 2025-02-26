import {Component, Input, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';

import {BuyNewSubscriptionComponent} from './buy-new-subscription/buy-new-subscription.component';
import {MatDialog} from '@angular/material/dialog';
import {RiseButtonComponent} from '../../../components/rise-button/rise-button.component';
import {SubscriptionEditorComponent} from './subscription-editor/subscription-editor.component';

import {ConstantsService} from '../../../services/constants.service';
import {SubscriptionService} from '../../../services/api/subscription.service';

import {SubscriptionViewModel} from '../../../models/SubscriptionViewModel';
import {MatTooltip} from '@angular/material/tooltip';
import {NotificationsDialogsService} from '../../../services/notifications-dialogs.service';
import {SubscriptionTypeViewModel} from '../../../models/SubscriptionTypeViewModel';
import FadeoutUtils from '../../../shared/utilities/FadeoutUtils';
import {RiseDropdownComponent} from "../../../components/rise-dropdown/rise-dropdown.component";
import {UserRole} from "../../../models/UserRole";
import {environment} from "../../../../environments/environments";
import {UserService} from "../../../services/api/user.service";

@Component({
  selector: 'user-subscriptions',
  standalone: true,
  imports: [
    BuyNewSubscriptionComponent,
    CommonModule,
    TranslateModule,
    RiseButtonComponent,
    MatTooltip,
    RiseDropdownComponent,
  ],
  templateUrl: './user-subscriptions.component.html',
  styleUrl: './user-subscriptions.component.css',
})
export class UserSubscriptionsComponent implements OnInit {
  @Input() m_sOrganizationId: string = '';

  m_bShowBuySub: boolean = false;


  m_aoSubscriptionsToShow: Array<SubscriptionViewModel> = [];
  m_aoAllSubscriptions: Array<SubscriptionViewModel> = [];
  m_aoSubtypes: Array<SubscriptionTypeViewModel> = [];
  m_asSubAvailabilities: Array<any> = [
    {name: 'All', value: 'all'}, {name: 'Expired', value: 'expired'}, {name: 'Valid', value: 'valid'}]


  constructor(
    private m_oConstantsService: ConstantsService,
    private m_oDialog: MatDialog,
    private m_oNotificationService: NotificationsDialogsService,
    private m_oSubscriptionService: SubscriptionService,
    private m_oUserService: UserService
  ) {
  }

  ngOnInit() {
    this.getSubscriptions();
  }

  /**
   * RISE show by default a list of the active subscriptions
   */
  getSubscriptions() {
    this.m_oSubscriptionService.getSubscriptionsList(false).subscribe({
      next: (oResponse) => {
        if (!oResponse) {
          return;
        } else {
          console.log(oResponse)
          this.m_aoSubscriptionsToShow = oResponse;
          this.m_aoAllSubscriptions = this.m_aoSubscriptionsToShow;
          this.getSubTypes();
        }
      },
      error: (oError) => {
      },
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

  getSubTypes() {
    this.m_oSubscriptionService.getSubscriptionTypes().subscribe({
      next: (oResponse) => {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {
          return;
        }
        this.m_aoSubtypes = oResponse;
        this.initSubTypeNames();
      },
      error: (oError) => {
      },
    });
  }

  openEditor(oEvent,isEditing) {
    let oDialog = this.m_oDialog.open(SubscriptionEditorComponent, {
      data: {subscription: oEvent, isEditing: isEditing},
    });
    oDialog.afterClosed().subscribe((bResult) => {
      if (bResult === true) {
        this.getSubscriptions();
      }
    });
  }


  /**
   * HQ Operator can change the filter of Subscriptions adding also expired subscriptions
   */
  filterSubscriptions(event) {
    let sAvailability = event.value.value;
    if (sAvailability === 'all') {
      this.getSubscriptions();
    } else if (sAvailability === 'expired') {
      let iDateNow = Date.now();

      this.m_aoSubscriptionsToShow = this.m_aoAllSubscriptions.filter(s => s.expireDate < iDateNow);
    } else if (sAvailability === 'valid') {
      let iDateNow = Date.now();
      this.m_aoSubscriptionsToShow = this.m_aoAllSubscriptions.filter(s => s.expireDate >= iDateNow);
    }
  }


  /**
   * HQ Operator can click the Buy New Subscription button
   */
  openBuyNewSub(bInput: boolean) {
    if(this.canBuyNewSub()){
      this.m_oDialog.open(BuyNewSubscriptionComponent).afterClosed().subscribe(() => {
        this.getSubscriptions();
      });
    }
  }
  canBuyNewSub(){
    if (environment.isTestEnvironment) {
      if (this.m_aoAllSubscriptions.length < 1) {
        return true;
      } else {
        this.m_oNotificationService.openSnackBar("For RISE Limited edition , you can only buy one subscription", 'Buy New Subscription', 'danger');
        return false;
      }
    } else {
      return true;
    }
  }
  deleteSubscription(oSubscription: SubscriptionViewModel) {
    this.m_oNotificationService
      .openConfirmationDialog(
        'Are you sure you want to delete this subscription?',
        'alert'
      )
      .subscribe((bResult) => {
        if (!bResult) {
          return;
        }
        // TODO: Add delete subscription function
      });
  }

  initSubTypeNames() {
    this.m_aoSubscriptionsToShow.map((oSubscription) => {
      this.m_aoSubtypes.forEach((oType) => {
        oSubscription.type === oType.stringCode
          ? (oSubscription.type = oType.stringCode.slice(8) + ' Location(s)')
          : '';
      });
    });
  }

  isUserAbleToBuy() {
    //todo add translation
    let oUser = this.m_oConstantsService.getUser()
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oUser)) {
      this.m_oUserService.getUser().subscribe({
        next:(oResponse)=>{
          this.m_oConstantsService.setUser(oResponse);
          return oResponse.role != UserRole.FIELD;

        }
      })
    }else{
      if (this.m_oConstantsService.getUserRole() == UserRole.FIELD) {
        return false;
      }
    }

    return true;
  }

  getPaymentClass(buySuccess: boolean): string {
    return buySuccess ? 'payment-badge-paid' : 'payment-badge-not-paid';
  }

  getInvoice(oSubscription: SubscriptionViewModel) {
    if(oSubscription.id){
      this.m_oSubscriptionService.getStripeInvoice(oSubscription.id).subscribe({
        next:(oResponse)=>{
          const link = document.createElement('a');
          link.href = oResponse;
          link.target = '_blank'; // Open in a new tab
          link.download = 'invoice.pdf'; // Suggest a filename
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        },error:(oError)=>{
          console.error('Error downloading invoice:', oError);
        }
      })
    }
  }
}
