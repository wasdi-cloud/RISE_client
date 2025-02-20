import {Component, EventEmitter, Inject, Input, OnInit, Output,} from '@angular/core';
import {SubscriptionService} from '../../../../services/api/subscription.service';
import {SubscriptionTypeViewModel} from '../../../../models/SubscriptionTypeViewModel';
import {RiseDropdownComponent} from '../../../../components/rise-dropdown/rise-dropdown.component';
import {RiseButtonComponent} from '../../../../components/rise-button/rise-button.component';
import {RiseTextInputComponent} from '../../../../components/rise-text-input/rise-text-input.component';
import {RiseTextareaInputComponent} from '../../../../components/rise-textarea-input/rise-textarea-input.component';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {CommonModule} from '@angular/common';
import {PluginService} from '../../../../services/api/plugin.service';
import {PluginViewModel} from '../../../../models/PluginViewModel';
import {NotificationsDialogsService} from '../../../../services/notifications-dialogs.service';
import {SubscriptionViewModel} from '../../../../models/SubscriptionViewModel';
import {ConstantsService} from '../../../../services/constants.service';

import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {UserService} from '../../../../services/api/user.service';
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'buy-new-subscription',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    RiseButtonComponent,
    RiseTextInputComponent,
    RiseTextareaInputComponent,
    RiseDropdownComponent,
    FormsModule,
  ],
  templateUrl: './buy-new-subscription.component.html',
  styleUrl: './buy-new-subscription.component.css',
})
export class BuyNewSubscriptionComponent implements OnInit {
  @Input() m_sOrganizationId: string = '';

  @Output() m_oEmitBack: EventEmitter<boolean> = new EventEmitter<boolean>(
    null
  );
  m_oSubInput: SubscriptionViewModel = {} as SubscriptionViewModel;

  m_aoSubTypes: Array<SubscriptionTypeViewModel> = [];

  m_asSubTypeNames: Array<string> = [];

  m_sSelectedSubType:string=""

  m_oSelectedType: SubscriptionTypeViewModel = null;

  m_aoPluginTypes: Array<PluginViewModel> = [];

  m_aoPluginNames: Array<string> = [];

  m_asSelectedPlugins: Array<string> = [];

  m_iComputedPrice: number = 0;

  m_aoPaymentTypes: Array<{ name: string; value: string }> = [];

  m_asPaymentTypeNames: Array<string> = [];

  m_sPaymentMethod:string='credit';
  m_oSelectedPaymentType = null;
  m_sSelectedPaymentTypeName:string = "";

  m_iStep: number = 1; // Step 1 initially

  goToNextStep() {
    this.m_iStep = 2;
  }

  goToPreviousStep() {
    this.m_iStep = 1;
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) private m_oData: any,
    private m_oConstantsService: ConstantsService,
    private m_oDialogRef: MatDialogRef<BuyNewSubscriptionComponent>,
    private m_oNotificationService: NotificationsDialogsService,
    private m_oPluginService: PluginService,
    private m_oSubscriptionService: SubscriptionService,
    private m_oTranslateService: TranslateService,
    private m_oUserService: UserService
  ) {}

  ngOnInit(): void {
    this.getSubTypes();
    this.getPlugins();
    this.getPaymentTypes();
    this.m_sOrganizationId = this.getOrganizationId();
  }

  getSubTypes() {
    this.m_oSubscriptionService.getSubscriptionTypes().subscribe({
      next: (oResponse) => {
        this.m_aoSubTypes = oResponse;
        this.initSubTypeNames();
      },
      error: (oError) => {
        console.error(oError);
      },
    });
  }

  getPlugins() {
    this.m_oPluginService.getPluginsList().subscribe({
      next: (oResponse) => {
        if (!oResponse) {
          this.m_oNotificationService.openInfoDialog(
            'Could not load plugins',
            'error',
            'Error'
          );
        } else {
          this.m_aoPluginTypes = oResponse;
          this.initPluginNames();
        }
      },
      error: (oError) => {
        console.error(oError);
      },
    });
  }

  initSubTypeNames() {
    this.m_asSubTypeNames = this.m_aoSubTypes.map(
      (oSubType) => oSubType.stringCode.slice(8) + ' Location(s)'
    );
  }

  initPluginNames() {
    this.m_aoPluginNames = this.m_aoPluginTypes.map((oPlugin) => oPlugin.name);
  }

  handleSubTypeSelect(oEvent) {
    let sSelectedType = oEvent.value;
    this.m_aoSubTypes.forEach((oType) => {
      if (oType.stringCode.includes(sSelectedType.slice(0, -12))) {
        this.m_oSelectedType = oType;
        this.m_sSelectedSubType=sSelectedType;
      }
    });
  }

  handlePluginSelect(oEvent) {
    let asSelectedPlugins = oEvent.value;
    asSelectedPlugins.forEach((sPlugin) => {
      this.m_aoPluginTypes.forEach((oPlugin) => {
        if (oPlugin.name === sPlugin) {
          this.m_asSelectedPlugins.push(oPlugin.id);
        }
      });
      this.m_oSubInput.plugins = this.m_asSelectedPlugins;
    });
  }

  executePurchase() {
    let sSuccess: string = this.m_oTranslateService.instant(
      'SUBSCRIPTIONS.SUCCESS'
    );

    let sError: string = this.m_oTranslateService.instant(
      'SUBSCRIPTIONS.ERROR'
    );
    this.initSubscriptionInput();

    this.m_oSubscriptionService.buySubscription(this.m_oSubInput).subscribe({
      next: (oResponse) => {
        this.m_oNotificationService.openSnackBar(
          sSuccess,
          'Success',
          'success'
        );
        this.onDismiss();
      },
      error: (oError) => {
        this.m_oNotificationService.openInfoDialog(sError, 'danger');
      },
    });
  }

  initSubscriptionInput() {
    this.m_oSubInput.type = this.m_oSelectedType.stringCode;
    this.m_oSubInput.plugins = this.m_asSelectedPlugins;
    this.m_oSubInput.price = this.m_iComputedPrice;
    this.m_oSubInput.organizationId = this.m_sOrganizationId;
    this.m_oSubInput.paymentType = this.m_oSelectedPaymentType.value;
  }

  getComputedPrice() {
    this.initSubscriptionInput();
    this.m_oSubscriptionService
      .getSubscriptionPrice(this.m_oSubInput)
      .subscribe({
        next: (oResponse) => {
          if (!oResponse) {
            this.m_oNotificationService.openInfoDialog(
              'Could not get the computed price for these inputs.',
              'error',
              'Error'
            );
            return;
          } else {
            this.m_iComputedPrice = oResponse.price;
          }
        },
        error: (oError) => {
          console.error(oError);
          this.m_oNotificationService.openInfoDialog(
            'Could not get the computed price for these inputs.',
            'error',
            'Error'
          );
        },
      });
  }

  openBuyNewSub(bInput: boolean) {
    this.m_oEmitBack.emit(bInput);
  }

  handlePaymentTypeSelect(oPaymentType: any) {
    let sTypeName = oPaymentType.value;
    console.log(oPaymentType.value);
    this.m_sSelectedPaymentTypeName=oPaymentType.value
    this.m_oSelectedPaymentType = this.m_aoPaymentTypes.find(
      (oType) => oType.name === sTypeName
    );

  }

  getPaymentTypes() {
    this.m_aoPaymentTypes = [
      { name: 'Year', value: 'YEAR' },
      { name: 'Month', value: 'MONTH' },
    ];

    this.m_asPaymentTypeNames = this.m_aoPaymentTypes.map(
      (oType) => oType.name
    );
  }

  enablePurchaseBtn(): boolean {
    if (!this.m_oSubInput.name) {
      return false;
    }
    if (
      !this.m_oSelectedType ||
      !this.m_asSelectedPlugins ||
      !this.m_oSelectedPaymentType
    ) {
      return false;
    }

    if (!this.m_iComputedPrice) {
      return false;
    }

    return true;
  }

  onDismiss() {
    this.m_oDialogRef.close();
  }

  private getOrganizationId() {
    let sOrganizationId: string = '';
    if (this.m_oData?.organizationId) {
      sOrganizationId = this.m_oData.organizationId;
    } else {
      sOrganizationId = this.m_oConstantsService.getUser()?.organizationId;
    }
    return sOrganizationId;
  }

  enableNextBtn() {
    if (!this.m_oSubInput.name) {
      return false;
    }
    if (
      !this.m_oSelectedType ||
      !this.m_asSelectedPlugins
    ) {
      return false;
    }


    return true;
  }
}
