import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {FormsModule} from '@angular/forms';

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
import {Subject, takeUntil} from "rxjs";

type SubscriptionSortColumn =
  | 'name'
  | 'type'
  | 'date'
  | 'price'
  | 'expireDate'
  | 'status';

type SubscriptionSortDirection = 'asc' | 'desc';

@Component({
  selector: 'user-subscriptions',
  standalone: true,
  imports: [
    BuyNewSubscriptionComponent,
    CommonModule,
    FormsModule,
    TranslateModule,
    RiseButtonComponent,
    MatTooltip,
  ],
  templateUrl: './user-subscriptions.component.html',
  styleUrl: './user-subscriptions.component.css',
})
export class UserSubscriptionsComponent implements OnInit,OnDestroy {
  @Input() m_sOrganizationId: string = '';
  private m_oDestroy$ = new Subject<void>();
  m_bShowBuySub: boolean = false;


  m_aoSubscriptionsToShow: Array<SubscriptionViewModel> = [];
  m_aoAllSubscriptions: Array<SubscriptionViewModel> = [];
  m_aoSubtypes: Array<SubscriptionTypeViewModel> = [];
  m_asSubAvailabilities: Array<any> = [
    {name: 'All', value: 'all'}, {name: 'Expired', value: 'expired'}, {name: 'Valid', value: 'valid'}]

  m_sAvailabilityFilter: 'all' | 'expired' | 'valid' = 'all';
  m_sSortColumn: SubscriptionSortColumn = 'date';
  m_sSortDirection: SubscriptionSortDirection = 'desc';

  m_oColumnFilters = {
    name: '',
    type: '',
    date: '',
    price: '',
    expireDate: '',
    status: 'all',
  };


  constructor(
    private m_oConstantsService: ConstantsService,
    private m_oDialog: MatDialog,
    private m_oNotificationService: NotificationsDialogsService,
    private m_oSubscriptionService: SubscriptionService,
    private m_oUserService: UserService,
    private m_oTranslate: TranslateService,
  ) {
  }

  ngOnInit() {
    this.getSubscriptions();
  }

  ngOnDestroy() {
    this.m_oDestroy$.next();
    this.m_oDestroy$.complete();
  }

  /**
   * RISE show by default a list of the active subscriptions
   */
  getSubscriptions() {
    this.m_oSubscriptionService.getSubscriptionsList(false).pipe(takeUntil(this.m_oDestroy$)).subscribe({
      next: (oResponse) => {
        if (!oResponse) {
          return;
        }
        else {
          this.m_aoAllSubscriptions = [...oResponse];
          this.m_aoSubscriptionsToShow = [...oResponse];
          this.getSubTypes();
        }
      },
      error: (oError) => {
        console.error(oError)
        this.m_oNotificationService.openInfoDialog(
          "Could not get Subscriptions",
          'danger',
          "Error"
        )
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
    this.m_oSubscriptionService.getSubscriptionTypes().pipe(takeUntil(this.m_oDestroy$)).subscribe({
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

  openSubscriptionProperties(oEvent: SubscriptionViewModel) {
    let oDialog = this.m_oDialog.open(SubscriptionEditorComponent, {
      data: {subscription: oEvent},
    });
    oDialog.afterClosed().subscribe((bResult) => {
      if (bResult === true) {
        this.getSubscriptions();
      }
    });
  }

  /**
   * HQ Operator can click the Buy New Subscription button
   */
  openBuyNewSub(bInput: boolean) {
    if(this.canBuyNewSub()){
      this.m_oDialog.open(BuyNewSubscriptionComponent, {
        maxWidth: '90vw',
        maxHeight: '90vh',
        width: '90vw',
        height: '80vh',
        disableClose: true,
        panelClass: 'full-screen-dialog'
      }).afterClosed().subscribe(() => {
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
    const sArea = this.m_oTranslate.instant('COMMON.AREA');
    const sAreas = this.m_oTranslate.instant('COMMON.AREAS');
    const sMonth = this.m_oTranslate.instant('COMMON.MONTH');
    const sMonths = this.m_oTranslate.instant('COMMON.MONTHS');

    this.m_aoAllSubscriptions.map((oSubscription) => {

      let bIsQuarterly = false;

      if (oSubscription.type.includes("_QUARTER")) {  
        bIsQuarterly = true;
      }

      oSubscription.type = String(oSubscription.areaCount) + " " + (oSubscription.areaCount === 1 ? sArea : sAreas);

      if (bIsQuarterly) {
        oSubscription.type += ` - 1 ${sMonth}`;
      }
      else {
        oSubscription.type += ` - 12 ${sMonths}`;
      }
    });

    this.applyTableState();
  }

  toggleSort(sColumn: SubscriptionSortColumn): void {
    if (this.m_sSortColumn === sColumn) {
      this.m_sSortDirection = this.m_sSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.m_sSortColumn = sColumn;
      this.m_sSortDirection = 'asc';
    }

    this.applyTableState();
  }

  getSortIcon(sColumn: SubscriptionSortColumn): string {
    if (this.m_sSortColumn !== sColumn) {
      return 'unfold_more';
    }

    return this.m_sSortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward';
  }

  onColumnFiltersChange(): void {
    this.applyTableState();
  }

  private applyTableState(): void {
    let aoFiltered = [...this.m_aoAllSubscriptions];

    if (this.m_sAvailabilityFilter === 'expired') {
      aoFiltered = aoFiltered.filter((oSub) => this.isExpired(oSub));
    } else if (this.m_sAvailabilityFilter === 'valid') {
      aoFiltered = aoFiltered.filter((oSub) => !this.isExpired(oSub));
    }

    const sNameFilter = this.m_oColumnFilters.name.trim().toLowerCase();
    if (sNameFilter) {
      aoFiltered = aoFiltered.filter((oSub) => (oSub.name || '').toLowerCase().includes(sNameFilter));
    }

    const sTypeFilter = this.m_oColumnFilters.type.trim().toLowerCase();
    if (sTypeFilter) {
      aoFiltered = aoFiltered.filter((oSub) => (oSub.type || '').toLowerCase().includes(sTypeFilter));
    }

    if (this.m_oColumnFilters.date) {
      aoFiltered = aoFiltered.filter((oSub) => this.formatDateForFilter(this.getDisplayDate(oSub)) === this.m_oColumnFilters.date);
    }

    const sPriceFilter = this.m_oColumnFilters.price.trim().toLowerCase();
    if (sPriceFilter) {
      aoFiltered = aoFiltered.filter((oSub) => this.getDisplayPrice(oSub).toLowerCase().includes(sPriceFilter));
    }

    if (this.m_oColumnFilters.expireDate) {
      aoFiltered = aoFiltered.filter((oSub) => this.formatDateForFilter(oSub.expireDate) === this.m_oColumnFilters.expireDate);
    }

    if (this.m_oColumnFilters.status !== 'all') {
      aoFiltered = aoFiltered.filter((oSub) => this.getStatusValue(oSub) === this.m_oColumnFilters.status);
    }

    const iDirection = this.m_sSortDirection === 'asc' ? 1 : -1;
    aoFiltered.sort((oA, oB) => this.compareSubscriptions(oA, oB) * iDirection);

    this.m_aoSubscriptionsToShow = aoFiltered;
  }

  private compareSubscriptions(oA: SubscriptionViewModel, oB: SubscriptionViewModel): number {
    switch (this.m_sSortColumn) {
      case 'name':
        return (oA.name || '').localeCompare(oB.name || '');
      case 'type':
        return (oA.type || '').localeCompare(oB.type || '');
      case 'date':
        return this.toTimestamp(this.getDisplayDate(oA)) - this.toTimestamp(this.getDisplayDate(oB));
      case 'price':
        return (oA.price || 0) - (oB.price || 0);
      case 'expireDate':
        return this.toTimestamp(oA.expireDate) - this.toTimestamp(oB.expireDate);
      case 'status':
        return this.getStatusValue(oA).localeCompare(this.getStatusValue(oB));
      default:
        return 0;
    }
  }

  private toTimestamp(oDate: number | Date): number {
    if (!oDate) {
      return 0;
    }

    if (typeof oDate === 'number') {
      return oDate;
    }

    const iTime = new Date(oDate).getTime();
    return Number.isNaN(iTime) ? 0 : iTime;
  }

  private formatDateForFilter(oDate: number | Date): string {
    const iTs = this.toTimestamp(oDate);
    if (!iTs) {
      return '';
    }

    return new Date(iTs).toISOString().slice(0, 10);
  }

  getDisplayDate(oSubscription: SubscriptionViewModel): number | Date {
    return oSubscription.buyDate || oSubscription.creationDate;
  }

  getDisplayPrice(oSubscription: SubscriptionViewModel): string {
    if (oSubscription.price === null || oSubscription.price === undefined) {
      return 'N/A';
    }

    const sCurrency = oSubscription.currency || 'EUR';
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: sCurrency,
      maximumFractionDigits: 2,
    }).format(oSubscription.price);
  }

  private getStatusValue(oSubscription: SubscriptionViewModel): 'expired' | 'paid' | 'not_paid' {
    if (this.isExpired(oSubscription)) {
      return 'expired';
    }

    return oSubscription.buySuccess ? 'paid' : 'not_paid';
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

  isExpired(oSubscription: SubscriptionViewModel): boolean {
    if (!oSubscription?.expireDate) {
      return false;
    }

    return Number(oSubscription.expireDate) < Date.now();
  }

  getPaymentClass(oSubscription: SubscriptionViewModel): string {
    if (this.isExpired(oSubscription)) {
      return 'payment-badge-expired';
    }

    return oSubscription.buySuccess ? 'payment-badge-paid' : 'payment-badge-not-paid';
  }

  getStatusLabelKey(oSubscription: SubscriptionViewModel): string {
    if (this.isExpired(oSubscription)) {
      return 'SUBSCRIPTIONS.EXPIRED';
    }

    return oSubscription.buySuccess ? 'SUBSCRIPTIONS.PAID' : 'SUBSCRIPTIONS.NOT_PAID';
  }

  getStatusIcon(oSubscription: SubscriptionViewModel): string {
    if (this.isExpired(oSubscription)) {
      return 'event_busy';
    }

    return oSubscription.buySuccess ? 'check_circle' : 'pending';
  }

  getInvoice(oSubscription: SubscriptionViewModel) {
    if(oSubscription.id){
      this.m_oSubscriptionService.getStripeInvoice(oSubscription.id).pipe(takeUntil(this.m_oDestroy$)).subscribe({
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
